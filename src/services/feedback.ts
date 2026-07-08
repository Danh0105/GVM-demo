import { FeedbackType } from "@/types";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

if (!API_BASE_URL) {
    throw new Error(
        "Thiếu VITE_API_BASE_URL. Hãy kiểm tra file .env và khởi động lại FE.",
    );
}

export type FeedbackStatus = "PENDING" | "PROCESSING" | "RESOLVED" | "REJECTED";

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type Feedback = {
    id: string;
    title: string;
    content: string;
    feedbackTypeId?: string;
    feedbackType?: FeedbackType;
    status?: FeedbackStatus;
    senderName?: string;
    phone?: string;
    email?: string;
    address?: string;
    images?: string[];
    response?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type CreateFeedbackTypePayload = {
    title: string;
    name?: string;
    description?: string;
    order?: number;
};

export type UpdateFeedbackTypePayload = Partial<CreateFeedbackTypePayload>;

export type CreateFeedbackPayload = {
    title: string;
    content: string;
    feedbackTypeId: string;
    senderName?: string;
    phone?: string;
    email?: string;
    address?: string;
    images?: string[];
};

export type UpdateFeedbackPayload = Partial<
    CreateFeedbackPayload & {
        status: FeedbackStatus;
        response: string;
    }
>;

export type FeedbackQuery = {
    page?: number;
    size?: number;
    limit?: number;
    keyword?: string;
    status?: FeedbackStatus;
    feedbackTypeId?: string;
};

export type PaginatedResponse<T> = {
    data: T[];
    total: number;
    page: number;
    size: number;
    totalPages?: number;
};

type RawPaginatedResponse<T> = {
    data?: T[];
    items?: T[];
    total?: number;
    page?: number;
    size?: number;
    limit?: number;
    totalPages?: number;
};

function getHeaders(hasJsonBody = false): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (hasJsonBody) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

function buildQuery(params: FeedbackQuery = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        if (key === "limit") {
            if (!params.size) {
                searchParams.set("size", String(value));
            }

            return;
        }

        searchParams.set(key, String(value));
    });

    const queryString = searchParams.toString();

    return queryString ? `?${queryString}` : "";
}

async function handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    if (!response.ok) {
        let message = `API request failed: ${response.status}`;

        if (text) {
            try {
                const body = JSON.parse(text) as {
                    message?: string | string[];
                    error?: string;
                };

                if (Array.isArray(body.message)) {
                    message = body.message.join(", ");
                } else {
                    message = body.message ?? body.error ?? message;
                }
            } catch {
                message = text;
            }
        }

        throw new Error(message);
    }

    if (response.status === 204 || !text) {
        return undefined as T;
    }

    return JSON.parse(text) as T;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
    return (
        typeof value === "object" &&
        value !== null &&
        "success" in value &&
        "message" in value &&
        "data" in value
    );
}

function unwrapApiResponse<T>(value: T | ApiResponse<T>): T {
    if (isApiResponse<T>(value)) {
        return value.data;
    }

    return value as T;
}

function normalizeFeedbackType(value: unknown): FeedbackType {
    const data = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    return data as FeedbackType;
}

function normalizeFeedbackTypes(value: unknown): FeedbackType[] {
    const data = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    if (Array.isArray(data)) {
        return data as FeedbackType[];
    }

    return [];
}

function normalizeFeedback(value: unknown): Feedback {
    const data = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    return data as Feedback;
}

function normalizeFeedbackList(value: unknown): PaginatedResponse<Feedback> {
    const data = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    if (Array.isArray(data)) {
        return {
            data,
            total: data.length,
            page: 0,
            size: data.length,
            totalPages: 1,
        };
    }

    if (typeof data === "object" && data !== null) {
        const body = data as RawPaginatedResponse<Feedback>;
        const items = body.data ?? body.items ?? [];
        const size = body.size ?? body.limit ?? items.length;

        return {
            data: Array.isArray(items) ? items : [],
            total: body.total ?? items.length,
            page: body.page ?? 0,
            size,
            totalPages: body.totalPages,
        };
    }

    return {
        data: [],
        total: 0,
        page: 0,
        size: 0,
        totalPages: 0,
    };
}

/* =========================================================
 * Feedback types
 * ======================================================= */

export async function getFeedbackTypes(): Promise<FeedbackType[]> {
    const response = await fetch(`${API_BASE_URL}/feedback-types`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeFeedbackTypes(result);
}

export async function getFeedbackType(id: string): Promise<FeedbackType> {
    const response = await fetch(`${API_BASE_URL}/feedback-types/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeFeedbackType(result);
}

export async function createFeedbackType(
    payload: CreateFeedbackTypePayload,
): Promise<FeedbackType> {
    const response = await fetch(`${API_BASE_URL}/feedback-types`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
            ...payload,
            name: payload.name ?? payload.title,
        }),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeFeedbackType(result);
}

export async function updateFeedbackType(
    id: string,
    payload: UpdateFeedbackTypePayload,
): Promise<FeedbackType> {
    const response = await fetch(`${API_BASE_URL}/feedback-types/${id}`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify({
            ...payload,
            name: payload.name ?? payload.title,
        }),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeFeedbackType(result);
}

export async function deleteFeedbackType(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/feedback-types/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}

/* =========================================================
 * Feedbacks
 * ======================================================= */

export async function getFeedbacks(
    query: FeedbackQuery = {},
): Promise<PaginatedResponse<Feedback>> {
    const response = await fetch(
        `${API_BASE_URL}/feedbacks${buildQuery(query)}`,
        {
            method: "GET",
            headers: getHeaders(),
        },
    );

    const result = await handleResponse<unknown>(response);

    return normalizeFeedbackList(result);
}

export async function getFeedback(id: string): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/feedbacks/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeFeedback(result);
}

export async function createFeedback(
    payload: CreateFeedbackPayload,
): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/feedbacks`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeFeedback(result);
}

export async function updateFeedback(
    id: string,
    payload: UpdateFeedbackPayload,
): Promise<Feedback> {
    const response = await fetch(`${API_BASE_URL}/feedbacks/${id}`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeFeedback(result);
}

export async function deleteFeedback(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/feedbacks/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}