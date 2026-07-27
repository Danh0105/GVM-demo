import { SystemRole, User } from "@dts";

export const SYSTEM_ROLES = {
    USER: "USER",
    ADMIN: "ADMIN",
    WARD_CHAIRMAN: "WARD_CHAIRMAN",
    NEIGHBORHOOD_HEAD: "NEIGHBORHOOD_HEAD",
} as const;

const normalizeSystemRole = (role?: string): SystemRole => {
    const normalized = String(role || SYSTEM_ROLES.USER).toUpperCase();

    if (Object.values(SYSTEM_ROLES).includes(normalized as SystemRole)) {
        return normalized as SystemRole;
    }

    return SYSTEM_ROLES.USER;
};

export const getSystemRole = (user?: User): SystemRole =>
    normalizeSystemRole(user?.systemRole || user?.role);

export const getUserRole = getSystemRole;

export const canUseMeetings = (user?: User): boolean => {
    const role = getSystemRole(user);

    return (
        role === SYSTEM_ROLES.USER ||
        role === SYSTEM_ROLES.WARD_CHAIRMAN ||
        role === SYSTEM_ROLES.NEIGHBORHOOD_HEAD
    );
};

export const canAssignTasks = (user?: User): boolean =>
    getSystemRole(user) === SYSTEM_ROLES.WARD_CHAIRMAN;

export const canReceiveTasks = (user?: User): boolean =>
    getSystemRole(user) === SYSTEM_ROLES.NEIGHBORHOOD_HEAD;

export const canManageUsers = (user?: User): boolean =>
    getSystemRole(user) === SYSTEM_ROLES.ADMIN;
