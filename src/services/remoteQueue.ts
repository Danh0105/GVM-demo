import { ApiError } from "./api-client";
import {
    asArray,
    asRecord,
    firstBoolean,
    firstNumber,
    firstString,
    Page,
    unwrap,
    unwrapPage,
} from "./jsonUtils";
import { request } from "./request";

export type RemoteQueueTicketStatus =
    | "WAITING"
    | "SERVING"
    | "COMPLETED"
    | "CANCELLED"
    | "SKIPPED"
    | "EXPIRED";

export type RemoteQueueDesk = {
    id: string;
    name: string;
    code: string;
    category: string;
    services: string;
    assignedUserName: string | null;
    assignedUserTitle: string | null;
    status: "active" | "paused" | "unassigned" | "offline";
    currentServingNumber: string | null;
    assignee: DeskAssignee | null;
    assignees: DeskAssignee[];
    isActive: boolean;
    sortOrder: number;
    waiting: number;
};

export type DeskAssignee = {
    id: string;
    name: string;
    avatar: string | null;
    fullName: string;
    avatarUrl?: string | null;
    position?: string | null;
    departmentName?: string | null;
};

export type RemoteQueueDeskViewModel = RemoteQueueDesk;

export type RemoteQueueTicket = {
    id: string;
    number: string;
    deskId: string;
    deskName: string | null;
    deskCode: string | null;
    category: string | null;
    assignedUserName: string | null;
    assignedUserTitle: string | null;
    serviceDate: string;
    createdAt: string;
    status: RemoteQueueTicketStatus;
    cancelReason: string | null;
    servedAt: string | null;
    completedAt: string | null;
    peopleAhead?: number;
};

const getPersonName = (value: unknown) => {
    if (typeof value === "string" && !/^[0-9a-f-]{24,}$/i.test(value)) {
        return value;
    }

    const person = asRecord(value);

    return firstString(
        person,
        "fullName",
        "name",
        "username",
        "displayName",
        "display_name",
        "staffName",
        "officerName",
        "employeeName",
        "assigneeName",
        "assignedToName",
        "responsiblePersonName",
        "responsibleUserName",
        "clerkName",
        "tellerName",
        "processorName",
        "servingUserName",
    );
};

const getPersonTitle = (value: unknown) => {
    if (typeof value === "string" && !/^[0-9a-f-]{24,}$/i.test(value)) {
        return value;
    }

    const person = asRecord(value);

    return firstString(
        person,
        "title",
        "position",
        "roleName",
        "businessRole",
        "jobTitle",
    );
};

const getDepartmentName = (value: unknown) => {
    const person = asRecord(value);
    const department = asRecord(person.department);

    return (
        firstString(person, "departmentName", "unitName", "organizationName") ||
        firstString(department, "name", "title")
    );
};

const getPersonAvatar = (value: unknown) => {
    const person = asRecord(value);

    return (
        firstString(
            person,
            "avatar",
            "avatarUrl",
            "avatar_url",
            "photo",
            "photoUrl",
            "image",
            "imageUrl",
        ) || null
    );
};

const normalizeAssignee = (value: unknown): DeskAssignee | null => {
    const person = asRecord(value);
    const fullName = getPersonName(value);

    if (!fullName) {
        return null;
    }

    return {
        id: firstString(person, "id", "userId", "staffId", "employeeId"),
        name: fullName,
        avatar: getPersonAvatar(value),
        fullName,
        avatarUrl: getPersonAvatar(value),
        position: getPersonTitle(value) || null,
        departmentName: getDepartmentName(value) || null,
    };
};

const assignedObjectKeys = [
    "assignedUser",
    "assignedStaff",
    "assignedOfficer",
    "assignedTo",
    "assignee",
    "staff",
    "officer",
    "employee",
    "handler",
    "currentAssignee",
    "responsiblePerson",
    "responsibleUser",
    "clerk",
    "teller",
    "processor",
    "servingUser",
    "currentUser",
    "user",
    "person",
    "profile",
];

const assignedArrayKeys = [
    "assignedUsers",
    "assignedStaffs",
    "assignedOfficers",
    "assignees",
    "staffs",
    "officers",
    "employees",
    "handlers",
    "responsiblePeople",
    "responsibleUsers",
    "users",
];

