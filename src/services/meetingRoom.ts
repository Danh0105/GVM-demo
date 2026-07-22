import { BASE_URL } from "@constants/common";
import { shortcutData } from "@/datas/meetingRoomData";
import {
    Attendance,
    AttendanceStatus,
    DocumentType,
    Meeting,
    MeetingActionPayload,
    MeetingDocument,
    MeetingMinute,
    MeetingNotification,
    MeetingParticipant,
    MeetingStatus,
    ParticipationStatus,
    ShortcutItem,
    UserInfo,
} from "@/pages/MeetingRoomm/types";
import { apiFetch } from "./api-client";

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as JsonRecord)
        : {};

const asArray = (value: unknown): unknown[] =>
    Array.isArray(value) ? value : [];

const firstString = (record: JsonRecord, ...keys: string[]) => {
    const value = keys
        .map(key => record[key])
        .find(
            candidate =>
                (typeof candidate === "string" && Boolean(candidate.trim())) ||
                typeof candidate === "number",
        );

    return value === undefined ? "" : String(value);
};

const nestedString = (
    record: JsonRecord,
    objectKey: string,
    ...keys: string[]
) => firstString(asRecord(record[objectKey]), ...keys);

const unwrap = (value: unknown): unknown => {
    const record = asRecord(value);

    if (Object.prototype.hasOwnProperty.call(record, "data")) {
        return record.data;
    }

    return value;
};

const unwrapList = (value: unknown, ...keys: string[]): unknown[] => {
    const unwrapped = unwrap(value);

    if (Array.isArray(unwrapped)) {
        return unwrapped;
    }

    const record = asRecord(unwrapped);

    const list = [...keys, "items", "results", "data"]
        .map(key => record[key])
        .find(Array.isArray);

    return list || [];
};

async function getJson(
    path: string,
    query: Record<string, string | number | undefined> = {},
) {
    const url = new URL(`${BASE_URL}${path}`);

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            url.searchParams.set(key, String(value));
        }
    });

    const response = await apiFetch(
        url,
        {
            method: "GET",
            headers: { Accept: "application/json" },
        },
        { auth: true },
    );

    return response.json() as Promise<unknown>;
}

const PAGE_SIZE = 200;
const MAX_PAGES = 50;

const getResponseTotal = (value: unknown) => {
    const body = asRecord(unwrap(value));
    const pagination = asRecord(body.pagination || body.meta);
    const total = Number(
        body.total ??
            body.totalItems ??
            pagination.total ??
            pagination.totalItems,
    );

    return Number.isFinite(total) && total >= 0 ? total : undefined;
};

async function getAllPages(
    path: string,
    listKeys: string[],
    query: Record<string, string | number | undefined> = {},
    page = 0,
    collected: unknown[] = [],
): Promise<unknown[]> {
    const response = await getJson(path, {
        ...query,
        page,
        size: PAGE_SIZE,
    });
    const items = unwrapList(response, ...listKeys);
    const nextItems = [...collected, ...items];
    const total = getResponseTotal(response);
    const reachedEnd =
        items.length < PAGE_SIZE ||
        (total !== undefined && nextItems.length >= total) ||
        page + 1 >= MAX_PAGES;

    return reachedEnd
        ? nextItems
        : getAllPages(path, listKeys, query, page + 1, nextItems);
}

const normalizeMeetingStatus = (value: string): MeetingStatus => {
    switch (value.toUpperCase()) {
        case "IN_PROGRESS":
        case "ONGOING":
            return "ongoing";
        case "COMPLETED":
            return "completed";
        case "CANCELLED":
            return "cancelled";
        default:
            return "upcoming";
    }
};

const normalizeParticipationStatus = (value: string): ParticipationStatus => {
    switch (value.toUpperCase()) {
        case "ACCEPTED":
        case "CONFIRMED":
            return "accepted";
        case "DECLINED":
        case "REJECTED":
            return "declined";
        case "DELEGATED":
            return "delegated";
        default:
            return "pending";
    }
};

const normalizeAttendanceStatus = (value: string): AttendanceStatus => {
    switch (value.toUpperCase()) {
        case "ABSENT":
            return "absent";
        case "DELEGATED":
            return "delegated";
        default:
            return "checked-in";
    }
};

const mapParticipant = (value: unknown, index: number): MeetingParticipant => {
    const participant = asRecord(value);
    const user = asRecord(participant.user);

    return {
        id:
            firstString(participant, "id", "userId") ||
            firstString(user, "id") ||
            `participant-${index}`,
        name:
            firstString(participant, "name", "fullName") ||
            firstString(user, "name", "fullName") ||
            "Người tham dự",
        position:
            firstString(participant, "position", "jobTitle") ||
            firstString(user, "position", "jobTitle"),
        department:
            firstString(participant, "departmentName", "department") ||
            nestedString(participant, "department", "name", "title") ||
            nestedString(user, "department", "name", "title"),
        attendanceStatus: participant.attendanceStatus
            ? normalizeAttendanceStatus(String(participant.attendanceStatus))
            : undefined,
    };
};

