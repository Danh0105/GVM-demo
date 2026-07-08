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

export type BusinessQuery = {
    page?: number;
    size?: number;
    limit?: number;
    keyword?: string;

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
    businesses?: T[];
    total?: number;
    page?: number;
    size?: number;
    limit?: number;
    totalPages?: number;
    pagination?: {
        page?: number;
        size?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
};

export type Business = {
    id: string;
    createdAt?: string;
    updatedAt?: string;

    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxCode?: string;
    representative?: string;
    field?: string;
    industry?: string;
    logoUrl?: string;
    imageUrl?: string;
    status?: string;

    province?: string;
    district?: string;
    ward?: string;

    [key: string]: unknown;
};

export type CreateBusinessPayload = {
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxCode?: string;
    representative?: string;
    field?: string;
    industry?: string;
    logoUrl?: string;
    imageUrl?: string;
    status?: string;

    province?: string;
    district?: string;
    ward?: string;

    [key: string]: unknown;
};

export type UpdateBusinessPayload = Partial<CreateBusinessPayload>;

function getHeaders(hasJsonBody = false): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (hasJsonBody) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

function buildQuery(params: BusinessQuery = {}) {
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
        const items = body.data ?? body.items ?? body.businesses ?? [];
        const pagination = body.pagination ?? {};

        const list = Array.isArray(items) ? items : [];
        const total = body.total ?? pagination.total ?? list.length;
        const page = body.page ?? pagination.page ?? 0;
        const size =
            body.size ??
            body.limit ??
            pagination.size ??
            pagination.limit ??
            list.length;

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

        if (typeof body.business === "object" && body.business !== null) {
            return body.business as T;
        }

        return data as T;
    }

    return {} as T;
}

/* =========================================================
 * Businesses
 * ======================================================= */

export async function getBusinesses(
    query: BusinessQuery = {},
): Promise<PaginatedResponse<Business>> {
    const response = await fetch(`${API_BASE_URL}/businesses${buildQuery(query)}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizePaginatedList<Business>(result);
}

export async function getBusinessItems(
    query: BusinessQuery = {},
): Promise<Business[]> {
    const result = await getBusinesses(query);

    return result.data;
}

export async function getBusiness(
    id: string | number,
): Promise<Business> {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Business>(result, "business");
}

export async function getBusinessById(
    id: string | number,
): Promise<Business> {
    return getBusiness(id);
}

export async function createBusiness(
    payload: CreateBusinessPayload,
): Promise<Business> {
    const response = await fetch(`${API_BASE_URL}/businesses`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Business>(result, "business");
}

export async function updateBusiness(
    id: string | number,
    payload: UpdateBusinessPayload,
): Promise<Business> {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Business>(result, "business");
}

export async function deleteBusiness(id: string | number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}