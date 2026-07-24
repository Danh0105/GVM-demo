import { BASE_URL } from "@constants/common";
import { apiFetch } from "./api-client";

type ResponseEnvelope<T> = {
    success?: boolean;
    data?: T;
    err?: number | string;
    error?: string;
    message?: string | string[];
};

export const appendFilesToFormData = (
    formData: FormData,
    files: File[] | FileList | null | undefined,
    fieldName = "files",
) => {
    Array.from(files || []).forEach(file => {
        formData.append(fieldName, file);
    });
};

export async function postMultipartForm<T>(
    path: string,
    formData: FormData,
): Promise<T> {
    const response = await apiFetch(
        `${BASE_URL}${path}`,
        {
            method: "POST",
            headers: { Accept: "application/json" },
            body: formData,
        },
        { auth: true },
    );

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