const mapMeeting = (value: unknown): Meeting => {
    const meeting = asRecord(value);
    const participants = asArray(
        meeting.participants || meeting.attendees || meeting.invitees,
    );
    const documents = asArray(meeting.documents || meeting.attachments);
    const status = firstString(meeting, "status");

    return {
        id: firstString(meeting, "id", "meetingId"),
        title:
            firstString(meeting, "title", "name", "subject") ||
            "Cuộc họp chưa có tiêu đề",
        startAt:
            firstString(
                meeting,
                "startAt",
                "startTime",
                "scheduledAt",
                "startDate",
            ) || new Date().toISOString(),
        endAt:
            firstString(meeting, "endAt", "endTime", "endDate") ||
            firstString(meeting, "startAt", "startTime", "scheduledAt") ||
            new Date().toISOString(),
        location:
            firstString(meeting, "location", "roomName") ||
            nestedString(meeting, "room", "name", "title") ||
            "Chưa cập nhật phòng họp",
        host:
            firstString(meeting, "hostName", "chairperson") ||
            nestedString(meeting, "host", "fullName", "name") ||
            "Chưa cập nhật người chủ trì",
        status: normalizeMeetingStatus(status),
        participationStatus: normalizeParticipationStatus(
            firstString(meeting, "participationStatus", "responseStatus"),
        ),
        participants: participants.map(mapParticipant),
        documentIds: documents
            .map(document =>
                firstString(asRecord(document), "id", "documentId"),
            )
            .filter(Boolean),
        minutesId:
            firstString(meeting, "minutesId") ||
            nestedString(meeting, "minutes", "id"),
        agenda: firstString(meeting, "agenda", "description", "content"),
    };
};

const getFileType = (document: JsonRecord): DocumentType => {
    const explicitType = firstString(document, "fileType", "extension")
        .replace(/^\./, "")
        .toUpperCase();
    const fileName = firstString(
        document,
        "fileName",
        "originalName",
        "name",
        "title",
    );
    const extension = fileName.split(".").pop()?.toUpperCase() || "";
    const type = explicitType || extension;

    return (
        ["PDF", "DOCX", "XLSX", "PPTX"].includes(type) ? type : "PDF"
    ) as DocumentType;
};

const mapDocument = (value: unknown): MeetingDocument => {
    const document = asRecord(value);

    return {
        id: firstString(document, "id", "documentId"),
        title:
            firstString(document, "title", "name", "fileName") ||
            "Tài liệu cuộc họp",
        fileType: getFileType(document),
        updatedAt:
            firstString(document, "updatedAt", "createdAt") ||
            new Date().toISOString(),
        uploadedBy:
            firstString(document, "uploadedByName", "createdByName") ||
            nestedString(document, "uploadedBy", "fullName", "name") ||
            "Chưa cập nhật",
        meetingId:
            firstString(document, "meetingId") ||
            nestedString(document, "meeting", "id"),
        meetingTitle:
            firstString(document, "meetingTitle") ||
            nestedString(document, "meeting", "title", "name"),
        category:
            firstString(document, "categoryName", "category") ||
            nestedString(document, "documentCategory", "title", "name") ||
            "Tài liệu",
        fileUrl: "",
    };
};

const mapMinute = (value: unknown, meeting?: Meeting): MeetingMinute => {
    const minute = asRecord(value);

    return {
        id: firstString(minute, "id", "minuteId") || `minute-${meeting?.id}`,
        title:
            firstString(minute, "title", "name") ||
            `Biên bản ${meeting?.title || "cuộc họp"}`,
        meetingId: firstString(minute, "meetingId") || meeting?.id || "",
        meetingTitle:
            firstString(minute, "meetingTitle") || meeting?.title || "Cuộc họp",
        createdAt:
            firstString(minute, "createdAt", "updatedAt", "approvedAt") ||
            meeting?.endAt ||
            new Date().toISOString(),
        author:
            firstString(minute, "authorName", "createdByName") ||
            nestedString(minute, "author", "fullName", "name") ||
            "Chưa cập nhật",
        summary: firstString(minute, "summary", "content", "conclusion"),
        pdfUrl: "",
    };
};

const mapAttendance = (value: unknown, meeting?: Meeting): Attendance => {
    const attendance = asRecord(value);

    return {
        id:
            firstString(attendance, "id", "attendanceId") ||
            `attendance-${meeting?.id}`,
        meetingId: firstString(attendance, "meetingId") || meeting?.id || "",
        meetingTitle:
            firstString(attendance, "meetingTitle") ||
            meeting?.title ||
            "Cuộc họp",
        time:
            firstString(attendance, "checkedInAt", "time", "updatedAt") ||
            meeting?.startAt ||
            new Date().toISOString(),
        location:
            firstString(attendance, "location") || meeting?.location || "",
        status: normalizeAttendanceStatus(
            firstString(attendance, "status", "attendanceStatus"),
        ),
        note: firstString(attendance, "note", "reason"),
    };
};

