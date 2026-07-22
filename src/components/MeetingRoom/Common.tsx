import React, { ReactNode } from "react";
import styled from "styled-components";
import {
    Bell,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Download,
    Eye,
    FileText,
    MapPin,
    Search,
    UserCheck,
    Users,
} from "lucide-react";
import { useNavigate } from "zmp-ui";
import {
    AttendanceStatus,
    Meeting,
    MeetingDocument,
    MeetingIconMap,
    MeetingMinute,
    MeetingNotification,
    MeetingStatus,
    ShortcutItem,
} from "@/pages/MeetingRoomm/types";
import {
    formatDate,
    formatDateTime,
    getAttendanceText,
    getMeetingStatusText,
} from "@/pages/MeetingRoomm/utils";

type SectionCardProps = {
    title?: string;
    actionLabel?: string;
    onAction?: () => void;
    children: ReactNode;
};

export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    actionLabel,
    onAction,
    children,
}) => (
    <CardSection>
        {(title || actionLabel) && (
            <SectionHead>
                {title && <SectionTitle>{title}</SectionTitle>}
                {actionLabel && (
                    <TextButton type="button" onClick={onAction}>
                        {actionLabel}
                    </TextButton>
                )}
            </SectionHead>
        )}
        {children}
    </CardSection>
);

type SearchFilterProps<T extends string> = {
    search: string;
    placeholder: string;
    filters: Array<{ label: string; value: T }>;
    activeFilter: T;
    onSearchChange: (value: string) => void;
    onFilterChange: (value: T) => void;
};

export const SearchFilter = <T extends string>({
    search,
    placeholder,
    filters,
    activeFilter,
    onSearchChange,
    onFilterChange,
}: SearchFilterProps<T>): React.ReactElement => (
    <FilterPanel>
        {placeholder && (
            <SearchBox>
                <Search size={20} />
                <SearchInput
                    value={search}
                    placeholder={placeholder}
                    onChange={event => onSearchChange(event.target.value)}
                />
            </SearchBox>
        )}
        <ChipRow>
            {filters.map(filter => (
                <FilterChip
                    key={filter.value}
                    type="button"
                    $active={filter.value === activeFilter}
                    onClick={() => onFilterChange(filter.value)}
                >
                    {filter.label}
                </FilterChip>
            ))}
        </ChipRow>
    </FilterPanel>
);

type MeetingCardProps = {
    meeting: Meeting;
    onClick?: () => void;
};

export const MeetingCard: React.FC<MeetingCardProps> = ({
    meeting,
    onClick,
}) => (
    <ListButton type="button" onClick={onClick}>
        <CardTopLine>
            <StatusPill $status={meeting.status}>
                {getMeetingStatusText(meeting.status)}
            </StatusPill>
            <SmallMuted>{formatDate(meeting.startAt)}</SmallMuted>
        </CardTopLine>
        <ItemTitle>{meeting.title}</ItemTitle>
        <MetaGrid>
            <MetaLine>
                <Clock3 size={16} />
                {formatDateTime(meeting.startAt)}
            </MetaLine>
            <MetaLine>
                <MapPin size={16} />
                {meeting.location}
            </MetaLine>
            <MetaLine>
                <Users size={16} />
                {meeting.host}
            </MetaLine>
        </MetaGrid>
    </ListButton>
);

type ShortcutGridProps = {
    shortcuts: ShortcutItem[];
};

const shortcutIcons: MeetingIconMap = {
    calendar: CalendarDays,
    documents: FileText,
    minutes: CheckCircle2,
    attendance: UserCheck,
    notifications: Bell,
};

export const ShortcutGrid: React.FC<ShortcutGridProps> = ({ shortcuts }) => {
    const navigate = useNavigate();

    return (
        <ShortcutWrap>
            {shortcuts.map(shortcut => {
                const ShortcutIcon = shortcutIcons[shortcut.iconName];

                return (
                    <ShortcutButton
                        key={shortcut.id}
                        type="button"
                        onClick={() => navigate(shortcut.path)}
                    >
                        <ShortcutIconBox>
                            <ShortcutIcon size={24} />
                        </ShortcutIconBox>
                        <span>{shortcut.label}</span>
                    </ShortcutButton>
                );
            })}
        </ShortcutWrap>
    );
};

