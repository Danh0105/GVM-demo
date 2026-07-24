import { User } from "@dts";
import { apiFetch } from "./api-client";

export type SatisfactionRatingLevel = 1 | 2 | 3 | 4 | 5;

export interface CreateSatisfactionRatingPayload {
    rating: SatisfactionRatingLevel;
    content?: string;
    serviceName?: string;
    departmentName?: string;
    zaloUser?: {
        id?: string;
        name?: string;
        avatar?: string;
        phone?: string;
        email?: string;
    };
}

export interface SatisfactionRating {
    id?: string;
    rating: SatisfactionRatingLevel;
    content?: string;
    serviceName?: string;
    departmentName?: string;
    createdAt?: string;
}

const normalizeZaloUser = (user?: User) => ({
    id: user?.zaloId || user?.zalo_id || user?.id,
    name: user?.fullName || user?.name || user?.username,
    avatar: user?.avatar,
    phone: user?.phone,
    email: user?.email,
});

export async function createSatisfactionRating(
    payload: Omit<CreateSatisfactionRatingPayload, "zaloUser">,
    user?: User,
    authenticated = false,
) {
    const response = await apiFetch(
        "/satisfaction-ratings",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...payload,
                zaloUser: normalizeZaloUser(user),
            }),
        },
        { auth: authenticated },
    );

    const data = await response.json().catch(() => undefined);

    return (data?.data || data) as SatisfactionRating;
}
