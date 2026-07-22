import { BASE_URL } from "@constants/common";
import { apiFetch } from "./api-client";

const getFilename = (response: Response, fallback: string) => {
    const disposition = response.headers.get("Content-Disposition") || "";
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    const value = utf8Match?.[1] || plainMatch?.[1];

    if (!value) {
        return fallback;
    }

    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
};

export async function downloadAttachment(
    id: string,
    fallbackName = "tep-dinh-kem",
) {
    const response = await apiFetch(
        `${BASE_URL}/attachments/${encodeURIComponent(id)}/download`,
        { method: "GET" },
        { auth: true },
    );
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = getFilename(response, fallbackName);
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
