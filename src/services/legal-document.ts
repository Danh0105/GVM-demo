export type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

export type LegalDocumentQuery = {
    page?: number;
    size?: number;
    keyword?: string;
};

export type LegalDocumentCategory = {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
    group?: string;
    name?: string;
    title?: string;
    description?: string | null;
    order?: number;
};

export type LegalDocument = {
    id: string;
    createdAt?: string;
    updatedAt?: string;

    title?: string;
    code?: string;
    documentNumber?: string;
    summary?: string;
    content?: string;
    fileUrl?: string;
    link?: string;

    issuedAt?: string;
    issuedDate?: string;
    effectiveDate?: string;

    category?: string;
    categoryId?: string;
    documentCategoryId?: string;

    documentCategory?: LegalDocumentCategory;
};

type LegalDocumentListData = {
    page: number;
    size: number;
    total: number;
    data: LegalDocument[];
};

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

if (!API_BASE_URL) {
    throw new Error(
        "Thiếu VITE_API_BASE_URL. Hãy kiểm tra file .env và khởi động lại FE.",
    );
}

function getHeaders(): Record<string, string> {
    return {
        Accept: "application/json",
    };
}

function buildQuery(query: LegalDocumentQuery = {}) {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value));
        }
    });

    const queryString = params.toString();

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

    if (!text) {
        return undefined as T;
    }

    return JSON.parse(text) as T;
}

export async function getLegalDocuments(
    query: LegalDocumentQuery = {},
): Promise<LegalDocument[]> {
    const response = await fetch(
        `${API_BASE_URL}/legal-documents${buildQuery(query)}`,
        {
            method: "GET",
            headers: getHeaders(),
        },
    );

    const result =
        await handleResponse<ApiResponse<LegalDocumentListData>>(response);

    return result.data.data;
}

export async function getLegalDocumentById(
    id: string,
): Promise<LegalDocument> {
    const response = await fetch(`${API_BASE_URL}/legal-documents/${id}`, {
        method: "GET",
        headers: getHeaders(),
    });

    const result = await handleResponse<ApiResponse<LegalDocument>>(response);

    return result.data;
}