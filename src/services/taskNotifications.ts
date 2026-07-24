import {
    asRecord,
    firstBoolean,
    firstString,
    Page,
    unwrapPage,
} from "./jsonUtils";
import { request } from "./request";

export type TaskNotification = {
    id: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    taskId?: string;
};

export type TaskNotificationQuery = {
    page?: number;
    size?: number;
};

const mapTaskNotification = (value: unknown): TaskNotification => {
    const notification = asRecord(value);

    return {
        id: firstString(notification, "id", "notificationId"),
        title:
            firstString(notification, "title", "subject") ||
            "Thông báo công việc",
        content: firstString(notification, "content", "message", "summary"),
        isRead: firstBoolean(notification, "isRead", "read"),
        createdAt: firstString(notification, "createdAt"),
        taskId:
            firstString(notification, "taskId", "wardTaskId") || undefined,
    };
};

export const getTaskNotifications = async (
    query: TaskNotificationQuery = {},
): Promise<Page<TaskNotification>> => {
    const response = await request<unknown>(
        "GET",
        "/task-notifications",
        query,
        { useAuth: true },
    );

    return unwrapPage(response, mapTaskNotification, "notifications");
};

export const markTaskNotificationRead = (id: string) =>
    request<unknown>(
        "PATCH",
        `/task-notifications/${encodeURIComponent(id)}/read`,
        undefined,
        { useAuth: true },
    );
