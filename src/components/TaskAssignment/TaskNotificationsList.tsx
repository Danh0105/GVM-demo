import React, { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { useStore } from "@store";
import {
    getTaskNotifications,
    markTaskNotificationRead,
    TaskNotification,
} from "@/services/taskNotifications";
import { getFriendlyErrorMessage } from "@/utils/apiError";
import { formatDateTime } from "@utils/date-time";

const List = styled.div`
    display: grid;
    gap: 8px;
`;

const Item = styled.button<{ $unread?: boolean }>`
    width: 100%;
    border: 1px solid
        ${({ $unread }) => ($unread ? "rgba(0, 99, 167, 0.22)" : "#e4e7ec")};
    border-radius: 16px;
    padding: 12px 14px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    text-align: left;
    background: ${({ $unread }) => ($unread ? "#f2f9ff" : "#ffffff")};
`;

const Dot = styled.span<{ $unread?: boolean }>`
    margin-top: 6px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex: 0 0 auto;
    background: ${({ $unread }) => ($unread ? "#0063a7" : "transparent")};
`;

const Title = styled.div`
    color: #172033;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 800;
`;

const Content = styled.div`
    margin-top: 4px;
    color: #667085;
    font-size: calc(12.5px * var(--app-font-scale));
    font-weight: 600;
`;

const Time = styled.div`
    margin-top: 6px;
    color: #98a2b3;
    font-size: calc(11.5px * var(--app-font-scale));
    font-weight: 650;
`;

const EmptyText = styled.div`
    padding: 20px;
    text-align: center;
    color: #98a2b3;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 650;
`;

const LoadMoreButton = styled.button`
    margin-top: 10px;
    padding: 10px;
    width: 100%;
    border: 1px solid #d0d5dd;
    border-radius: 12px;
    color: #0063a7;
    background: #ffffff;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 750;
`;

const PAGE_SIZE = 20;

const TaskNotificationsList: FC = () => {
    const [setError, setUnreadTaskNotifications] = useStore(state => [
        state.setError,
        state.setUnreadTaskNotifications,
    ]);
    const [items, setItems] = useState<TaskNotification[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadPage = (nextPage: number) => {
        setLoading(true);

        getTaskNotifications({ page: nextPage, size: PAGE_SIZE })
            .then(result => {
                setItems(current =>
                    nextPage === 0 ? result.items : [...current, ...result.items],
                );
                setTotal(result.total);
                setPage(nextPage);
            })
            .catch(error => {
                setError({ message: getFriendlyErrorMessage(error) });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadPage(0);
    }, []);

    const handleItemClick = (notification: TaskNotification) => {
        if (notification.isRead) {
            return;
        }

        setItems(current =>
            current.map(item =>
                item.id === notification.id ? { ...item, isRead: true } : item,
            ),
        );
        setUnreadTaskNotifications(
            Math.max(0, items.filter(item => !item.isRead).length - 1),
        );

        markTaskNotificationRead(notification.id).catch(error => {
            setError({ message: getFriendlyErrorMessage(error) });
        });
    };

    if (!loading && items.length === 0) {
        return <EmptyText>Chưa có thông báo nào.</EmptyText>;
    }

    return (
        <List>
            {items.map(notification => (
                <Item
                    key={notification.id}
                    type="button"
                    $unread={!notification.isRead}
                    onClick={() => handleItemClick(notification)}
                >
                    <Dot $unread={!notification.isRead} />
                    <div>
                        <Title>{notification.title}</Title>
                        {notification.content && (
                            <Content>{notification.content}</Content>
                        )}
                        {notification.createdAt && (
                            <Time>{formatDateTime(notification.createdAt)}</Time>
                        )}
                    </div>
                </Item>
            ))}

            {items.length < total && (
                <LoadMoreButton
                    type="button"
                    disabled={loading}
                    onClick={() => loadPage(page + 1)}
                >
                    {loading ? "Đang tải..." : "Xem thêm"}
                </LoadMoreButton>
            )}
        </List>
    );
};

export default TaskNotificationsList;
