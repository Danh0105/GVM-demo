import {
    asArray,
    asRecord,
    firstNumber,
    firstString,
    nestedString,
    Page,
    unwrapPage,
    unwrap,
} from "./jsonUtils";
import { appendFilesToFormData, postMultipartForm } from "./multipart";
import { request } from "./request";

export type TaskStatus =
    | "ASSIGNED"
    | "SUBMITTED"
    | "COMPLETED"
    | "INCOMPLETE"
    | "REJECTED";

export type TaskFile = {
    id: string;
    name: string;
    url: string;
};

export type KpiBoard = {
    id: string;
    title: string;
    month: number;
    year: number;
    note: string;
    createdAt: string;
};

export type NeighborhoodHeadOption = {
    id: string;
    fullName: string;
    avatar?: string;
};

export type TaskAssignmentOptions = {
    neighborhoodHeads: NeighborhoodHeadOption[];
};

export type AssignedTaskListItem = {
    id: string;
    title: string;
    points: number;
    deadline: string;
    status: TaskStatus;
    assigneeId: string;
    assigneeName: string;
    boardId?: string;
    boardTitle?: string;
    createdAt: string;
};

export type WardTaskDetail = {
    id: string;
    title: string;
    content: string;
    points: number;
    deadline: string;
    status: TaskStatus;
    assigneeId: string;
    assigneeName: string;
    boardId?: string;
    boardTitle?: string;
    note: string;
    files: TaskFile[];
    completionFiles: TaskFile[];
    createdAt: string;
};

export type ListQuery = {
    status?: string;
    assigneeId?: string;
    boardId?: string;
    month?: number;
    year?: number;
    keyword?: string;
    page?: number;
    size?: number;
};

const mapFile = (value: unknown): TaskFile => {
    const file = asRecord(value);

    return {
        id: firstString(file, "id", "fileId") || firstString(file, "url"),
        name:
            firstString(file, "fileName", "originalName", "name") ||
            "Tệp đính kèm",
        url: firstString(file, "url", "fileUrl", "path"),
    };
};

const mapKpiBoard = (value: unknown): KpiBoard => {
    const board = asRecord(value);

    return {
        id: firstString(board, "id", "boardId"),
        title: firstString(board, "title", "name") || "Bảng KPI",
        month: firstNumber(board, "month"),
        year: firstNumber(board, "year"),
        note: firstString(board, "note", "description"),
        createdAt: firstString(board, "createdAt"),
    };
};

const mapNeighborhoodHead = (value: unknown): NeighborhoodHeadOption => {
    const head = asRecord(value);

    return {
        id: firstString(head, "id", "userId"),
        fullName: firstString(head, "fullName", "name") || "Trưởng khu phố",
        avatar: firstString(head, "avatar", "avatarUrl") || undefined,
    };
};

const mapAssignedTask = (value: unknown): AssignedTaskListItem => {
    const task = asRecord(value);

    return {
        id: firstString(task, "id", "taskId"),
        title: firstString(task, "title") || "Công việc",
        points: firstNumber(task, "points"),
        deadline: firstString(task, "deadline"),
        status: (firstString(task, "status") || "ASSIGNED") as TaskStatus,
        assigneeId:
            firstString(task, "assigneeId") || nestedString(task, "assignee", "id"),
        assigneeName:
            firstString(task, "assigneeName") ||
            nestedString(task, "assignee", "fullName", "name"),
        boardId:
            firstString(task, "boardId") ||
            nestedString(task, "board", "id") ||
            undefined,
        boardTitle:
            firstString(task, "boardTitle") ||
            nestedString(task, "board", "title") ||
            undefined,
        createdAt: firstString(task, "createdAt"),
    };
};

const mapWardTaskDetail = (value: unknown): WardTaskDetail => {
    const task = asRecord(value);

    return {
        id: firstString(task, "id", "taskId"),
        title: firstString(task, "title") || "Công việc",
        content: firstString(task, "content", "description"),
        points: firstNumber(task, "points"),
        deadline: firstString(task, "deadline"),
        status: (firstString(task, "status") || "ASSIGNED") as TaskStatus,
        assigneeId:
            firstString(task, "assigneeId") || nestedString(task, "assignee", "id"),
        assigneeName:
            firstString(task, "assigneeName") ||
            nestedString(task, "assignee", "fullName", "name"),
        boardId:
            firstString(task, "boardId") ||
            nestedString(task, "board", "id") ||
            undefined,
        boardTitle:
            firstString(task, "boardTitle") ||
            nestedString(task, "board", "title") ||
            undefined,
        note: firstString(task, "note", "evaluationNote"),
        files: asArray(task.files || task.attachments).map(mapFile),
        completionFiles: asArray(
            task.completionFiles || task.submissionFiles,
        ).map(mapFile),
        createdAt: firstString(task, "createdAt"),
    };
};

