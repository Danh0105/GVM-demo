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
    getReceivedTasks,
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

const EmptyText = styled.div`
    padding: 20px;
    text-align: center;
    color: #98a2b3;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 650;
`;

const ReceivedTasksContent: React.FC = () => {
    const navigate = useNavigate();
    const setError = useStore(state => state.setError);
    const [activeTab, setActiveTab] = useState("received");
    const [filter, setFilter] = useState<FilterBarValue>({});
    const [tasks, setTasks] = useState<AssignedTaskListItem[]>([]);
    const [loading, setLoading] = useState(false);

    const handleError = (error: unknown) => {
        setError({ message: getFriendlyErrorMessage(error) });

        if (isForbiddenError(error)) {
            navigate("/", { replace: true });
        }
    };

    useEffect(() => {
        if (activeTab !== "received") {
            return;
        }

        setLoading(true);
        getReceivedTasks({ ...filter, page: 0, size: 50 })
            .then(result => setTasks(result.items))
            .catch(handleError)
            .finally(() => setLoading(false));
    }, [activeTab, filter]);

    return (
        <MeetingLayout
            title="Nhận việc"
            description="Theo dõi và phản hồi việc được giao"
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab} scrollable>
                <Tabs.Tab key="received" label="Nhận việc">
                    <FilterBar
                        value={filter}
                        onChange={setFilter}
                        statusOptions={STATUS_OPTIONS}
                    />

                    {!loading && tasks.length === 0 && (
                        <EmptyText>Bạn chưa được giao công việc nào.</EmptyText>
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

const ReceivedTasksPage: React.FC = () => (
    <RequireRole roles={[SYSTEM_ROLES.NEIGHBORHOOD_HEAD]}>
        <ReceivedTasksContent />
    </RequireRole>
);

export default ReceivedTasksPage;