type DocumentCardProps = {
    document: MeetingDocument;
    onPreview?: () => void;
    onDownload?: () => void;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({
    document,
    onPreview,
    onDownload,
}) => (
    <ListArticle>
        <FileIcon>{document.fileType}</FileIcon>
        <ItemBody>
            <ItemTitle>{document.title}</ItemTitle>
            <SmallMuted>
                {document.category} · {formatDate(document.updatedAt)}
            </SmallMuted>
            <SmallMuted>{document.uploadedBy}</SmallMuted>
        </ItemBody>
        <ActionGroup>
            <IconAction
                type="button"
                aria-label="Xem tài liệu"
                onClick={onPreview}
                disabled={!onPreview}
            >
                <Eye size={18} />
            </IconAction>
            <IconAction
                type="button"
                aria-label="Tải xuống"
                onClick={onDownload}
                disabled={!onDownload}
            >
                <Download size={18} />
            </IconAction>
        </ActionGroup>
    </ListArticle>
);

type MinuteCardProps = {
    minute: MeetingMinute;
};

export const MinuteCard: React.FC<MinuteCardProps> = ({ minute }) => (
    <ListArticle>
        <RoundIcon>
            <FileText size={22} />
        </RoundIcon>
        <ItemBody>
            <ItemTitle>{minute.title}</ItemTitle>
            <SmallMuted>{minute.meetingTitle}</SmallMuted>
            <Description>{minute.summary}</Description>
            <SmallMuted>
                {minute.author} · {formatDateTime(minute.createdAt)}
            </SmallMuted>
        </ItemBody>
        <ActionGroup>
            <IconAction type="button" aria-label="Xem biên bản">
                <Eye size={18} />
            </IconAction>
            <IconAction type="button" aria-label="Xem PDF">
                <FileText size={18} />
            </IconAction>
        </ActionGroup>
    </ListArticle>
);

type AttendanceCardProps = {
    attendance: {
        meetingTitle: string;
        time: string;
        location: string;
        status: AttendanceStatus;
        note: string;
    };
    onClick?: () => void;
};

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
    attendance,
    onClick,
}) => (
    <ListButton type="button" onClick={onClick}>
        <CardTopLine>
            <AttendancePill $status={attendance.status}>
                {getAttendanceText(attendance.status)}
            </AttendancePill>
            <SmallMuted>{formatDate(attendance.time)}</SmallMuted>
        </CardTopLine>
        <ItemTitle>{attendance.meetingTitle}</ItemTitle>
        <MetaLine>
            <Clock3 size={16} />
            {formatDateTime(attendance.time)}
        </MetaLine>
        <MetaLine>
            <MapPin size={16} />
            {attendance.location}
        </MetaLine>
        <Description>{attendance.note}</Description>
    </ListButton>
);

type NotificationCardProps = {
    notification: MeetingNotification;
};

export const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
}) => (
    <ListArticle>
        <RoundIcon $unread={!notification.isRead}>
            <Bell size={21} />
        </RoundIcon>
        <ItemBody>
            <CardTopLine>
                <ItemTitle>{notification.title}</ItemTitle>
                {!notification.isRead && <UnreadDot />}
            </CardTopLine>
            <Description>{notification.summary}</Description>
            <SmallMuted>{formatDateTime(notification.time)}</SmallMuted>
        </ItemBody>
    </ListArticle>
);

export const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <EmptyBox>{message}</EmptyBox>
);

export const CardSection = styled.section`
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 22px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.09);
`;

export const SectionHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
`;

export const SectionTitle = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 930;
`;

export const TextButton = styled.button`
    border: 0;
    background: transparent;
    color: #0067a8;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 850;
    white-space: nowrap;
`;

export const FilterPanel = styled.div`
    display: grid;
    gap: 10px;
`;

export const SearchBox = styled.label`
    height: 52px;
    border: 1px solid rgba(0, 95, 168, 0.09);
    border-radius: 18px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #7b8794;
    background: #ffffff;
    box-shadow: 0 10px 22px rgba(30, 35, 50, 0.06);
`;

export const SearchInput = styled.input`
    width: 100%;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: #172033;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 650;

    &::placeholder {
        color: #98a2b3;
    }
`;

