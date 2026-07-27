import { apiFetch, ApiError } from "./api-client";
import {
    DEFAULT_CHATBOT_FALLBACK,
    extractChatbotMetadata,
    normalizeAssistantResponse,
    parseChatbotPayload,
} from "./chatbotResponse";
import type { ChatbotMetadata, ChatbotSource } from "./chatbotResponse";
import { createSseEventParser } from "./chatbotSse";

export type { ChatbotMetadata, ChatbotSource };
export type { NormalizedAssistantResponse } from "./chatbotResponse";
export { extractChatbotAnswer, normalizeAssistantResponse } from "./chatbotResponse";

export type ChatbotStreamCallbacks = {
    onMetadata?: (metadata: Partial<ChatbotMetadata>) => void;
    onDelta: (text: string) => void;
    onDone: (metadata: Partial<ChatbotMetadata>) => void;
    onError: (message: string) => void;
};

type RecordValue = Record<string, unknown>;

const DEFAULT_AI_ERROR = "Hệ thống AI đang tạm thời không khả dụng.";
const NON_ANSWER_DELTAS = new Set([
    "success",
    "successful",
    "ok",
    "thanh cong",
    "thành công",
]);

const firstString = (value: RecordValue, ...keys: string[]) => {
    const key = keys.find(item => typeof value[item] === "string");

    return key ? String(value[key]).trim() : "";
};

const getNestedMessageContent = (value: RecordValue) => {
    const { message } = value;

    if (!message || typeof message !== "object" || Array.isArray(message)) {
        return "";
    }

    return firstString(
        message as RecordValue,
        "content",
        "answer",
        "text",
    );
};

const isRenderableDelta = (value: string) =>
    Boolean(value.trim()) && !NON_ANSWER_DELTAS.has(value.trim().toLowerCase());

const getHttpErrorMessage = (error: unknown) => {
    if (!(error instanceof ApiError)) {
        return error instanceof Error ? error.message : DEFAULT_AI_ERROR;
    }

    if (error.status === 400) {
        return "Câu hỏi không hợp lệ. Vui lòng kiểm tra lại nội dung.";
    }

    if (error.status === 401) {
        return "Phiên đăng nhập đã hết hạn. Vui lòng mở lại mini app.";
    }

    if (error.status === 429) {
        return error.retryAfter
            ? `Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${error.retryAfter} giây.`
            : "Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.";
    }

    if ([502, 503, 504].includes(error.status)) {
        return DEFAULT_AI_ERROR;
    }

    return error.message || DEFAULT_AI_ERROR;
};

const runTypewriterFallback = async (
    answer: string,
    signal: AbortSignal,
    onDelta: (text: string) => void,
) => {
    const words = answer.split(/(\s+)/);

    await words.reduce<Promise<void>>(async (previous, word) => {
        await previous;

        if (signal.aborted) {
            return;
        }

        onDelta(word);
        await new Promise<void>(resolve => {
            window.setTimeout(resolve, 12);
        });
    }, Promise.resolve());
};

const askChatbotFallback = async (
    question: string,
    signal: AbortSignal,
    callbacks: ChatbotStreamCallbacks,
) => {
    const response = await apiFetch(
        "/chatbot/ask",
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
            signal,
        },
        { auth: true },
    );
    const payload = await response.json().catch(() => null);
    const normalized = normalizeAssistantResponse(payload);

    callbacks.onMetadata?.(normalized.metadata);
    await runTypewriterFallback(normalized.content, signal, callbacks.onDelta);
    callbacks.onDone(normalized.metadata);
};

export const askChatbotStream = async (
    question: string,
    signal: AbortSignal,
    callbacks: ChatbotStreamCallbacks,
) => {
    let response: Response;

    try {
        response = await apiFetch(
            "/chatbot/ask/stream",
            {
                method: "POST",
                headers: {
                    Accept: "text/event-stream",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question }),
                signal,
            },
            { auth: true },
        );
    } catch (error) {
        if (error instanceof ApiError && [404, 405].includes(error.status)) {
            await askChatbotFallback(question, signal, callbacks);
            return;
        }

        throw new Error(getHttpErrorMessage(error));
    }

    const contentType = response.headers.get("Content-Type") || "";

    if (!response.body || contentType.includes("application/json")) {
        const payload = await response.json().catch(() => null);
        const normalized = normalizeAssistantResponse(payload);

        callbacks.onMetadata?.(normalized.metadata);
        await runTypewriterFallback(
            normalized.content,
            signal,
            callbacks.onDelta,
        );
        callbacks.onDone(normalized.metadata);
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let isDone = false;

    const parser = createSseEventParser(({ event, data }) => {
        const payload = parseChatbotPayload(data);

        if (event === "metadata") {
            callbacks.onMetadata?.(extractChatbotMetadata(payload));
            return false;
        }

        if (event === "delta" || event === "message") {
            const text =
                firstString(payload, "text", "delta", "content", "answer") ||
                getNestedMessageContent(payload);
            const normalizedText =
                text || normalizeAssistantResponse(payload).content;

            if (
                isRenderableDelta(normalizedText) &&
                normalizedText !== DEFAULT_CHATBOT_FALLBACK
            ) {
                callbacks.onDelta(normalizedText);
            }

            return false;
        }

        if (event === "done") {
            isDone = true;
            callbacks.onDone(extractChatbotMetadata(payload));
            return true;
        }

        if (event === "error") {
            isDone = true;
            callbacks.onError(
                firstString(payload, "message", "error") || DEFAULT_AI_ERROR,
            );
            return true;
        }

        return false;
    });

    try {
        /* eslint-disable no-await-in-loop */
        // ReadableStream chunks must be consumed sequentially so SSE events stay ordered.
        while (!isDone) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            }

            if (parser.push(decoder.decode(value, { stream: true }))) {
                break;
            }
        }
        /* eslint-enable no-await-in-loop */

        if (!isDone) {
            parser.flush();
        }

        if (!isDone && !signal.aborted) {
            callbacks.onDone({});
        }
    } catch (error) {
        if (signal.aborted) {
            throw error;
        }

        throw new Error("Kết nối bị ngắt trong lúc nhận câu trả lời.");
    } finally {
        reader.releaseLock();
    }
};

export { DEFAULT_CHATBOT_FALLBACK };
