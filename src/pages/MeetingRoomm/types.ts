import { LucideIcon } from "lucide-react";

export type MeetingStatus =
    | "upcoming"
    | "ongoing"
    | "completed"
    | "cancelled";

export type ParticipationStatus =
    | "pending"
    | "accepted"
    | "declined"
    | "delegated";

export type AttendanceStatus = "checked-in" | "absent" | "excused";

export type DocumentType = "PDF" | "DOCX" | "XLSX" | "PPTX";

export type UserInfo = {
    id?: string;
    fullName: string;
    position: string;
    department: string;
    phone: string;
    avatarUrl?: string;
};

export type MeetingParticipant = {
    id: string;
    name: string;
    position: string;
    department: string;
    attendanceStatus?: AttendanceStatus;
};

export type MeetingDocument = {
    id: string;
    title: string;
    fileType: DocumentType;
    updatedAt: string;
    uploadedBy: string;
    meetingId?: string;
    meetingTitle?: string;
    category: string;
    fileUrl: string;
    previewUrl?: string;
    downloadUrl?: string;
};

export type MeetingMinute = {
    id: string;
    title: string;
    meetingId: string;
    meetingTitle: string;
    createdAt: string;
    author: string;
    summary: string;
    pdfUrl: string;
};

export type Meeting = {
    id: string;
    title: string;
    startAt: string;
    endAt: string;
    location: string;
    host: string;
    status: MeetingStatus;
    participationStatus: ParticipationStatus;
    participants: MeetingParticipant[];
    documentIds: string[];
    minutesId?: string;
    agenda: string;
};

export type Attendance = {
    id: string;
    meetingId: string;
    meetingTitle: string;
    time: string;
    location: string;
    status: AttendanceStatus;
    note: string;
};

export type MeetingNotification = {
    id: string;
    title: string;
    summary: string;
    time: string;
    isRead: boolean;
    meetingId?: string;
};

export type ShortcutItem = {
    id: string;
    label: string;
    path: string;
    iconName:
        | "calendar"
        | "documents"
        | "minutes"
        | "attendance"
        | "notifications";
};

export type MeetingActionPayload =
    | { type: "accepted" }
    | { type: "declined"; reason: string }
    | {
          type: "delegated";
          delegate: {
              fullName: string;
              position: string;
              department: string;
              phone: string;
          };
      };

export type MeetingIconMap = Record<ShortcutItem["iconName"], LucideIcon>;
