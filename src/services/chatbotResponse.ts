export type ChatbotSource = "DATABASE" | "GPT" | string;

export type ChatbotMetadata = {
    source: ChatbotSource | null;
    cached: boolean | null;
    knowledgeId: string | null;
    model: string | null;
};

export type NormalizedAssistantResponse = {
    content: string;
    source: "ai" | "saved";
    metadata: Partial<ChatbotMetadata>;
};

type RecordValue = Record<string, unknown>;

export const DEFAULT_CHATBOT_FALLBACK =
    "Xin lỗi, tôi chưa thể trả lời câu hỏi này. Anh/chị vui lòng thử lại.";

const SUCCESS_MESSAGES = new Set([
    "success",
    "successful",
    "ok",
    "thanh cong",
    "thành công",
]);

const asRecord = (value: unknown): RecordValue =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as RecordValue)
        : {};

const firstString = (value: RecordValue, ...keys: string[]) => {
    const key = keys.find(item => typeof value[item] === "string");

    return key ? String(value[key]).trim() : "";
};

const firstBoolean = (value: RecordValue, ...keys: string[]) => {
    const key = keys.find(item => typeof value[item] === "boolean");

    return key ? Boolean(value[key]) : null;
};

const parseMaybeJson = (value: unknown): unknown => {
    if (typeof value !== "string") {
        return value;
    }

    const trimmed = value.trim();

    if (!trimmed) {
        return "";
    }

    if (!/^[{[]/.test(trimmed)) {
        return trimmed;
    }

    try {
        return JSON.parse(trimmed);
    } catch {
        return trimmed;
    }
};

const isMeaningfulAnswer = (value: string) => {
    const normalized = value.trim().toLowerCase();

    return Boolean(normalized) && !SUCCESS_MESSAGES.has(normalized);
};

const getNestedMessageContent = (value: RecordValue) => {
    const message = parseMaybeJson(value.message);

    if (typeof message === "string") {
        return "";
    }

    return firstString(asRecord(message), "content", "answer", "text");
};

const getAnswerCandidate = (value: unknown): string => {
    const parsedValue = parseMaybeJson(value);

    if (typeof parsedValue === "string") {
        return parsedValue;
    }

    const body = asRecord(parsedValue);
    const data = asRecord(parseMaybeJson(body.data));
    const candidates = [
        firstString(data, "answer"),
        firstString(data, "content"),
        getNestedMessageContent(data),
        firstString(body, "answer"),
        firstString(body, "content"),
        getNestedMessageContent(body),
        firstString(data, "result", "text"),
        firstString(body, "result", "text"),
    ];

    return candidates.find(isMeaningfulAnswer) || "";
};

export const extractChatbotMetadata = (
    value: unknown,
): Partial<ChatbotMetadata> => {
    const parsedValue = parseMaybeJson(value);
    const body = asRecord(parsedValue);
    const data = asRecord(parseMaybeJson(body.data));
    const source =
        firstString(body, "source", "type", "origin") ||
        firstString(data, "source", "type", "origin");
    const model = firstString(body, "model") || firstString(data, "model");
    const knowledgeId =
        firstString(body, "knowledgeId") || firstString(data, "knowledgeId");

    return {
        source: source || null,
        cached:
            firstBoolean(body, "cached", "from_cache", "fromCache") ??
            firstBoolean(data, "cached", "from_cache", "fromCache"),
        knowledgeId: knowledgeId || null,
        model: model || null,
    };
};

const normalizeSource = (
    value: unknown,
    metadata: Partial<ChatbotMetadata>,
): "ai" | "saved" => {
    const body = asRecord(parseMaybeJson(value));
    const data = asRecord(parseMaybeJson(body.data));
    const explicitSource =
        firstString(body, "source", "type", "origin") ||
        firstString(data, "source", "type", "origin") ||
        String(metadata.source || "");
    const normalized = explicitSource.trim().toLowerCase();
    const cached =
        firstBoolean(body, "cached", "from_cache", "fromCache") ??
        firstBoolean(data, "cached", "from_cache", "fromCache") ??
        metadata.cached;

    if (
        cached === true ||
        ["database", "db", "cache", "cached", "saved", "history"].includes(
            normalized,
        )
    ) {
        return "saved";
    }

    return "ai";
};

export const normalizeAssistantResponse = (
    response: unknown,
): NormalizedAssistantResponse => {
    const parsedResponse = parseMaybeJson(response);
    const metadata = extractChatbotMetadata(parsedResponse);
    const content = getAnswerCandidate(parsedResponse);

    return {
        content: content || DEFAULT_CHATBOT_FALLBACK,
        source: normalizeSource(parsedResponse, metadata),
        metadata,
    };
};

export const parseChatbotPayload = (data: string): RecordValue => {
    if (!data) {
        return {};
    }

    const parsed = parseMaybeJson(data);

    if (typeof parsed === "string") {
        return { text: parsed };
    }

    return asRecord(parsed);
};

export const extractChatbotAnswer = (value: unknown): string =>
    normalizeAssistantResponse(value).content;