const mapNotification = (
    value: unknown,
    index: number,
): MeetingNotification => {
    const notification = asRecord(value);

    return {
        id: firstString(notification, "id", "messageId") || `message-${index}`,
        title:
            firstString(notification, "title", "subject") ||
            "Cập nhật cuộc họp",
        summary: firstString(notification, "summary", "content", "message"),
        time:
            firstString(notification, "createdAt", "time") ||
            new Date().toISOString(),
        isRead: Boolean(notification.isRead || notification.readAt),
        meetingId: firstString(notification, "meetingId"),
    };
};

export const getMeetingUser = async (): Promise<UserInfo> => {
    const response = await getJson("/meeting-dashboard");
    const dashboard = asRecord(unwrap(response));
    const user = asRecord(
        dashboard.user || dashboard.currentUser || dashboard.profile,
    );

    return {
        fullName: firstString(user, "fullName", "name") || "Người dùng Zalo",
        position: firstString(user, "position", "jobTitle"),
        department:
            firstString(user, "departmentName", "department") ||
            nestedString(user, "department", "name", "title"),
        phone: firstString(user, "phone", "phoneNumber"),
        avatarUrl: firstString(user, "avatarUrl", "avatar"),
    };
};

export const getMeetings = async (): Promise<Meeting[]> => {
    const meetings = await getAllPages("/meetings", ["meetings"]);

    return meetings.map(mapMeeting);
};

export const getMeetingById = async (id: string): Promise<Meeting> => {
    const response = await getJson(`/meetings/${encodeURIComponent(id)}`);

    return mapMeeting(unwrap(response));
};

export const getMeetingDocuments = async (): Promise<MeetingDocument[]> => {
    const documents = await getAllPages("/documents", ["documents"]);

    return documents.map(mapDocument);
};

export const getMeetingDocumentsByMeetingId = async (
    meetingId: string,
): Promise<MeetingDocument[]> => {
    const documents = await getAllPages("/documents", ["documents"], {
        meetingId,
    });

    return documents.map(mapDocument);
};

export const getMeetingMinutesByMeetingId = async (
    meetingId: string,
    meeting?: Meeting,
): Promise<MeetingMinute[]> => {
    const response = await getJson(
        `/meetings/${encodeURIComponent(meetingId)}/minutes`,
    );
    const data = unwrap(response);
    const list = unwrapList(data, "minutes");

    if (list.length > 0) {
        return list.map(item => mapMinute(item, meeting));
    }

    return Object.keys(asRecord(data)).length ? [mapMinute(data, meeting)] : [];
};

export const getMeetingMinutes = async (): Promise<MeetingMinute[]> => {
    const meetings = await getMeetings();
    const minutes = await Promise.all(
        meetings.map(async meeting => {
            try {
                return await getMeetingMinutesByMeetingId(meeting.id, meeting);
            } catch {
                return [];
            }
        }),
    );

    return minutes.flat();
};

export const getMeetingAttendance = async (): Promise<Attendance[]> => {
    const meetings = await getMeetings();
    const attendanceGroups = await Promise.all(
        meetings.map(async meeting => {
            try {
                const response = await getJson(
                    `/meetings/${encodeURIComponent(meeting.id)}/attendance`,
                );

                return unwrapList(response, "attendance", "attendees").map(
                    item => mapAttendance(item, meeting),
                );
            } catch {
                return [];
            }
        }),
    );

    return attendanceGroups.flat();
};

export const getMeetingNotifications = async (): Promise<
    MeetingNotification[]
> => {
    const response = await getJson("/meeting-dashboard");
    const dashboard = asRecord(unwrap(response));

    return asArray(dashboard.notifications || dashboard.messages).map(
        mapNotification,
    );
};

export const getMeetingShortcuts = (): Promise<ShortcutItem[]> =>
    Promise.resolve(shortcutData);

export const submitMeetingParticipation = async (
    _meetingId: string,
    payload: MeetingActionPayload,
): Promise<ParticipationStatus> => payload.type;

const getFilename = (response: Response, fallback: string) => {
    const disposition = response.headers.get("Content-Disposition") || "";
    const match =
        disposition.match(/filename\*=UTF-8''([^;]+)/i) ||
        disposition.match(/filename="?([^";]+)"?/i);

    if (!match?.[1]) {
        return fallback;
    }

    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
};

const getDocumentBlob = (id: string, action: "download" | "preview") =>
    apiFetch(
        `${BASE_URL}/documents/${encodeURIComponent(id)}/${action}`,
        { method: "GET" },
        { auth: true },
    );

export const downloadMeetingDocument = async (
    id: string,
    fallbackName: string,
) => {
    const response = await getDocumentBlob(id, "download");
    const objectUrl = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = getFilename(response, fallbackName);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export const previewMeetingDocument = async (id: string) => {
    const previewWindow = window.open("", "_blank");

    try {
        const response = await getDocumentBlob(id, "preview");
        const objectUrl = URL.createObjectURL(await response.blob());

        if (previewWindow) {
            previewWindow.opener = null;
            previewWindow.location.href = objectUrl;
        } else {
            const anchor = document.createElement("a");

            anchor.href = objectUrl;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            anchor.click();
        }

        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
        previewWindow?.close();
        throw error;
    }
};
