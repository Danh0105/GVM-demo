import React, { FC } from "react";
import styled from "styled-components";
import { TaskStatus } from "@/services/taskAssignments";

const STATUS_META: Record<TaskStatus, { label: string; color: string; bg: string }> = {
    ASSIGNED: { label: "Mới giao", color: "#0063a7", bg: "#e6f7ff" },
    SUBMITTED: { label: "Chờ đánh giá", color: "#b76e00", bg: "#fff7e6" },
    COMPLETED: { label: "Hoàn thành", color: "#12805c", bg: "#e6f9f1" },
    INCOMPLETE: { label: "Chưa hoàn thành", color: "#b42318", bg: "#fef2f1" },
    REJECTED: { label: "Từ chối", color: "#98a2b3", bg: "#f2f4f7" },
};

const Badge = styled.span<{ $color: string; $bg: string }>`
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;
    white-space: nowrap;
    color: ${({ $color }) => $color};
    background: ${({ $bg }) => $bg};
`;

const StatusBadge: FC<{ status: TaskStatus }> = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META.ASSIGNED;

    return <Badge $color={meta.color} $bg={meta.bg}>{meta.label}</Badge>;
};

export default StatusBadge;
