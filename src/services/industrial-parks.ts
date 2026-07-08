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

export type IndustrialParkQuery = {
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
    industrialParks?: T[];
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

export type IndustrialPark = {
    id: string;
    createdAt?: string;
    updatedAt?: string;

    name?: string;
    description?: string;
    address?: string;
    province?: string;
    district?: string;
    ward?: string;

    area?: number | string;
    occupancyRate?: number | string;
    investor?: string;
    phone?: string;
    email?: string;
    website?: string;
    imageUrl?: string;
    logoUrl?: string;
    status?: string;

    [key: string]: unknown;
};

export type CreateIndustrialParkPayload = {
    name?: string;
    description?: string;
    address?: string;
    province?: string;
    district?: string;
    ward?: string;

    area?: number | string;
    occupancyRate?: number | string;
    investor?: string;
    phone?: string;
    email?: string;
    website?: string;
    imageUrl?: string;
    logoUrl?: string;
    status?: string;

    [key: string]: unknown;
};

export type UpdateIndustrialParkPayload =
    Partial<CreateIndustrialParkPayload>;

function getHeaders(hasJsonBody = false): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };

    if (hasJsonBody) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

function buildQuery(params: IndustrialParkQuery = {}) {
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
        const items = body.data ?? body.items ?? body.industrialParks ?? [];
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

        if (
            typeof body.industrialPark === "object" &&
            body.industrialPark !== null
        ) {
            return body.industrialPark as T;
        }

        return data as T;
    }

    return {} as T;
}

/* =========================================================
 * Industrial parks
 * ======================================================= */

export async function getIndustrialParks(
    query: IndustrialParkQuery = {},
): Promise<PaginatedResponse<IndustrialPark>> {
    const response = await fetch(
        `${API_BASE_URL}/industrial-parks${buildQuery(query)}`,
        {
            method: "GET",
            headers: getHeaders(),
        },
    );

    const result = await handleResponse<unknown>(response);

    return normalizePaginatedList<IndustrialPark>(result);
}

export async function getIndustrialParkItems(
    query: IndustrialParkQuery = {},
): Promise<IndustrialPark[]> {
    const result = await getIndustrialParks(query);

    return result.data;
}

export async function getIndustrialPark(
    id: string | number,
): Promise<IndustrialPark> {
    const response = await fetch(`${API_BASE_URL}/industrial-parks/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<IndustrialPark>(result, "industrialPark");
}

export async function getIndustrialParkById(
    id: string | number,
): Promise<IndustrialPark> {
    return getIndustrialPark(id);
}

export async function createIndustrialPark(
    payload: CreateIndustrialParkPayload,
): Promise<IndustrialPark> {
    const response = await fetch(`${API_BASE_URL}/industrial-parks`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<IndustrialPark>(result, "industrialPark");
}

export async function updateIndustrialPark(
    id: string | number,
    payload: UpdateIndustrialParkPayload,
): Promise<IndustrialPark> {
    const response = await fetch(`${API_BASE_URL}/industrial-parks/${id}`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<IndustrialPark>(result, "industrialPark");
}

export async function deleteIndustrialPark(id: string | number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/industrial-parks/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}