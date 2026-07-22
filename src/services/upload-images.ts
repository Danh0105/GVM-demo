import { API, BASE_URL } from "@constants/common";
import { apiFetch } from "./api-client";

type UploadResponse = {
    error?: number;
    message?: string;
    data?: {
        domain?: string;
        images?: string[];
    };
    domain?: string;
    images?: string[];
};

export type UploadedImage = {
    src: string;
    name: string;
};

const joinUrl = (domain: string, path: string) => {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const uploadBase = domain || BASE_URL;

    return `${uploadBase.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

export async function uploadImages(files: File[]): Promise<UploadedImage[]> {
    const formData = new FormData();
    const fieldName = import.meta.env.VITE_UPLOAD_IMAGE_FIELD || "files";

    files.forEach(file => formData.append(fieldName, file, file.name));

    const response = await apiFetch(
        `${BASE_URL}${API.UPLOAD_IMAGE}`,
        {
            method: "POST",
            body: formData,
        },
        { auth: true },
    );
    const result = (await response.json()) as UploadResponse;

    if (result.error && result.error !== 0) {
        throw new Error(result.message || "Không thể tải ảnh lên.");
    }

    const data = result.data || result;
    const domain = data.domain || "";
    const images = data.images || [];

    if (!images.length) {
        throw new Error("API upload không trả về đường dẫn ảnh.");
    }

    return images.map(path => ({
        src: joinUrl(domain, path),
        name: path,
    }));
}
