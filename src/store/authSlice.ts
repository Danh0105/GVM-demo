import { User } from "@dts";
import { getToken, getZaloUserInfo } from "@/services/zalo";
import {
    AuthApiError,
    loginWithZaloToken,
    refreshSession,
} from "@/services/auth";
import { StateCreator } from "zustand";

export type AuthStatus =
    | "idle"
    | "loading"
    | "authenticated"
    | "inactive"
    | "error";

export interface AuthSlice {
    token?: string;
    refreshToken?: string;
    expiresAt?: number;
    authStatus: AuthStatus;
    authMessage?: string;
    authRetryUntil?: number;
    user?: User;
    loadingToken: boolean;
    loadingUserInfo: boolean;
    setToken: (token: string) => void;
    getToken: () => string | undefined;
    getUser: () => User | undefined;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
    getUserInfo: () => Promise<void>;
    getAccessToken: () => Promise<void>;
    refreshAccessToken: () => Promise<string | undefined>;
}

let activeZaloLogin: Promise<void> | undefined;

const normalizeZaloLoginValue = (value: unknown) =>
    String(value ?? "")
        .trim()
        .slice(0, 255);

const authSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set, get) => ({
    token: undefined,
    refreshToken: undefined,
    expiresAt: undefined,
    authStatus: "idle",
    authMessage: undefined,
    authRetryUntil: undefined,
    user: undefined,
    loadingToken: false,
    loadingUserInfo: false,
    setToken: (token: string) => {
        set(state => ({ ...state, token }));
    },
    getToken: () => get().token,
    getUser: () => get().user,
    setUser: (user: User) => {
        set(state => ({ ...state, user }));
    },
    setLoading: (loading: boolean) => {
        set(state => ({ ...state, loading }));
    },
    logout: () => {
        set(state => ({
            ...state,
            token: undefined,
            refreshToken: undefined,
            expiresAt: undefined,
            user: undefined,
            authStatus: "idle",
            authMessage: undefined,
            authRetryUntil: undefined,
        }));
    },
    getUserInfo: async () => {
        try {
            set(state => ({ ...state, loadingUserInfo: true }));
            await get().getAccessToken();

            if (!get().token) {
                return;
            }

            const user = await getZaloUserInfo();

            set(state => ({ ...state, user }));
        } catch {
            set(state => ({ ...state, user: undefined }));
        } finally {
            set(state => ({ ...state, loadingUserInfo: false }));
        }
    },
    getAccessToken: () => {
        if (activeZaloLogin) {
            return activeZaloLogin;
        }

        activeZaloLogin = (async () => {
            try {
                set(state => ({
                    ...state,
                    loadingToken: true,
                    authStatus: "loading",
                    authMessage: undefined,
                    authRetryUntil: undefined,
                }));
                const zaloAccessToken = await getToken();
                const zaloUser = await getZaloUserInfo(true);
                const zaloId = normalizeZaloLoginValue(zaloUser.id);
                const username = normalizeZaloLoginValue(zaloUser.name);

                if (!zaloId || !username) {
                    throw new Error(
                        "Zalo chưa cung cấp đủ mã người dùng và tên tài khoản.",
                    );
                }

                const session = await loginWithZaloToken({
                    accessToken: zaloAccessToken,
                    zaloId,
                    username,
                });

                set(state => ({
                    ...state,
                    token: session.accessToken,
                    refreshToken: session.refreshToken,
                    expiresAt: Date.now() + session.expiresIn * 1000,
                    user: session.user || zaloUser || state.user,
                    authStatus: "authenticated",
                    authRetryUntil: undefined,
                }));
            } catch (err) {
                const inactive =
                    err instanceof AuthApiError && err.status === 401;
                let authMessage =
                    "Không thể xác thực bằng Zalo. Vui lòng thử lại.";

                if (inactive) {
                    authMessage = "Tài khoản không hoạt động";
                } else if (err instanceof Error) {
                    authMessage = err.message;
                }

                set(state => ({
                    ...state,
                    token: undefined,
                    refreshToken: undefined,
                    expiresAt: undefined,
                    authStatus: inactive ? "inactive" : "error",
                    authMessage,
                    authRetryUntil:
                        err instanceof AuthApiError && err.retryAfter
                            ? Date.now() + err.retryAfter * 1000
                            : undefined,
                }));
            } finally {
                set(state => ({ ...state, loadingToken: false }));
            }
        })().finally(() => {
            activeZaloLogin = undefined;
        });

        return activeZaloLogin;
    },
    refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken;

        if (!currentRefreshToken) {
            return undefined;
        }

        try {
            const session = await refreshSession(currentRefreshToken);

            set(state => ({
                ...state,
                token: session.accessToken,
                refreshToken: session.refreshToken,
                expiresAt: Date.now() + session.expiresIn * 1000,
                user: session.user || state.user,
                authStatus: "authenticated",
                authMessage: undefined,
                authRetryUntil: undefined,
            }));

            return session.accessToken;
        } catch (error) {
            set(state => ({
                ...state,
                token: undefined,
                refreshToken: undefined,
                expiresAt: undefined,
                user: undefined,
                authStatus: "idle",
            }));

            throw error;
        }
    },
});

export default authSlice;
