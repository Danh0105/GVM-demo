import React, { useEffect, useMemo, useState } from "react";
import { getMeetingNotifications } from "@/services/meetingRoom";
import {
    EmptyState,
    MeetingLayout,
    NotificationCard,
    SearchFilter,
} from "@/components/MeetingRoom";
import { MeetingNotification } from "./types";

type NotificationFilter = "all" | "unread" | "read";

const notificationFilters: Array<{
    label: string;
    value: NotificationFilter;
}> = [
    { label: "Tất cả", value: "all" },
    { label: "Chưa đọc", value: "unread" },
    { label: "Đã đọc", value: "read" },
];

const MeetingNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<MeetingNotification[]>(
        [],
    );
    const [filter, setFilter] = useState<NotificationFilter>("all");

    useEffect(() => {
        getMeetingNotifications().then(setNotifications);
    }, []);

    const filteredNotifications = useMemo(
        () =>
            notifications.filter(notification => {
                if (filter === "unread") {
                    return !notification.isRead;
                }

                if (filter === "read") {
                    return notification.isRead;
                }

                return true;
            }),
        [filter, notifications],
    );

    return (
        <MeetingLayout
            title="Thông báo"
            description="Cập nhật mới từ module phòng họp"
            backTo="/meeting-rooms"
        >
            <SearchFilter<NotificationFilter>
                search=""
                placeholder=""
                filters={notificationFilters}
                activeFilter={filter}
                onSearchChange={() => undefined}
                onFilterChange={setFilter}
            />
            {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                    />
                ))
            ) : (
                <EmptyState message="Không có thông báo phù hợp." />
            )}
        </MeetingLayout>
    );
};

export default MeetingNotificationsPage;
