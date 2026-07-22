import {
    attendanceData,
    documentData,
    meetingData,
    minutesData,
    notificationData,
    shortcutData,
    userInfoData,
} from "@/datas/meetingRoomData";
import {
    Attendance,
    Meeting,
    MeetingActionPayload,
    MeetingDocument,
    MeetingMinute,
    MeetingNotification,
    ParticipationStatus,
    ShortcutItem,
    UserInfo,
} from "@/pages/MeetingRoomm/types";

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data)) as T;

export const getMeetingUser = (): Promise<UserInfo> =>
    Promise.resolve(clone(userInfoData));

export const getMeetings = (): Promise<Meeting[]> =>
    Promise.resolve(clone(meetingData));

export const getMeetingById = (id: string): Promise<Meeting | undefined> =>
    Promise.resolve(clone(meetingData.find(meeting => meeting.id === id)));

export const getMeetingDocuments = (): Promise<MeetingDocument[]> =>
    Promise.resolve(clone(documentData));

export const getMeetingDocumentsByMeetingId = (
    meetingId: string,
): Promise<MeetingDocument[]> =>
    Promise.resolve(
        clone(documentData.filter(document => document.meetingId === meetingId)),
    );

export const getMeetingMinutes = (): Promise<MeetingMinute[]> =>
    Promise.resolve(clone(minutesData));

export const getMeetingAttendance = (): Promise<Attendance[]> =>
    Promise.resolve(clone(attendanceData));

export const getMeetingNotifications = (): Promise<MeetingNotification[]> =>
    Promise.resolve(clone(notificationData));

export const getMeetingShortcuts = (): Promise<ShortcutItem[]> =>
    Promise.resolve(clone(shortcutData));

export const submitMeetingParticipation = (
    meetingId: string,
    payload: MeetingActionPayload,
): Promise<ParticipationStatus> => {
    const nextStatus = payload.type;

    return Promise.resolve(
        meetingData.some(meeting => meeting.id === meetingId)
            ? nextStatus
            : "pending",
    );
};
