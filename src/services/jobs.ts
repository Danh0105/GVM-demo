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

export type JobQuery = {
    page?: number;
    size?: number;
    limit?: number;
    search?: string;
    keyword?: string;
    location?: string;
    area?: string;
    workType?: string;
    employmentType?: string;
    status?: string;

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
    jobs?: T[];
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

export type Job = {
    id: string;
    createdAt?: string;
    updatedAt?: string;

    title?: string;
    companyName?: string;
    company?: string;
    description?: string;
    requirement?: string;
    requirements?: string;
    benefit?: string;
    benefits?: string;
    salary?: string;
    location?: string;
    area?: string;
    workType?: string;
    employmentType?: string;
    deadline?: string;
    status?: string;
    views?: number;
    likes?: number;

    [key: string]: unknown;
};

export type CreateJobPayload = {
    title?: string;
    companyName?: string;
    company?: string;
    description?: string;
    requirement?: string;
    requirements?: string;
    benefit?: string;
    benefits?: string;
    salary?: string;
    location?: string;
    area?: string;
    workType?: string;
    employmentType?: string;
    deadline?: string;
    status?: string;

    [key: string]: unknown;
};

export type UpdateJobPayload = Partial<CreateJobPayload>;

export type JobViewPayload = {
    userId?: string;
    zaloUserId?: string;

    [key: string]: unknown;
};

export type UpdateJobLikePayload = {
    userId?: string;
    zaloUserId?: string;
    liked?: boolean;
    isLiked?: boolean;

    [key: string]: unknown;
};

export type JobInteraction = {
    id?: string;
    userId?: string;
    jobId?: string;
    liked?: boolean;
    isLiked?: boolean;
    viewed?: boolean;
    viewCount?: number;
    createdAt?: string;
    updatedAt?: string;

    [key: string]: unknown;
};

export type CreateJobApplicationPayload = {
    userId?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    cvUrl?: string;
    resumeUrl?: string;
    coverLetter?: string;
    note?: string;

    [key: string]: unknown;
};

export type JobApplication = {
    id?: string;
    jobId?: string;
    userId?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    cvUrl?: string;
    resumeUrl?: string;
    coverLetter?: string;
    note?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;

    [key: string]: unknown;
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

function buildQuery(params: JobQuery = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
            return;
        }

        /**
         * API Nest của mình đang ưu tiên page/size/keyword.
         * Tránh gửi limit/search nếu BE validate chặt.
         */
        if (key === "limit") {
            if (!params.size) {
                searchParams.set("size", String(value));
            }

            return;
        }

        if (key === "search") {
            if (!params.keyword) {
                searchParams.set("keyword", String(value));
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
        const items = body.data ?? body.items ?? body.jobs ?? [];
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

function normalizeList<T>(value: unknown): T[] {
    const data = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    if (Array.isArray(data)) {
        return data as T[];
    }

    if (typeof data === "object" && data !== null) {
        const body = data as RawPaginatedResponse<T>;
        const items = body.items ?? body.jobs ?? body.data ?? [];

        return Array.isArray(items) ? items : [];
    }

    return [];
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

        if (typeof body.job === "object" && body.job !== null) {
            return body.job as T;
        }

        return data as T;
    }

    return {} as T;
}

/* =========================================================
 * Jobs
 * ======================================================= */

export async function getJobs(
    query: JobQuery = {},
): Promise<PaginatedResponse<Job>> {
    const response = await fetch(`${API_BASE_URL}/jobs${buildQuery(query)}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizePaginatedList<Job>(result);
}

export async function getJobItems(query: JobQuery = {}): Promise<Job[]> {
    const result = await getJobs(query);

    return result.data;
}

export async function getJob(id: string | number): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Job>(result, "job");
}

export async function getJobById(id: string | number): Promise<Job> {
    return getJob(id);
}

export async function createJob(payload: CreateJobPayload): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Job>(result, "job");
}

export async function updateJob(
    id: string | number,
    payload: UpdateJobPayload,
): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Job>(result, "job");
}

export async function deleteJob(id: string | number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
    });

    await handleResponse<unknown>(response);
}

/* =========================================================
 * Job interactions
 * ======================================================= */

export async function recordJobView(
    id: string | number,
    payload: JobViewPayload = {},
): Promise<JobInteraction> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/views`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<JobInteraction>(result);
}

export async function updateJobLike(
    id: string | number,
    payload: UpdateJobLikePayload,
): Promise<JobInteraction> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/like`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<JobInteraction>(result);
}

export async function getJobInteractions(
    id: string | number,
): Promise<JobInteraction[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/interactions`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeList<JobInteraction>(result);
}

export async function getJobInteractionByUser(
    id: string | number,
    userId: string | number,
): Promise<JobInteraction> {
    const response = await fetch(
        `${API_BASE_URL}/jobs/${id}/interactions/${userId}`,
        {
            method: "GET",
            headers: getHeaders(),
        },
    );

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<JobInteraction>(result);
}

/* =========================================================
 * Job applications
 * ======================================================= */

export async function getJobApplications(
    id: string | number,
): Promise<JobApplication[]> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/applications`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeList<JobApplication>(result);
}

export async function createJobApplication(
    id: string | number,
    payload: CreateJobApplicationPayload,
): Promise<JobApplication> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/applications`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<JobApplication>(result);
}