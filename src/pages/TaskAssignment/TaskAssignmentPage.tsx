import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Tabs, useNavigate } from "zmp-ui";
import { useStore } from "@store";
import MeetingLayout from "@/components/MeetingRoom/Layout";
import RequireRole from "@/components/common/RequireRole";
import {
    FilterBar,
    FilterBarValue,
    TaskListItem,
    TaskNotificationsList,
} from "@/components/TaskAssignment";
import { SYSTEM_ROLES } from "@/utils/permissions";
import { getFriendlyErrorMessage, isForbiddenError } from "@/utils/apiError";
import {
    AssignedTaskListItem,
    getAssignedTasks,
} from "@/services/taskAssignments";

const STATUS_OPTIONS = [
    { value: "ASSIGNED", label: "Mới giao" },
    { value: "SUBMITTED", label: "Chờ đánh giá" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "INCOMPLETE", label: "Chưa hoàn thành" },
    { value: "REJECTED", label: "Từ chối" },
];

const List = styled.div`
    display: grid;
    gap: 10px;
`;

const CreateButton = styled.button`
    width: 100%;
    min-height: 46px;
    border: 0;
    border-radius: 14px;
    margin-bottom: 12px;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
`;

const EmptyText = styled.div`
    padding: 20px;
    text-align: center;
    color: #98a2b3;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 650;
`;

const TaskAssignmentContent: React.FC = () => {
    const navigate = useNavigate();
    const setError = useStore(state => state.setError);
    const [activeTab, setActiveTab] = useState("assigned");
    const [taskFilter, setTaskFilter] = useState<FilterBarValue>({});
    const [tasks, setTasks] = useState<AssignedTaskListItem[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);

    const handleError = (error: unknown) => {
        setError({ message: getFriendlyErrorMessage(error) });

        if (isForbiddenError(error)) {
            navigate("/", { replace: true });
        }
    };

    const loadAssignedTasks = () => {
        if (activeTab !== "assigned") {
            return;
        }

        setTasksLoading(true);
        getAssignedTasks({ ...taskFilter, page: 0, size: 50 })
            .then(result => setTasks(result.items))
            .catch(handleError)
            .finally(() => setTasksLoading(false));
    };

    useEffect(() => {
        loadAssignedTasks();
    }, [activeTab, taskFilter]);

    useEffect(() => {
        const handleRefresh = () => loadAssignedTasks();

        window.addEventListener("assigned-tasks:refresh", handleRefresh);

        return () =>
            window.removeEventListener("assigned-tasks:refresh", handleRefresh);
    }, [activeTab, taskFilter]);

    return (
        <MeetingLayout title="Giao việc" description="Theo dõi việc đã giao">
            <Tabs activeKey={activeTab} onChange={setActiveTab} scrollable>
                <Tabs.Tab key="assigned" label="Giao việc">
                    <CreateButton
                        type="button"
                        onClick={() => navigate("/task-assignments/create")}
                    >
                        + Giao việc mới
                    </CreateButton>

                    <FilterBar
                        value={taskFilter}
                        onChange={setTaskFilter}
                        statusOptions={STATUS_OPTIONS}
                    />

                    {!tasksLoading && tasks.length === 0 && (
                        <EmptyText>Chưa có công việc nào được giao.</EmptyText>
                    )}

                    <List>
                        {tasks.map(task => (
                            <TaskListItem
                                key={task.id}
                                task={task}
                                onClick={() => navigate(`/ward-tasks/${task.id}`)}
                            />
                        ))}
                    </List>
                </Tabs.Tab>

                <Tabs.Tab key="notifications" label="Thông báo">
                    <TaskNotificationsList />
                </Tabs.Tab>
            </Tabs>
        </MeetingLayout>
    );
};

const TaskAssignmentPage: React.FC = () => (
    <RequireRole roles={[SYSTEM_ROLES.WARD_CHAIRMAN]}>
        <TaskAssignmentContent />
    </RequireRole>
);

export default TaskAssignmentPage;
