import { BASE_URL } from "@constants/common";
import { useStore as store } from "@store";
import { AuthApiError } from "./auth";

const ALLOWED_HEADERS = new Set(["accept", "authorization", "content-type"]);

export type ApiFetchOptions = {
    auth?: boolean;
    retry401?: boolean;
};

export class ApiError extends Error {
    status: number;

    error?: string;

    retryAfter?: number;

    constructor(
        message: string,
        status: number,
        error?: string,
        retryAfter?: number,
    ) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.error = error;
        this.retryAfter = retryAfter;
    }
}

let refreshPromise: Promise<string | undefined> | null = null;

const parseRetryAfter = (value: string | null) => {
    if (!value) {
        return 30;
    }

    const seconds = Number(value);

    if (Number.isFinite(seconds)) {
        return Math.max(1, Math.ceil(seconds));
    }

    const target = new Date(value).getTime();

    if (!Number.isNaN(target)) {
        return Math.max(1, Math.ceil((target - Date.now()) / 1000));
    }

    return 30;
};

const readErrorBody = async (response: Response) => {
    const fallback = `Yêu cầu API thất bại (${response.status}).`;

    try {
        const text = await response.clone().text();

        if (!text) {
            return { message: fallback };
        }

        const body = JSON.parse(text) as {
            message?: string | string[];
            error?: string;
        };
        const message = Array.isArray(body.message)
            ? body.message.join(", ")
            : body.message || body.error || fallback;

        return { message, error: body.error };
    } catch {
        return { message: fallback };
    }
};

type FetchInput = Parameters<typeof window.fetch>[0];
type FetchInit = NonNullable<Parameters<typeof window.fetch>[1]>;

const normalizeUrl = (input: FetchInput | URL) => {
    if (typeof input !== "string" && !(input instanceof URL)) {
        return input;
    }

    const url = new URL(String(input), BASE_URL || window.location.origin);

    ["size", "limit"].forEach(key => {
        const rawValue = url.searchParams.get(key);

        if (!rawValue) {
            return;
        }

        const value = Number(rawValue);

        if (Number.isFinite(value)) {
            url.searchParams.set(
                key,
                String(Math.min(200, Math.max(1, value))),
            );
        }
    });

    const page = Number(url.searchParams.get("page"));

    if (url.searchParams.has("page") && Number.isFinite(page)) {
        url.searchParams.set("page", String(Math.max(0, Math.floor(page))));
    }

    return url.toString();
};

const buildHeaders = (init: FetchInit, auth: boolean) => {
    const requestedHeaders = new Headers(init.headers);
    const headers = new Headers();

    requestedHeaders.forEach((value, name) => {
        if (ALLOWED_HEADERS.has(name.toLowerCase())) {
            headers.set(name, value);
        }
    });

    if (!headers.has("Accept")) {
        headers.set("Accept", "application/json");
    }

    if (init.body instanceof FormData) {
        headers.delete("Content-Type");
    }

    const { token } = store.getState();

    if (auth && token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
};

export async function apiFetch(
    input: FetchInput | URL,
    init: FetchInit = {},
    options: ApiFetchOptions = {},
): Promise<Response> {
    const auth = options.auth === true;
    const retry401 = options.retry401 !== false;

    if (auth && !store.getState().token) {
        const authState = store.getState();

        if (authState.authStatus === "inactive") {
            throw new ApiError(
                authState.authMessage || "Tài khoản không hoạt động",
                401,
                "ACCOUNT_INACTIVE",
            );
        }

        if (authState.authStatus === "error") {
            const retryAfter = authState.authRetryUntil
                ? Math.max(
                      0,
                      Math.ceil((authState.authRetryUntil - Date.now()) / 1000),
                  )
                : undefined;

            throw new ApiError(
                authState.authMessage || "Không thể xác thực bằng Zalo.",
                retryAfter ? 429 : 401,
                retryAfter ? "TOO_MANY_REQUESTS" : "ZALO_AUTH_FAILED",
                retryAfter,
            );
        }

        await authState.getAccessToken();

        const authenticatedState = store.getState();

        if (!authenticatedState.token) {
            throw new ApiError(
                authenticatedState.authMessage ||
                    "Không thể xác thực bằng Zalo.",
                authenticatedState.authStatus === "inactive" ? 401 : 503,
                authenticatedState.authStatus === "inactive"
                    ? "ACCOUNT_INACTIVE"
                    : "ZALO_AUTH_FAILED",
            );
        }
    }

    const requestInit = {
        ...init,
        headers: buildHeaders(init, auth),
    };
    const response = await fetch(normalizeUrl(input), requestInit);

    if (response.status === 401 && auth && retry401) {
        const { refreshToken, refreshAccessToken, logout } = store.getState();

        if (refreshToken) {
            refreshPromise ||= refreshAccessToken().finally(() => {
                refreshPromise = null;
            });

            let accessToken: string | undefined;

            try {
                accessToken = await refreshPromise;
            } catch (refreshError) {
                if (
                    refreshError instanceof AuthApiError &&
                    refreshError.status === 429
                ) {
                    const retryAfter = refreshError.retryAfter || 30;
                    const message = `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`;

                    store.getState().setRateLimit(retryAfter);
                    store.getState().setError({
                        message,
                        statusCode: 429,
                        error: refreshError.error,
                        retryAfter,
                    });
                    throw new ApiError(
                        message,
                        429,
                        refreshError.error,
                        retryAfter,
                    );
                }
            }

            if (accessToken) {
                return apiFetch(input, init, { auth, retry401: false });
            }
        }

        logout();
    }

    if (response.ok) {
        return response;
    }

    const body = await readErrorBody(response);

    if (response.status === 429) {
        const retryAfter = parseRetryAfter(response.headers.get("Retry-After"));
        const message =
            body.message ||
            `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`;

        store.getState().setRateLimit(retryAfter);
        store.getState().setError({
            message,
            statusCode: 429,
            error: body.error,
            retryAfter,
        });

        throw new ApiError(message, 429, body.error, retryAfter);
    }

    if (response.status === 413) {
        throw new ApiError(
            "Tệp vượt quá dung lượng cho phép (tối đa 20MB).",
            413,
            body.error,
        );
    }

    throw new ApiError(body.message, response.status, body.error);
}