const assignmentContainerKeys = [
    "assignment",
    "currentAssignment",
    "deskAssignment",
    "queueAssignment",
    "servingAssignment",
];

const currentAssignmentKeys = [
    "currentAssignment",
    "activeAssignment",
    "deskAssignment",
    "queueAssignment",
    "servingAssignment",
    "assignment",
];

const uniqueValues = (values: string[]) =>
    Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));

const hasAssignmentEnded = (value: unknown) => {
    const record = asRecord(value);

    return Boolean(
        firstString(
            record,
            "endedAt",
            "endAt",
            "endTime",
            "ended_at",
            "unassignedAt",
            "inactiveAt",
        ),
    );
};

const isAssignmentActive = (value: unknown) => {
    const record = asRecord(value);
    const status = firstString(record, "status", "state").toLowerCase();

    if (hasAssignmentEnded(record)) {
        return false;
    }

    if (["inactive", "ended", "cancelled", "canceled", "expired"].includes(status)) {
        return false;
    }

    if (["active", "current", "serving"].includes(status)) {
        return true;
    }

    return firstBoolean(record, "isActive", "active", "current") || !status;
};

const getAssignmentAssignee = (value: unknown) => {
    const record = asRecord(value);

    return (
        normalizeAssignee(record.user) ||
        normalizeAssignee(record.assignee) ||
        normalizeAssignee(record.assignedTo) ||
        normalizeAssignee(record.staff) ||
        normalizeAssignee(record.officer) ||
        normalizeAssignee(record.employee) ||
        normalizeAssignee(record.handler) ||
        normalizeAssignee(record.responsiblePerson) ||
        normalizeAssignee(record)
    );
};

const getActiveAssignmentAssignee = (record: ReturnType<typeof asRecord>) => {
    const directAssignment = currentAssignmentKeys
        .map(key => record[key])
        .find(value => isAssignmentActive(value) && getAssignmentAssignee(value));

    if (directAssignment) {
        return getAssignmentAssignee(directAssignment);
    }

    const activeAssignment = [
        ...asArray(record.assignments),
        ...asArray(record.assignmentHistory),
        ...asArray(record.deskAssignments),
        ...asArray(record.queueAssignments),
    ].find(value => isAssignmentActive(value) && getAssignmentAssignee(value));

    return activeAssignment ? getAssignmentAssignee(activeAssignment) : null;
};

