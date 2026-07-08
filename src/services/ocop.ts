const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

if (!API_BASE_URL) {
    throw new Error(
        "Thiếu VITE_API_BASE_URL. Hãy kiểm tra file .env và khởi động lại FE.",
    );
}

export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type OcopQuery = {
    page?: number;
    size?: number;
    limit?: number;
    keyword?: string;
    typeId?: string;
    type?: string;
    province?: string;
    district?: string;
    ward?: string;
    rating?: number;

    [key: string]: string | number | boolean | undefined;
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
    ocops?: T[];
    total?: number;
    page?: number;
    size?: number;
    limit?: number;
    totalPages?: number;
    pagination?: {
        page?: number;
        size?: number;
        total?: number;
        totalPages?: number;
    };
};

export type OcopType = {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    name?: string;
    title?: string;
    description?: string;
    order?: number;

    [key: string]: unknown;
};

export type Ocop = {
    id: string;
    createdAt?: string;
    updatedAt?: string;

    name?: string;
    title?: string;
    description?: string;
    type?: string | OcopType;
    typeId?: string;
    ocopType?: OcopType;

    ownerName?: string;
    producer?: string;
    address?: string;
    phone?: string;
    email?: string;

    imageUrl?: string;
    images?: string[];
    price?: number | string;
    rating?: number;
    stars?: number;
    link?: string;

    province?: string;
    district?: string;
    ward?: string;

    [key: string]: unknown;
};

export type CreateOcopPayload = {
    name?: string;
    title?: string;
    description?: string;
    type?: string;
    typeId?: string;

    ownerName?: string;
    producer?: string;
    address?: string;
    phone?: string;
    email?: string;

    imageUrl?: string;
    images?: string[];
    price?: number | string;
    rating?: number;
    stars?: number;
    link?: string;

    province?: string;
    district?: string;
    ward?: string;

    [key: string]: unknown;
};

export type UpdateOcopPayload = Partial<CreateOcopPayload>;

export type OcopReview = {
    id?: string;
    createdAt?: string;
    updatedAt?: string;

    ocopId?: string;
    userId?: string;
    fullName?: string;
    phone?: string;
    rating?: number;
    stars?: number;
    content?: string;
    comment?: string;

    [key: string]: unknown;
};

export type CreateOcopReviewPayload = {
    userId?: string;
    fullName?: string;
    phone?: string;
    rating?: number;
    stars?: number;
    content?: string;
    comment?: string;

    [key: string]: unknown;
};

export type CreateOcopTypePayload = {
    name?: string;
    title?: string;
    description?: string;
    order?: number;
};

export type UpdateOcopTypePayload = Partial<CreateOcopTypePayload>;

function getHeaders(hasJsonBody = false): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (hasJsonBody) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

function buildQuery(params: OcopQuery = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        /**
         * Một số API Nest đang dùng size thay vì limit.
         * Tránh gửi cả limit và size gây lỗi validate:
         * "property limit should not exist".
         */
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

function normalizeList<T>(value: unknown, listKey?: string): T[] {
    const data = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    if (Array.isArray(data)) {
        return data as T[];
    }

    if (typeof data === "object" && data !== null) {
        const body = data as Record<string, unknown>;

        const items =
            (listKey ? body[listKey] : undefined) ??
            body.data ??
            body.items ??
            body.ocops;

        return Array.isArray(items) ? (items as T[]) : [];
    }

    return [];
}

function normalizePaginatedList<T>(value: unknown): PaginatedResponse<T> {
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
        const body = data as RawPaginatedResponse<T>;
        const items = body.data ?? body.items ?? body.ocops ?? [];
        const pagination = body.pagination ?? {};

        const list = Array.isArray(items) ? items : [];
        const total = body.total ?? pagination.total ?? list.length;
        const page = body.page ?? pagination.page ?? 0;
        const size = body.size ?? body.limit ?? pagination.size ?? list.length;

        return {
            data: list,
            total,
            page,
            size,
            totalPages:
                body.totalPages ??
                pagination.totalPages ??
                (size > 0 ? Math.ceil(total / size) : 0),
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

function normalizeSingle<T>(value: unknown, dataKey?: string): T {
    const data = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    if (
        typeof data === "object" &&
        data !== null &&
        !Array.isArray(data)
    ) {
        const body = data as Record<string, unknown>;

        if (
            dataKey &&
            typeof body[dataKey] === "object" &&
            body[dataKey] !== null
        ) {
            return body[dataKey] as T;
        }

        if (typeof body.item === "object" && body.item !== null) {
            return body.item as T;
        }

        if (typeof body.ocop === "object" && body.ocop !== null) {
            return body.ocop as T;
        }

        return data as T;
    }

    return {} as T;
}

/* =========================================================
 * OCOP types
 * ======================================================= */

export async function getOcopTypes(): Promise<OcopType[]> {
    const response = await fetch(`${API_BASE_URL}/ocop-types`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeList<OcopType>(result);
}

export async function getOcopType(id: string): Promise<OcopType> {
    const response = await fetch(`${API_BASE_URL}/ocop-types/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<OcopType>(result);
}

export async function createOcopType(
    payload: CreateOcopTypePayload,
): Promise<OcopType> {
    const response = await fetch(`${API_BASE_URL}/ocop-types`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({
            ...payload,
            title: payload.title ?? payload.name,
            name: payload.name ?? payload.title,
        }),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<OcopType>(result);
}

export async function updateOcopType(
    id: string,
    payload: UpdateOcopTypePayload,
): Promise<OcopType> {
    const response = await fetch(`${API_BASE_URL}/ocop-types/${id}`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify({
            ...payload,
            title: payload.title ?? payload.name,
            name: payload.name ?? payload.title,
        }),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<OcopType>(result);
}

export async function deleteOcopType(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ocop-types/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}

/* =========================================================
 * OCOP products
 * ======================================================= */

export async function getOcops(
    query: OcopQuery = {},
): Promise<PaginatedResponse<Ocop>> {
    const response = await fetch(`${API_BASE_URL}/ocops${buildQuery(query)}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizePaginatedList<Ocop>(result);
}

export async function getOcopItems(query: OcopQuery = {}): Promise<Ocop[]> {
    const result = await getOcops(query);

    return result.data;
}

export async function getOcop(id: string): Promise<Ocop> {
    const response = await fetch(`${API_BASE_URL}/ocops/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Ocop>(result, "ocop");
}

export async function getOcopById(id: string): Promise<Ocop> {
    return getOcop(id);
}

export async function createOcop(payload: CreateOcopPayload): Promise<Ocop> {
    const response = await fetch(`${API_BASE_URL}/ocops`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Ocop>(result, "ocop");
}

export async function updateOcop(
    id: string,
    payload: UpdateOcopPayload,
): Promise<Ocop> {
    const response = await fetch(`${API_BASE_URL}/ocops/${id}`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Ocop>(result, "ocop");
}

export async function deleteOcop(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ocops/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}

/* =========================================================
 * OCOP reviews
 * ======================================================= */

export async function getOcopReviews(id: string): Promise<OcopReview[]> {
    const response = await fetch(`${API_BASE_URL}/ocops/${id}/reviews`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeList<OcopReview>(result);
}

export async function createOcopReview(
    id: string,
    payload: CreateOcopReviewPayload,
): Promise<OcopReview> {
    const response = await fetch(`${API_BASE_URL}/ocops/${id}/reviews`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<OcopReview>(result);
}