import { ApiError } from "@/services/api-client";

export const getFriendlyErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        if (error.status === 403) {
            return "Bạn không có quyền thực hiện thao tác này.";
        }

        return error.message;
    }

    return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
};

export const isForbiddenError = (error: unknown): boolean =>
    error instanceof ApiError && error.status === 403;
