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

export type ArticleType = {
    id: string;
    group?: string;
    name?: string;
    title?: string;
    description?: string | null;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
};
export type Article = {
    id: string;
    title: string;
    author?: string | null;
    desc?: string | null;
    link?: string | null;
    thumb?: string | null;
    typeId?: string | null;
    type?: ArticleType | null;
    likes: number;
    views: number;
    publishedAt: string;
    createdAt?: string;
    updatedAt?: string;
};

export type ArticleQuery = {
    page?: number;
    size?: number;
  
    limit?: number;
    keyword?: string;
    search?: string;
  
    typeId?: string;
  };
  function buildArticleQuery(query: ArticleQuery = {}) {
    return buildQuery({
      page: query.page,
      size: query.size ?? query.limit,
      keyword: query.keyword ?? query.search,
      typeId: query.typeId,
    });
  }
export type PaginatedResponse<T> = {
    data?: T[];
    items?: T[];
    articles?: T[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    pagination?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
};

export type ArticleViewPayload = {
    userId?: string;
};

export type UpdateArticleLikePayload = {
    userId: string;
    liked: boolean;
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

function buildQuery(params: Record<string, unknown>) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.set(key, String(value));
        }
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

    if (!text) {
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

function normalizeList<T>(value: unknown): T[] {
    const unwrapped = unwrapApiResponse<unknown>(value as ApiResponse<unknown>);

    if (Array.isArray(unwrapped)) {
        return unwrapped as T[];
    }

    if (typeof unwrapped === "object" && unwrapped !== null) {
        const body = unwrapped as PaginatedResponse<T>;

        const items = body.items ?? body.articles ?? body.data ?? [];

        return Array.isArray(items) ? items : [];
    }

    return [];
}

function normalizeSingle<T>(value: unknown): T {
    return unwrapApiResponse<T>(value as ApiResponse<T>);
}

/* =========================================================
 * Article types
 * ======================================================= */

export async function getArticleTypes(): Promise<ArticleType[]> {
    const response = await fetch(`${API_BASE_URL}/article-types`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
    });

    const result = await handleResponse<
        ApiResponse<ArticleType[]> | ArticleType[]
    >(response);

    if (Array.isArray(result)) {
        return result;
    }

    if (Array.isArray(result.data)) {
        return result.data;
    }

    return [];
}

export async function getArticleType(id: string): Promise<ArticleType> {
    const response = await fetch(`${API_BASE_URL}/article-types/${id}`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<ArticleType>(result);
}

/* =========================================================
 * Articles / News user
 * ======================================================= */

export async function getArticles(
    query: ArticleQuery = {},
  ): Promise<Article[]> {
    const response = await fetch(
      `${API_BASE_URL}/articles${buildArticleQuery(query)}`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      },
    );
  
    const result = await handleResponse<unknown>(response);
  
    return normalizeList<Article>(result);
  }

export async function getArticle(id: string): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Article>(result);
}

export async function recordArticleView(
    id: string,
    payload: ArticleViewPayload = {},
): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}/views`, {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Article>(result);
}

export async function updateArticleLike(
    id: string,
    payload: UpdateArticleLikePayload,
): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
        method: "PATCH",
        headers: getHeaders(true),
        body: JSON.stringify(payload),
    });

    const result = await handleResponse<unknown>(response);

    return normalizeSingle<Article>(result);
}