export const getKpiBoards = async (
    query: ListQuery = {},
): Promise<Page<KpiBoard>> => {
    const response = await request<unknown>("GET", "/kpi-boards", query, {
        useAuth: true,
    });

    return unwrapPage(response, mapKpiBoard, "boards");
};

export const createKpiBoard = async (payload: {
    title: string;
    month: number;
    year: number;
    note?: string;
}): Promise<KpiBoard> => {
    const response = await request<unknown>("POST", "/kpi-boards", payload, {
        useAuth: true,
    });

    return mapKpiBoard(unwrap(response));
};

export const getKpiBoardById = async (id: string): Promise<KpiBoard> => {
    const response = await request<unknown>(
        "GET",
        `/kpi-boards/${encodeURIComponent(id)}`,
        undefined,
        { useAuth: true },
    );

    return mapKpiBoard(unwrap(response));
};

export const getTaskAssignmentOptions =
    async (): Promise<TaskAssignmentOptions> => {
        const response = await request<unknown>(
            "GET",
            "/task-assignment-options",
            undefined,
            { useAuth: true },
        );
        const data = asRecord(unwrap(response));

        return {
            neighborhoodHeads: asArray(data.neighborhoodHeads).map(
                mapNeighborhoodHead,
            ),
        };
    };

export const getAssignedTasks = async (
    query: ListQuery = {},
): Promise<Page<AssignedTaskListItem>> => {
    const response = await request<unknown>("GET", "/assigned-tasks", query, {
        useAuth: true,
    });

    return unwrapPage(response, mapAssignedTask, "tasks", "assignedTasks");
};

export const getReceivedTasks = async (
    query: ListQuery = {},
): Promise<Page<AssignedTaskListItem>> => {
    const response = await request<unknown>("GET", "/received-tasks", query, {
        useAuth: true,
    });

    return unwrapPage(response, mapAssignedTask, "tasks", "receivedTasks");
};

export type CreateAssignedTaskPayload = {
    title: string;
    content: string;
    points: number;
    deadline: string;
    assigneeId: string;
    boardId?: string;
    files?: File[] | FileList | null;
};

export const createAssignedTask = async (
    payload: CreateAssignedTaskPayload,
): Promise<WardTaskDetail> => {
    const formData = new FormData();

    formData.append("title", payload.title);
    formData.append("content", payload.content);
    formData.append("points", String(payload.points));
    formData.append("deadline", payload.deadline);
    formData.append("assigneeId", payload.assigneeId);

    if (payload.boardId) {
        formData.append("boardId", payload.boardId);
    }

    appendFilesToFormData(formData, payload.files, "files");

    const response = await postMultipartForm<unknown>(
        "/assigned-tasks",
        formData,
    );

    return mapWardTaskDetail(unwrap(response));
};

export const getWardTaskById = async (id: string): Promise<WardTaskDetail> => {
    const response = await request<unknown>(
        "GET",
        `/ward-tasks/${encodeURIComponent(id)}`,
        undefined,
        { useAuth: true },
    );

    return mapWardTaskDetail(unwrap(response));
};

export type EvaluateWardTaskPayload =
    | { status: "COMPLETED" }
    | { status: "INCOMPLETE"; note: string };

export const evaluateWardTask = async (
    id: string,
    payload: EvaluateWardTaskPayload,
): Promise<WardTaskDetail> => {
    const response = await request<unknown>(
        "PATCH",
        `/ward-tasks/${encodeURIComponent(id)}/evaluation`,
        payload,
        { useAuth: true },
    );

    return mapWardTaskDetail(unwrap(response));
};

export const completeWardTask = async (
    id: string,
    files?: File[] | FileList | null,
): Promise<WardTaskDetail> => {
    const formData = new FormData();

    appendFilesToFormData(formData, files, "files");

    const response = await postMultipartForm<unknown>(
        `/ward-tasks/${encodeURIComponent(id)}/complete`,
        formData,
    );

    return mapWardTaskDetail(unwrap(response));
};

export const rejectWardTask = async (
    id: string,
    reason: string,
): Promise<WardTaskDetail> => {
    const response = await request<unknown>(
        "POST",
        `/ward-tasks/${encodeURIComponent(id)}/reject`,
        { reason },
        { useAuth: true },
    );

    return mapWardTaskDetail(unwrap(response));
};
