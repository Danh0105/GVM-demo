import {
    getUserInfo,
    getAccessToken,
    followOA,
    openWebview,
    saveImageToGallery,
} from "zmp-sdk";
import { openMediaPicker } from "zmp-sdk/apis";
import { User } from "@dts";
import { ImageType } from "zmp-ui/image-viewer";

export const getZaloUserInfo = async (): Promise<User> => {
    try {
        const user = await getUserInfo({ avatarType: "normal" });
        const { userInfo } = user;

        return Promise.resolve(userInfo);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const getToken = async (): Promise<string> => {
    try {
        // Chỉ dùng ACCESS_TOKEN giả khi chạy development.
        // Xóa fallback này trước khi deploy production.
        const token = (await getAccessToken({})) || "ACCESS_TOKEN";

        return Promise.resolve(token);
    } catch (error) {
        return Promise.reject(error);
    }
};

export const followOfficialAccount = async ({
    id,
}: {
    id: string;
}): Promise<void> => {
    try {
        await followOA({ id });

        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

export const openWebView = async (link: string): Promise<void> => {
    try {
        await openWebview({ url: link });

        return Promise.resolve();
    } catch (error) {
        throw error;
    }
};

export const saveImage = async (img: string): Promise<void> => {
    try {
        await saveImageToGallery({
            imageBase64Data: img,
        });

        return Promise.resolve();
    } catch (error) {
        throw error;
    }
};

type CompressLevel = 0 | 1 | 2 | 3;

export interface PickImageParams {
    maxItemSize?: number;
    maxSelectItem?: number;
    serverUploadUrl: string;
    compressLevel?: CompressLevel;
}

/**
 * Hỗ trợ cấu trúc backend cũ:
 * {
 *   domain: "https://example.com",
 *   images: ["/uploads/image.jpg"]
 * }
 */
export interface LegacyUploadImageResponse {
    domain?: string;
    images?: string[];
}

/**
 * Hỗ trợ cấu trúc khuyến nghị của Zalo:
 * {
 *   error: 0,
 *   message: "Success",
 *   data: {
 *     urls: ["https://example.com/uploads/image.jpg"]
 *   }
 * }
 */
export interface UploadImageResponse {
    error?: number;
    message?: string;
    data?: {
        domain?: string;
        images?: string[];
        urls?: string[];
    };
    domain?: string;
    images?: string[];
    urls?: string[];
}

type UploadedImage = ImageType & {
    name: string;
};

const joinImageUrl = (domain: string, path: string): string => {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    if (!domain) {
        return path;
    }

    return `${domain.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const parseUploadResponse = (rawData: string): UploadImageResponse => {
    const normalizedData = rawData.trim();

    if (!normalizedData) {
        throw new Error(
            "API upload ảnh không trả về dữ liệu. Vui lòng kiểm tra endpoint /upload_image_api.",
        );
    }

    try {
        return JSON.parse(normalizedData) as UploadImageResponse;
    } catch (error) {
        console.error("Phản hồi upload ảnh không phải JSON hợp lệ:", {
            rawData,
            error,
        });

        throw new Error(
            "API upload ảnh trả về dữ liệu không đúng định dạng JSON.",
        );
    }
};

export const pickImages = async (
    params: PickImageParams,
): Promise<UploadedImage[]> => {
    try {
        const response = await openMediaPicker({
            type: "photo",
            maxItemSize: params.maxItemSize || 5 * 1024 * 1024,
            maxSelectItem: params.maxSelectItem || 1,
            serverUploadUrl: params.serverUploadUrl,
            compressLevel: params.compressLevel ?? 2,
        });

        const { data } = response;

        console.log("Phản hồi openMediaPicker:", data);

        /**
         * Trường hợp SDK trả về đường dẫn file tạm trên thiết bị.
         * Thường xảy ra khi không upload trực tiếp lên server.
         */
        if (Array.isArray(data)) {
            return data.map(path => ({
                src: path,
                name: path,
            }));
        }

        const result = parseUploadResponse(data);

        if (typeof result.error === "number" && result.error !== 0) {
            throw new Error(result.message || "Máy chủ từ chối tải hình ảnh.");
        }

        const resultData = result.data || result;

        const domain = resultData.domain || result.domain || "";

        const images =
            resultData.urls ||
            resultData.images ||
            result.urls ||
            result.images ||
            [];

        if (!Array.isArray(images) || images.length === 0) {
            console.error("API upload ảnh thiếu danh sách images hoặc urls:", {
                result,
            });

            throw new Error("API upload ảnh chưa trả về danh sách hình ảnh.");
        }

        return images.map(image => ({
            src: joinImageUrl(domain, image),
            name: image,
        }));
    } catch (error) {
        console.error("Lỗi pickImages:", error);

        return Promise.reject(error);
    }
};
