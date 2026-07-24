import { StateCreator } from "zustand";
import { TaskNotification } from "@/services/taskNotifications";

export interface TaskNotificationSlice {
    unreadTaskNotifications: number;
    taskNotificationToast?: TaskNotification;
    setUnreadTaskNotifications: (count: number) => void;
    incrementUnreadTaskNotifications: () => void;
    showTaskNotificationToast: (notification: TaskNotification) => void;
    clearTaskNotificationToast: () => void;
}

const taskNotificationSlice: StateCreator<
    TaskNotificationSlice,
    [],
    [],
    TaskNotificationSlice
> = set => ({
    unreadTaskNotifications: 0,
    taskNotificationToast: undefined,
    setUnreadTaskNotifications: (count: number) => {
        set(state => ({ ...state, unreadTaskNotifications: count }));
    },
    incrementUnreadTaskNotifications: () => {
        set(state => ({
            ...state,
            unreadTaskNotifications: state.unreadTaskNotifications + 1,
        }));
    },
    showTaskNotificationToast: (notification: TaskNotification) => {
        set(state => ({ ...state, taskNotificationToast: notification }));
    },
    clearTaskNotificationToast: () => {
        set(state => ({ ...state, taskNotificationToast: undefined }));
    },
});

export default taskNotificationSlice;