export const ChipRow = styled.div`
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const FilterChip = styled.button<{ $active?: boolean }>`
    min-height: 36px;
    border: 1px solid
        ${({ $active }) =>
            $active ? "rgba(0, 103, 168, 0.28)" : "rgba(30, 35, 50, 0.08)"};
    border-radius: 999px;
    padding: 0 13px;
    color: ${({ $active }) => ($active ? "#005f99" : "#5d6877")};
    background: ${({ $active }) => ($active ? "#e7f5ff" : "#ffffff")};
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 850;
    white-space: nowrap;
`;

export const ListButton = styled.button`
    width: 100%;
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 20px;
    padding: 15px;
    display: grid;
    gap: 10px;
    text-align: left;
    color: inherit;
    background: #ffffff;
    box-shadow: 0 12px 24px rgba(30, 35, 50, 0.08);
    transition: transform 160ms ease, box-shadow 160ms ease;

    &:active {
        transform: scale(0.985);
        box-shadow: 0 8px 18px rgba(30, 35, 50, 0.08);
    }
`;

export const ListArticle = styled.article`
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 20px;
    padding: 14px;
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    background: #ffffff;
    box-shadow: 0 12px 24px rgba(30, 35, 50, 0.08);
`;

export const ItemBody = styled.div`
    min-width: 0;
`;

export const CardTopLine = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
`;

export const ItemTitle = styled.h3`
    margin: 0;
    color: #172033;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 900;
`;

export const SmallMuted = styled.p`
    margin: 0;
    color: #6f7a88;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 650;
`;

export const Description = styled.p`
    margin: 7px 0;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.42;
    font-weight: 600;
`;

export const MetaGrid = styled.div`
    display: grid;
    gap: 7px;
`;

export const MetaLine = styled.div`
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    color: #647084;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 650;

    svg {
        flex: 0 0 auto;
        color: #0070b5;
    }
`;

const statusColors: Record<MeetingStatus, string> = {
    upcoming: "#e7f5ff",
    ongoing: "#ecfdf3",
    completed: "#f2f4f7",
    cancelled: "#fff1f3",
};

export const StatusPill = styled.span<{ $status: MeetingStatus }>`
    border-radius: 999px;
    padding: 5px 10px;
    color: #005f99;
    background: ${({ $status }) => statusColors[$status]};
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1;
    font-weight: 850;
    white-space: nowrap;
`;

export const AttendancePill = styled.span<{ $status: AttendanceStatus }>`
    border-radius: 999px;
    padding: 5px 10px;
    color: ${({ $status }) => ($status === "absent" ? "#b42318" : "#005f99")};
    background: ${({ $status }) =>
        $status === "absent" ? "#fff1f3" : "#e7f5ff"};
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1;
    font-weight: 850;
    white-space: nowrap;
`;

const ShortcutWrap = styled.div`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
`;

const ShortcutButton = styled.button`
    min-width: 0;
    border: 0;
    border-radius: 16px;
    padding: 10px 4px 9px;
    display: grid;
    justify-items: center;
    gap: 8px;
    color: #26364d;
    background: #f8fbff;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 850;

    &:active {
        transform: scale(0.96);
        background: #edf7ff;
    }
`;

const ShortcutIconBox = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    color: #0067a8;
    background: linear-gradient(145deg, #ffffff, #e5f4ff);
    box-shadow: 0 8px 16px rgba(0, 86, 153, 0.1);
`;

const FileIcon = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: #0067a8;
    background: #e7f5ff;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 950;
`;

const RoundIcon = styled.div<{ $unread?: boolean }>`
    width: 50px;
    height: 50px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: ${({ $unread }) => ($unread ? "#ffffff" : "#0067a8")};
    background: ${({ $unread }) =>
        $unread ? "linear-gradient(135deg, #005f99, #008bd2)" : "#e7f5ff"};
`;

const ActionGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const IconAction = styled.button`
    width: 34px;
    height: 34px;
    border: 0;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #0067a8;
    background: #eef8ff;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.42;
    }
`;

const UnreadDot = styled.span`
    width: 9px;
    height: 9px;
    flex: 0 0 auto;
    border-radius: 999px;
    background: #f04438;
`;

const EmptyBox = styled.div`
    border: 1px dashed rgba(0, 95, 168, 0.18);
    border-radius: 18px;
    padding: 20px;
    text-align: center;
    color: #667085;
    background: rgba(255, 255, 255, 0.72);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 700;
`;