const uniqueAssignees = (values: DeskAssignee[]) => {
    const seen = new Set<string>();

    return values.filter(assignee => {
        const key = assignee.id || assignee.fullName;

        if (!key || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
};

const getDeskAssignees = (record: ReturnType<typeof asRecord>) => {
    const directAssignees = asArray(record.assignees)
        .map(normalizeAssignee)
        .filter((assignee): assignee is DeskAssignee => Boolean(assignee));

    if (directAssignees.length > 0) {
        return uniqueAssignees(directAssignees);
    }

    const activeAssignmentAssignee = getActiveAssignmentAssignee(record);
    const legacyAssignees = [
        activeAssignmentAssignee,
        ...assignedObjectKeys.map(key => normalizeAssignee(record[key])),
        ...assignedArrayKeys.flatMap(key =>
            asArray(record[key]).map(normalizeAssignee),
        ),
    ].filter((assignee): assignee is DeskAssignee => Boolean(assignee));

    return uniqueAssignees(legacyAssignees);
};

const getAssignedNamesFromArrays = (record: ReturnType<typeof asRecord>) =>
    assignedArrayKeys.flatMap(key =>
        asArray(record[key]).map(
            item => getPersonName(item) || getAssignedUserName(asRecord(item)),
        ),
    );

const getAssignedNameFromContainers = (record: ReturnType<typeof asRecord>) =>
    assignmentContainerKeys
        .map(key => getAssignmentAssignee(record[key])?.fullName || "")
        .find(Boolean) || "";

function getAssignedUserName(record: ReturnType<typeof asRecord>): string {
    const directName = firstString(
        record,
        "assignedUserName",
        "assignedStaffName",
        "assignedOfficerName",
        "assignedToName",
        "assigneeName",
        "staffName",
        "officerName",
        "employeeName",
        "handlerName",
        "currentAssigneeName",
        "responsiblePersonName",
        "responsibleUserName",
        "clerkName",
        "tellerName",
        "processorName",
        "servingUserName",
    );

    if (directName) {
        return directName;
    }

    const nestedName =
        assignedObjectKeys.map(key => getPersonName(record[key])).find(Boolean) ||
        getAssignedNameFromContainers(record);

    if (nestedName) {
        return nestedName;
    }

    return uniqueValues(getAssignedNamesFromArrays(record)).join(", ");
}

const getAssignedTitlesFromArrays = (record: ReturnType<typeof asRecord>) =>
    assignedArrayKeys.flatMap(key =>
        asArray(record[key]).map(
            item => getPersonTitle(item) || getAssignedUserTitle(asRecord(item)),
        ),
    );

const getAssignedTitleFromContainers = (record: ReturnType<typeof asRecord>) =>
    assignmentContainerKeys
        .map(key => {
            const assignee = getAssignmentAssignee(record[key]);

            return assignee?.position || assignee?.departmentName || "";
        })
        .find(Boolean) || "";

function getAssignedUserTitle(record: ReturnType<typeof asRecord>): string {
    const directTitle = firstString(
        record,
        "assignedUserTitle",
        "assignedStaffTitle",
        "assignedOfficerTitle",
        "assignedToTitle",
        "assigneeTitle",
        "staffTitle",
        "officerTitle",
        "employeeTitle",
        "handlerTitle",
        "currentAssigneeTitle",
        "responsiblePersonTitle",
        "responsibleUserTitle",
        "clerkTitle",
        "tellerTitle",
        "processorTitle",
        "servingUserTitle",
        "position",
    );

    if (directTitle) {
        return directTitle;
    }

    const nestedTitle =
        assignedObjectKeys
            .map(key => getPersonTitle(record[key]))
            .find(Boolean) || getAssignedTitleFromContainers(record);

    if (nestedTitle) {
        return nestedTitle;
    }

    return uniqueValues(getAssignedTitlesFromArrays(record)).join(", ");
}

export type RemoteQueueTicketPageQuery = {
    page?: number;
    size?: number;
    status?: RemoteQueueTicketStatus | "";
};

export type QueueUpdatedPayload = {
    deskId: string;
    serviceDate: string;
    waiting: number;
    currentServingNumber?: string | null;
    desk?: unknown;
};

const getCurrentServingNumber = (record: ReturnType<typeof asRecord>) => {
    const currentTicket = asRecord(record.currentTicket || record.servingTicket);

    return (
        firstString(
            record,
            "currentServingNumber",
            "servingNumber",
            "currentNumber",
            "currentTicketNumber",
            "servingTicketNumber",
        ) || firstString(currentTicket, "number", "ticketNumber")
    );
};

const normalizeDeskStatus = (
    record: ReturnType<typeof asRecord>,
    isActive: boolean,
    assignee: DeskAssignee | null,
): RemoteQueueDesk["status"] => {
    const status = firstString(record, "status", "state").toLowerCase();

    if (["offline", "closed"].includes(status)) {
        return "offline";
    }

    if (["paused", "suspended", "inactive", "disabled"].includes(status)) {
        return "paused";
    }

    if (!assignee) {
        return "unassigned";
    }

    if (!isActive) {
        return "paused";
    }

    return "active";
};

export function normalizeDesk(value: unknown): RemoteQueueDeskViewModel {
    const desk = asRecord(value);
    const assignees = getDeskAssignees(desk);
    const assignee = assignees[0] || null;
    const isActive = firstBoolean(desk, "isActive", "active");
    const assignedUserTitle =
        assignee?.position || assignee?.departmentName || getAssignedUserTitle(desk);

    return {
        id: firstString(desk, "id", "deskId"),
        name: firstString(desk, "name") || "Quầy tiếp nhận",
        code: firstString(desk, "code").toUpperCase(),
        category: firstString(desk, "category"),
        services: firstString(desk, "services", "description"),
        assignedUserName: assignee?.fullName || getAssignedUserName(desk) || null,
        assignedUserTitle: assignedUserTitle || null,
        status: normalizeDeskStatus(desk, isActive, assignee),
        currentServingNumber: getCurrentServingNumber(desk) || null,
        assignee,
        assignees,
        isActive,
        sortOrder: firstNumber(desk, "sortOrder", "order"),
        waiting: firstNumber(desk, "waiting"),
    };
}

const mapDesk = normalizeDesk;

export const mapRemoteQueueTicket = (value: unknown): RemoteQueueTicket => {
    const ticket = asRecord(value);

    return {
        id: firstString(ticket, "id", "ticketId"),
        number: firstString(ticket, "number", "ticketNumber"),
        deskId: firstString(ticket, "deskId"),
        deskName: firstString(ticket, "deskName") || null,
        deskCode: firstString(ticket, "deskCode") || null,
        category: firstString(ticket, "category") || null,
        assignedUserName: getAssignedUserName(ticket) || null,
        assignedUserTitle: getAssignedUserTitle(ticket) || null,
        serviceDate: firstString(ticket, "serviceDate"),
        createdAt: firstString(ticket, "createdAt"),
        status: (firstString(ticket, "status") ||
            "WAITING") as RemoteQueueTicketStatus,
        cancelReason: firstString(ticket, "cancelReason") || null,
        servedAt: firstString(ticket, "servedAt") || null,
        completedAt: firstString(ticket, "completedAt") || null,
        peopleAhead:
            ticket.peopleAhead === undefined
                ? undefined
                : firstNumber(ticket, "peopleAhead"),
    };
};

export const getRemoteQueueDesks = async (): Promise<RemoteQueueDesk[]> => {
    const response = await request<unknown>(
        "GET",
        "/remote-queue/desks",
        { includeInactive: false },
        { useAuth: true },
    );
    const data = unwrap(response);
    const record = asRecord(data);
    const items = asArray(record.items || data);

    return items.map(mapDesk);
};

export const createRemoteQueueTicket = async (
    deskId: string,
): Promise<RemoteQueueTicket> => {
    const response = await request<unknown>(
        "POST",
        "/remote-queue/tickets",
        { deskId },
        { useAuth: true },
    );

    return mapRemoteQueueTicket(unwrap(response));
};

export const getMyActiveRemoteQueueTicket =
    async (): Promise<RemoteQueueTicket | null> => {
        const response = await request<unknown>(
            "GET",
            "/remote-queue/my-active-ticket",
            undefined,
            { useAuth: true },
        );
        const data = unwrap(response);

        return data ? mapRemoteQueueTicket(data) : null;
    };

export const getRemoteQueueTicket = async (
    id: string,
): Promise<RemoteQueueTicket> => {
    const response = await request<unknown>(
        "GET",
        `/remote-queue/tickets/${encodeURIComponent(id)}`,
        undefined,
        { useAuth: true },
    );

    return mapRemoteQueueTicket(unwrap(response));
};

export const cancelRemoteQueueTicket = async (
    id: string,
    reason?: string,
): Promise<RemoteQueueTicket> => {
    const response = await request<unknown>(
        "PATCH",
        `/remote-queue/tickets/${encodeURIComponent(id)}/cancel`,
        reason ? { reason } : {},
        { useAuth: true },
    );

    return mapRemoteQueueTicket(unwrap(response));
};

export const getMyRemoteQueueTickets = async (
    query: RemoteQueueTicketPageQuery = {},
): Promise<Page<RemoteQueueTicket>> => {
    const response = await request<unknown>(
        "GET",
        "/remote-queue/my-tickets",
        query,
        { useAuth: true },
    );

    return unwrapPage(response, mapRemoteQueueTicket, "items", "tickets");
};

export const getActiveTicketFromError = (
    error: unknown,
): RemoteQueueTicket | undefined => {
    if (!(error instanceof ApiError) || error.error !== "ACTIVE_TICKET_EXISTS") {
        return undefined;
    }

    return error.details ? mapRemoteQueueTicket(error.details) : undefined;
};
