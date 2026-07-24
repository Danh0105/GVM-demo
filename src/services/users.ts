import { SystemRole, User } from "@dts";
import {
    asRecord,
    firstString,
    nestedString,
    Page,
    unwrap,
    unwrapPage,
} from "./jsonUtils";
import { request } from "./request";

export const USER_ROLE_OPTIONS: Array<{ value: SystemRole; label: string }> = [
    { value: "USER", label: "USER" },
    { value: "ADMIN", label: "ADMIN" },
    { value: "WARD_CHAIRMAN", label: "WARD_CHAIRMAN: Chủ tịch phường" },
    { value: "NEIGHBORHOOD_HEAD", label: "NEIGHBORHOOD_HEAD: Trưởng khu phố" },
];

export type UserListQuery = {
    role?: SystemRole | "";
    keyword?: string;
    page?: number;
    size?: number;
};

export type UserPayload = {
    fullName?: string;
    name?: string;
    username?: string;
    zalo_id?: string;
    zaloId?: string;
    avatar?: string;
    email?: string;
    phone?: string;
    title?: string;
    position?: string;
    role: SystemRole;
    businessRole?: string;
    department?: string;
    departmentName?: string;
    status?: string;
};

const getDepartmentText = (value: unknown) => {
    const record = asRecord(value);

    return firstString(record, "departmentName", "department") ||
        nestedString(record, "department", "name", "title");
};

const mapUser = (value: unknown): User => {
    const user = asRecord(value);
    const name = firstString(user, "fullName", "name", "username");

    return {
        id: firstString(user, "id", "userId"),
        name,
        fullName: firstString(user, "fullName") || name,
        username: firstString(user, "username"),
        zalo_id: firstString(user, "zalo_id", "zaloId"),
        zaloId: firstString(user, "zaloId", "zalo_id"),
        avatar: firstString(user, "avatar", "avatarUrl"),
        email: firstString(user, "email"),
        phone: firstString(user, "phone", "phoneNumber"),
        title: firstString(user, "title"),
        position: firstString(user, "position", "jobTitle"),
        idByOA: firstString(user, "idByOA"),
        role: (firstString(user, "role", "systemRole") || "USER") as SystemRole,
        systemRole: (firstString(user, "systemRole", "role") ||
            "USER") as SystemRole,
        businessRole: firstString(user, "businessRole"),
        department: getDepartmentText(user),
        departmentName: getDepartmentText(user),
        status: firstString(user, "status"),
        lastLoginAt: firstString(user, "lastLoginAt"),
        createdAt: firstString(user, "createdAt"),
    };
};

export const getUsers = async (
    query: UserListQuery = {},
): Promise<Page<User>> => {
    const response = await request<unknown>("GET", "/users", query, {
        useAuth: true,
    });

    return unwrapPage(response, mapUser, "users");
};

export const createUser = async (payload: UserPayload): Promise<User> => {
    const response = await request<unknown>("POST", "/users", payload, {
        useAuth: true,
    });

    return mapUser(unwrap(response));
};

export const updateUser = async (
    id: string,
    payload: UserPayload,
): Promise<User> => {
    const response = await request<unknown>(
        "PATCH",
        `/users/${encodeURIComponent(id)}`,
        payload,
        { useAuth: true },
    );

    return mapUser(unwrap(response));
};
