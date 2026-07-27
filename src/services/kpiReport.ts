import { asRecord, firstNumber, firstString, unwrap } from "./jsonUtils";
import { request } from "./request";

export type KpiReportItem = {
    assigneeId: string;
    assigneeName: string;
    initialPoints: number;
    totalTasks: number;
    completed: number;
    incomplete: number;
    rejected: number;
    pending: number;
    submitted: number;
    earned: number;
    deducted: number;
    score: number;
};

export type KpiReportQuery = {
    month?: number;
    year?: number;
    assigneeId?: string;
};

const mapKpiReportItem = (value: unknown): KpiReportItem => {
    const item = asRecord(value);

    return {
        assigneeId: firstString(item, "assigneeId", "id"),
        assigneeName: firstString(item, "assigneeName", "fullName", "name"),
        initialPoints: firstNumber(item, "initialPoints"),
        totalTasks: firstNumber(item, "totalTasks"),
        completed: firstNumber(item, "completed"),
        incomplete: firstNumber(item, "incomplete"),
        rejected: firstNumber(item, "rejected"),
        pending: firstNumber(item, "pending"),
        submitted: firstNumber(item, "submitted"),
        earned: firstNumber(item, "earned"),
        deducted: firstNumber(item, "deducted"),
        score: firstNumber(item, "score"),
    };
};

export const getKpiReport = async (
    query: KpiReportQuery = {},
): Promise<KpiReportItem[]> => {
    const response = await request<unknown>("GET", "/kpi-report", query, {
        useAuth: true,
    });
    const data = unwrap(response);

    if (Array.isArray(data)) {
        return data.map(mapKpiReportItem);
    }

    const record = asRecord(data);
    const list = ["items", "reports", "data"]
        .map(key => record[key])
        .find(Array.isArray) as unknown[] | undefined;

    if (list) {
        return list.map(mapKpiReportItem);
    }

    if (Object.keys(record).length === 0) {
        return [];
    }

    return [mapKpiReportItem(record)];
};
