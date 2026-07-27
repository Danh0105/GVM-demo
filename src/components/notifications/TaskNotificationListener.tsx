import { useEffect } from "react";
import { useStore } from "@store";
import { useSnackbar } from "zmp-ui";
import { canAssignTasks, canReceiveTasks } from "@/utils/permissions";
import {
    getTaskNotifications,
    TaskNotification,
} from "@/services/taskNotifications";
import {
    connectTaskAssignmentSocket,
    disconnectTaskAssignmentSocket,
} from "@/services/taskAssignmentSocket";

const TaskNotificationListener = () => {
    const [token, user, setUnreadTaskNotifications, incrementUnreadTaskNotifications] =
        useStore(state => [
            state.token,
            state.user,
            state.setUnreadTaskNotifications,
            state.incrementUnreadTaskNotifications,
        ]);
    const { openSnackbar } = useSnackbar();
    const isRelevantRole = canAssignTasks(user) || canReceiveTasks(user);

    useEffect(() => {
        if (!token || !isRelevantRole) {
            disconnectTaskAssignmentSocket();
            return undefined;
        }

        getTaskNotifications({ page: 0, size: 50 })
            .then(page => {
                setUnreadTaskNotifications(
                    page.items.filter(item => !item.isRead).length,
                );
            })
            .catch(() => undefined);

        const socket = connectTaskAssignmentSocket(token);

        const handleNotificationCreated = (payload: unknown) => {
            const notification = payload as TaskNotification;

            incrementUnreadTaskNotifications();
            openSnackbar({
                type: "success",
                text: notification?.title || "Bạn có thông báo công việc mới",
                verticalAction: true,
                action: { text: "Đóng", close: true },
            });
        };

        socket.on("notification-created", handleNotificationCreated);

        return () => {
            socket.off("notification-created", handleNotificationCreated);
        };
    }, [token, isRelevantRole]);

    return null;
};

export default TaskNotificationListener;
