import { BASE_URL } from "@constants/common";
import { apiFetch } from "./api-client";

interface FetchOptions {
    useAuth?: boolean;
    baseUrl?: string;
}

type ResponseEnvelope<T> = {
    success?: boolean;
    data?: T;
    err?: number | string;
    error?: string;
    message?: string | string[];
};

export async function request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    url: string,
    data?: object,
    options?: FetchOptions,
): Promise<T> {
    const { useAuth = false, baseUrl = BASE_URL } = options || {};
    const requestUrl = new URL(url, `${baseUrl.replace(/\/+$/, "")}/`);
    const requestOptions: NonNullable<Parameters<typeof window.fetch>[1]> = {
        method,
        headers: {
            Accept: "application/json",
        },
    };

    if (method === "GET") {
        Object.entries(data || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                requestUrl.searchParams.set(key, String(value));
            }
        });
    } else {
        requestOptions.headers = {
            ...requestOptions.headers,
            "Content-Type": "application/json",
        };
        requestOptions.body = JSON.stringify(data || {});
    }

    const response = await apiFetch(requestUrl, requestOptions, {
        auth: useAuth,
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const body = (await response.json()) as ResponseEnvelope<T> | T;

    if (body && typeof body === "object") {
        const envelope = body as ResponseEnvelope<T>;

        if (envelope.err || envelope.success === false) {
            const message = Array.isArray(envelope.message)
                ? envelope.message.join(", ")
                : envelope.message || envelope.error || "Yêu cầu thất bại.";

            throw new Error(message);
        }

        if (Object.prototype.hasOwnProperty.call(envelope, "data")) {
            return envelope.data as T;
        }
    }

    return body as T;
}
