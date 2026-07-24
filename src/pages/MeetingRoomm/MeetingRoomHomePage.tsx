import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Bell, CalendarClock, FileText, UserRound } from "lucide-react";
import { useNavigate } from "zmp-ui";
import {
    getMeetingDocuments,
    getMeetingNotifications,
    getMeetingShortcuts,
    getMeetingUser,
    getMeetings,
} from "@/services/meetingRoom";
import {
    MeetingCard,
    MeetingLayout,
    SectionCard,
    ShortcutGrid,
    SmallMuted,
} from "@/components/MeetingRoom";
import {
    Meeting,
    MeetingDocument,
    MeetingNotification,
    ShortcutItem,
    UserInfo,
} from "./types";
import { formatDateTime } from "./utils";

const MeetingRoomHomePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserInfo>();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [documents, setDocuments] = useState<MeetingDocument[]>([]);
    const [notifications, setNotifications] = useState<MeetingNotification[]>(
        [],
    );
    const [shortcuts, setShortcuts] = useState<ShortcutItem[]>([]);

    useEffect(() => {
        Promise.all([
            getMeetingUser(),
            getMeetings(),
            getMeetingDocuments(),
            getMeetingNotifications(),
            getMeetingShortcuts(),
        ]).then(
            ([
                nextUser,
                nextMeetings,
                nextDocuments,
                nextNotifications,
                nextShortcuts,
            ]) => {
                setUser(nextUser);
                setMeetings(nextMeetings);
                setDocuments(nextDocuments);
                setNotifications(nextNotifications);
                setShortcuts(nextShortcuts);
            },
        );
    }, []);

    const nearestMeeting = useMemo(
        () =>
            meetings
                .filter(meeting => meeting.status !== "completed")
                .sort(
                    (a, b) =>
                        new Date(a.startAt).getTime() -
                        new Date(b.startAt).getTime(),
                )[0],
        [meetings],
    );

    const upcomingMeetings = useMemo(
        () => meetings.filter(meeting => meeting.status === "upcoming"),
        [meetings],
    );

    return (
        <MeetingLayout
            title="Cuộc họp"
            description="Quản lý lịch họp, tài liệu và thông báo nội bộ"
        >
            {user && (
                <UserCard>
                    <Avatar>
                        <UserRound size={26} />
                    </Avatar>
                    <UserInfoBox>
                        <UserName>{user.fullName}</UserName>
                        <SmallMuted>{user.position}</SmallMuted>
                        <SmallMuted>{user.department}</SmallMuted>
                    </UserInfoBox>
                </UserCard>
            )}

            <SectionCard title="Lối tắt">
                <ShortcutGrid shortcuts={shortcuts} />
            </SectionCard>

            {nearestMeeting && (
                <SectionCard title="Cuộc họp gần nhất">
                    <MeetingCard
                        meeting={nearestMeeting}
                        onClick={() =>
                            navigate(`/meeting-rooms/${nearestMeeting.id}`)
                        }
                    />
                </SectionCard>
            )}

            <SectionCard
                title="Sắp diễn ra"
                actionLabel="Xem lịch"
                onAction={() => navigate("/meeting-rooms/schedule")}
            >
                <Stack>
                    {upcomingMeetings.slice(0, 2).map(meeting => (
                        <MiniInfo
                            key={meeting.id}
                            type="button"
                            onClick={() =>
                                navigate(`/meeting-rooms/${meeting.id}`)
                            }
                        >
                            <CalendarClock size={20} />
                            <span>
                                <strong>{meeting.title}</strong>
                                {formatDateTime(meeting.startAt)}
                            </span>
                        </MiniInfo>
                    ))}
                </Stack>
            </SectionCard>

            <TwoColumn>
                <CompactCard
                    type="button"
                    onClick={() => navigate("/meeting-rooms/notifications")}
                >
                    <Bell size={22} />
                    <strong>{notifications.filter(item => !item.isRead).length}</strong>
                    <span>Thông báo mới</span>
                </CompactCard>
                <CompactCard
                    type="button"
                    onClick={() => navigate("/meeting-rooms/documents")}
                >
                    <FileText size={22} />
                    <strong>{documents.length}</strong>
                    <span>Tài liệu mới</span>
                </CompactCard>
            </TwoColumn>
        </MeetingLayout>
    );
};

export default MeetingRoomHomePage;

const UserCard = styled.section`
    border-radius: 24px;
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
    color: #ffffff;
    background: linear-gradient(135deg, #00325f 0%, #0067ad 100%);
    box-shadow: 0 18px 36px rgba(0, 75, 134, 0.2);
`;

const Avatar = styled.div`
    width: 58px;
    height: 58px;
    border-radius: 20px;
    display: grid;
    place-items: center;
    color: #005f99;
    background: rgba(255, 255, 255, 0.92);
`;

const UserInfoBox = styled.div`
    min-width: 0;
`;

const UserName = styled.h2`
    margin: 0 0 6px;
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const Stack = styled.div`
    display: grid;
    gap: 10px;
`;

const MiniInfo = styled.button`
    border: 0;
    border-radius: 17px;
    padding: 12px;
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 10px;
    text-align: left;
    color: #005f99;
    background: #f2f9ff;

    span {
        display: grid;
        gap: 4px;
        color: #667085;
        font-size: calc(12px * var(--app-font-scale));
        font-weight: 700;
    }

    strong {
        color: #172033;
        font-size: calc(14px * var(--app-font-scale));
        line-height: 1.3;
    }
`;

const TwoColumn = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
`;

const CompactCard = styled.button`
    min-height: 118px;
    border: 0;
    border-radius: 22px;
    padding: 16px;
    display: grid;
    align-content: center;
    justify-items: start;
    gap: 8px;
    text-align: left;
    color: #0067a8;
    background: #ffffff;
    box-shadow: 0 14px 28px rgba(30, 35, 50, 0.09);

    strong {
        color: #172033;
        font-size: calc(27px * var(--app-font-scale));
        line-height: 1;
        font-weight: 950;
    }

    span {
        color: #667085;
        font-size: calc(13px * var(--app-font-scale));
        font-weight: 750;
    }
`;
