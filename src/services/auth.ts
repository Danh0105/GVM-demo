import { BASE_URL } from "@constants/common";
import { User } from "@dts";

export type AuthSession = {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user?: User;
};

type AuthResponse = Partial<AuthSession> & {
    token?: string;
    data?: Partial<AuthSession> & { token?: string };
};

export type ZaloLoginPayload = {
    accessToken: string;
    zaloId: string;
    username: string;
};

export class AuthApiError extends Error {
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
        this.name = "AuthApiError";
        this.status = status;
        this.error = error;
        this.retryAfter = retryAfter;
    }
}

const getMessage = (body: unknown, fallback: string) => {
    if (!body || typeof body !== "object") {
        return fallback;
    }

    const { message, error } = body as {
        message?: string | string[];
        error?: string;
    };

    if (Array.isArray(message)) {
        return message.join(", ");
    }

    return message || error || fallback;
};

const normalizeSession = (
    body: AuthResponse,
    fallbackRefreshToken?: string,
): AuthSession => {
    const value = body.data || body;
    const accessToken = value.accessToken || value.token;

    const refreshToken = value.refreshToken || fallbackRefreshToken;

    if (!accessToken || !refreshToken || !value.expiresIn) {
        throw new AuthApiError(
            "Phản hồi đăng nhập chưa có đủ accessToken, refreshToken và expiresIn.",
            500,
            "INVALID_AUTH_RESPONSE",
        );
    }

    return {
        accessToken,
        refreshToken,
        expiresIn: Number(value.expiresIn),
        user: value.user,
    };
};

async function authRequest(
    path: string,
    payload: Record<string, string>,
    fallbackRefreshToken?: string,
): Promise<AuthSession> {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const text = await response.text();
    let body: AuthResponse = {};

    if (text) {
        try {
            body = JSON.parse(text) as AuthResponse;
        } catch {
            if (!response.ok) {
                throw new AuthApiError(text, response.status);
            }
        }
    }

    if (!response.ok) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfter = retryAfterHeader
            ? Math.max(1, Number.parseInt(retryAfterHeader, 10) || 30)
            : undefined;

        throw new AuthApiError(
            response.status === 429
                ? getMessage(
                      body,
                      `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${
                          retryAfter || 30
                      } giây.`,
                  )
                : getMessage(
                      body,
                      `Yêu cầu xác thực thất bại (${response.status}).`,
                  ),
            response.status,
            (body as { error?: string }).error,
            retryAfter,
        );
    }

    return normalizeSession(body, fallbackRefreshToken);
}

export const loginWithZaloToken = (payload: ZaloLoginPayload) =>
    authRequest("/auth/zalo-login", payload);

export const refreshSession = (refreshToken: string) =>
    authRequest("/auth/refresh", { refreshToken }, refreshToken);
