import {
    AttendanceStatus,
    MeetingStatus,
    ParticipationStatus,
} from "./types";

export const formatDateTime = (value: string): string =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));

export const formatDate = (value: string): string =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));

export const getMeetingStatusText = (status: MeetingStatus): string => {
    const statusMap: Record<MeetingStatus, string> = {
        upcoming: "Sắp diễn ra",
        ongoing: "Đang diễn ra",
        completed: "Đã kết thúc",
        cancelled: "Đã hủy",
    };

    return statusMap[status];
};

export const getParticipationText = (status: ParticipationStatus): string => {
    const statusMap: Record<ParticipationStatus, string> = {
        pending: "Chờ phản hồi",
        accepted: "Đồng ý tham gia",
        declined: "Không tham gia",
        delegated: "Đã chuyển người tham gia",
    };

    return statusMap[status];
};

export const getAttendanceText = (status: AttendanceStatus): string => {
    const statusMap: Record<AttendanceStatus, string> = {
        "checked-in": "Đã điểm danh",
        absent: "Vắng mặt",
        delegated: "Được chuyển tham dự",
    };

    return statusMap[status];
};

export const isWithinFilter = (
    value: string,
    filter: "day" | "week" | "month" | "all",
): boolean => {
    if (filter === "all") {
        return true;
    }

    const date = new Date(value);
    const now = new Date();

    if (filter === "day") {
        return date.toDateString() === now.toDateString();
    }

    if (filter === "week") {
        const diffTime = Math.abs(date.getTime() - now.getTime());
        return diffTime <= 7 * 24 * 60 * 60 * 1000;
    }

    return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
};
