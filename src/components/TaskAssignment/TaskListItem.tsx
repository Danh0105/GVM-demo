import React, { FC } from "react";
import styled from "styled-components";
import { AssignedTaskListItem } from "@/services/taskAssignments";
import { formatDateTime } from "@utils/date-time";
import StatusBadge from "./StatusBadge";

const Card = styled.button`
    width: 100%;
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 18px;
    padding: 14px;
    display: grid;
    gap: 8px;
    text-align: left;
    color: #172033;
    background: #ffffff;
    box-shadow: 0 10px 22px rgba(30, 35, 50, 0.06);
`;

const TopRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
`;

const Title = styled.div`
    min-width: 0;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;
    line-height: 1.35;
`;

const MetaRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    color: #667085;
    font-size: calc(12.5px * var(--app-font-scale));
    font-weight: 650;
`;

const Points = styled.span`
    color: #b76e00;
    font-weight: 850;
`;

type TaskListItemProps = {
    task: AssignedTaskListItem;
    onClick: () => void;
};

const TaskListItem: FC<TaskListItemProps> = ({ task, onClick }) => (
    <Card type="button" onClick={onClick}>
        <TopRow>
            <Title>{task.title}</Title>
            <StatusBadge status={task.status} />
        </TopRow>

        <MetaRow>
            {task.assigneeName && <span>Người nhận: {task.assigneeName}</span>}
            <Points>{task.points} điểm</Points>
            {task.deadline && <span>Hạn: {formatDateTime(task.deadline)}</span>}
            {task.boardTitle && <span>{task.boardTitle}</span>}
        </MetaRow>
    </Card>
);

export default TaskListItem;
