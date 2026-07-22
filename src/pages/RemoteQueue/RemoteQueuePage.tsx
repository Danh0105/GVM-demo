import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Page, useNavigate } from "zmp-ui";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    History,
    Landmark,
    MapPin,
    RefreshCw,
    ShieldCheck,
    Ticket,
    Users,
    X,
} from "lucide-react";

type MainTab = "take" | "tracking" | "history";
type TicketStatus = "active" | "completed" | "cancelled";
type HistoryFilter = "all" | "completed" | "cancelled";

type QueueDesk = {
    id: string;
    name: string;
    code: string;
    category: string;
    services: string;
    waiting: number;
};

type QueueTicket = {
    id: string;
    number: string;
    queueId: string;
    queueName: string;
    category: string;
    createdAt: string;
    peopleAhead: number;
    status: TicketStatus;
};

const ACTIVE_TICKET_KEY = "gvm.remote-queue.active-ticket";
const TICKET_HISTORY_KEY = "gvm.remote-queue.history";

const queueDesks: QueueDesk[] = [
    {
        id: "tn1",
        name: "Quầy TN1",
        code: "TN01",
        category: "Tư pháp - Hộ tịch",
        services:
            "Chứng thực, đăng ký khai sinh, khai tử, thay đổi và cải chính hộ tịch",
        waiting: 2,
    },
    {
        id: "tn2",
        name: "Quầy TN2",
        code: "TN02",
        category: "Đất đai - Xây dựng",
        services:
            "Đất đai, cấp giấy chứng nhận, quy hoạch, xây dựng và môi trường",
        waiting: 4,
    },
    {
        id: "tn31",
        name: "Quầy TN3.1",
        code: "TN03",
        category: "Lao động - Xã hội",
        services:
            "Bảo trợ xã hội, người có công, việc làm và chính sách an sinh",
        waiting: 1,
    },
];

const readStoredValue = <T,>(key: string, fallback: T): T => {
    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? (JSON.parse(rawValue) as T) : fallback;
    } catch {
        return fallback;
    }
};

const formatTime = (date: string) =>
    new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(date));

const formatDate = (date: string) =>
    new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date));

const getStatusLabel = (status: TicketStatus) => {
    if (status === "completed") {
        return "Hoàn thành";
    }

    if (status === "cancelled") {
        return "Đã hủy";
    }

    return "Đang chờ";
};

const getStatusColor = (status: TicketStatus) => {
    if (status === "completed") {
        return "#087354";
    }

    if (status === "cancelled") {
        return "#a44842";
    }

    return "#075d94";
};

const getStatusBackground = (status: TicketStatus) => {
    if (status === "completed") {
        return "#e4f9f0";
    }

    if (status === "cancelled") {
        return "#fff0ee";
    }

    return "#e9f5ff";
};

const RemoteQueuePage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<MainTab>("take");
    const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
    const [pendingQueue, setPendingQueue] = useState<QueueDesk | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(() =>
        readStoredValue<QueueTicket | null>(ACTIVE_TICKET_KEY, null),
    );
    const [ticketHistory, setTicketHistory] = useState<QueueTicket[]>(() =>
        readStoredValue<QueueTicket[]>(TICKET_HISTORY_KEY, []),
    );

    useEffect(() => {
        if (activeTicket) {
            window.localStorage.setItem(
                ACTIVE_TICKET_KEY,
                JSON.stringify(activeTicket),
            );
        } else {
            window.localStorage.removeItem(ACTIVE_TICKET_KEY);
        }
    }, [activeTicket]);

    useEffect(() => {
        window.localStorage.setItem(
            TICKET_HISTORY_KEY,
            JSON.stringify(ticketHistory),
        );
    }, [ticketHistory]);

    const filteredHistory = useMemo(() => {
        if (historyFilter === "all") {
            return ticketHistory;
        }

        return ticketHistory.filter(ticket => ticket.status === historyFilter);
    }, [historyFilter, ticketHistory]);

    const completedCount = ticketHistory.filter(
        ticket => ticket.status === "completed",
    ).length;
    const cancelledCount = ticketHistory.filter(
        ticket => ticket.status === "cancelled",
    ).length;

    const takeNumber = () => {
        if (!pendingQueue || activeTicket) {
            setPendingQueue(null);
            setActiveTab("tracking");
            return;
        }

        const createdAt = new Date().toISOString();
        const sequence = 101 + (Date.now() % 89);
        const newTicket: QueueTicket = {
            id: `${pendingQueue.id}-${Date.now()}`,
            number: String(sequence),
            queueId: pendingQueue.id,
            queueName: pendingQueue.name,
            category: pendingQueue.category,
            createdAt,
            peopleAhead: pendingQueue.waiting,
            status: "active",
        };

        setActiveTicket(newTicket);
        setPendingQueue(null);
        setActiveTab("tracking");
    };

    const refreshTicket = () => {
        if (!activeTicket || isRefreshing) {
            return;
        }

        setIsRefreshing(true);
        window.setTimeout(() => {
            setActiveTicket(current =>
                current
                    ? {
                          ...current,
                          peopleAhead: Math.max(0, current.peopleAhead - 1),
                      }
                    : current,
            );
            setIsRefreshing(false);
        }, 550);
    };

    const closeActiveTicket = (status: "completed" | "cancelled") => {
        if (!activeTicket) {
            return;
        }

        setTicketHistory(current => [{ ...activeTicket, status }, ...current]);
        setActiveTicket(null);
        setShowCancelDialog(false);
        setActiveTab("history");
        setHistoryFilter(status);
    };

    const renderTakeNumber = () => (
        <ContentArea>
            {activeTicket && (
                <CurrentTicketBanner
                    type="button"
                    onClick={() => setActiveTab("tracking")}
                >
                    <CurrentTicketIcon>
                        <Ticket size={22} />
                    </CurrentTicketIcon>
                    <div>
                        <CurrentTicketLabel>Bạn đang giữ số</CurrentTicketLabel>
                        <CurrentTicketValue>
                            {activeTicket.number} · {activeTicket.queueName}
                        </CurrentTicketValue>
                    </div>
                    <CurrentTicketAction>
                        Theo dõi <ChevronRight size={17} />
                    </CurrentTicketAction>
                </CurrentTicketBanner>
            )}

            <LocationCard>
                <LocationIcon>
                    <MapPin size={21} strokeWidth={2.4} />
                </LocationIcon>
                <div>
                    <Eyebrow>Điểm phục vụ</Eyebrow>
                    <LocationTitle>Trung tâm HCC Xã Lộc Ninh</LocationTitle>
                    <LocationMeta>Tỉnh Tây Ninh</LocationMeta>
                </div>
                <VerifiedBadge aria-label="Điểm phục vụ đã xác thực">
                    <ShieldCheck size={18} />
                </VerifiedBadge>
            </LocationCard>

            <WorkingHours>
                <ClockIcon>
                    <Clock3 size={22} strokeWidth={2.3} />
                </ClockIcon>
                <div>
                    <WorkingTitle>Giờ làm việc hôm nay</WorkingTitle>
                    <WorkingTime>07:00–11:30 · 13:30–17:00</WorkingTime>
                </div>
                <OpenBadge>Đang mở cửa</OpenBadge>
            </WorkingHours>

            <SectionHeading>
                <div>
                    <SectionEyebrow>
                        Chọn lĩnh vực cần giải quyết
                    </SectionEyebrow>
                    <SectionTitle>Các quầy đang phục vụ</SectionTitle>
                </div>
                <CounterBadge>{queueDesks.length} quầy</CounterBadge>
            </SectionHeading>

            <QueueList>
                {queueDesks.map(queue => (
                    <QueueCard key={queue.id}>
                        <QueueCardTop>
                            <QueueSymbol>
                                <Ticket size={24} strokeWidth={2.2} />
                            </QueueSymbol>
                            <QueueIdentity>
                                <QueueName>{queue.name}</QueueName>
                                <QueueCode>{queue.code}</QueueCode>
                            </QueueIdentity>
                            <ActiveBadge>
                                <ActiveDot /> Hoạt động
                            </ActiveBadge>
                        </QueueCardTop>

                        <Category>{queue.category}</Category>
                        <ServiceDescription>
                            {queue.services}
                        </ServiceDescription>

                        <QueueCardBottom>
                            <WaitingInfo>
                                <Users size={19} />
                                <span>
                                    <strong>{queue.waiting}</strong> người đang
                                    chờ
                                </span>
                            </WaitingInfo>
                            <TakeButton
                                type="button"
                                onClick={() =>
                                    activeTicket
                                        ? setActiveTab("tracking")
                                        : setPendingQueue(queue)
                                }
                            >
                                {activeTicket ? "Xem lượt" : "Lấy số"}{" "}
                                <ChevronRight size={18} />
                            </TakeButton>
                        </QueueCardBottom>
                    </QueueCard>
                ))}
            </QueueList>
        </ContentArea>
    );

    const renderTracking = () => {
        if (!activeTicket) {
            return (
                <ContentArea>
                    <EmptyState>
                        <EmptyIcon>
                            <Ticket size={34} strokeWidth={1.9} />
                        </EmptyIcon>
                        <EmptyTitle>Bạn chưa có lượt đang chờ</EmptyTitle>
                        <EmptyDescription>
                            Chọn quầy phù hợp và lấy số để theo dõi tiến độ theo
                            thời gian thực.
                        </EmptyDescription>
                        <PrimaryAction
                            type="button"
                            onClick={() => setActiveTab("take")}
                        >
                            Lấy số ngay
                        </PrimaryAction>
                    </EmptyState>
                </ContentArea>
            );
        }

        const isCalled = activeTicket.peopleAhead === 0;
        const estimatedMinutes = activeTicket.peopleAhead * 7;

        return (
            <ContentArea>
                <LiveNotice $called={isCalled}>
                    <LivePulse $called={isCalled} />
                    <div>
                        <LiveTitle>
                            {isCalled
                                ? "Đã đến lượt phục vụ"
                                : "Lượt của bạn đang được theo dõi"}
                        </LiveTitle>
                        <LiveMeta>
                            Cập nhật gần nhất lúc{" "}
                            {formatTime(new Date().toISOString())}
                        </LiveMeta>
                    </div>
                    <RefreshButton
                        type="button"
                        aria-label="Cập nhật lượt đang chờ"
                        onClick={refreshTicket}
                        disabled={isRefreshing}
                    >
                        <RefreshCw
                            size={21}
                            className={isRefreshing ? "spinning" : ""}
                        />
                    </RefreshButton>
                </LiveNotice>

                <TicketCard $called={isCalled}>
                    <TicketHeader>
                        <div>
                            <TicketLabel>Số thứ tự của bạn</TicketLabel>
                            <TicketNumber>{activeTicket.number}</TicketNumber>
                        </div>
                        <QueuePill>{activeTicket.queueName}</QueuePill>
                    </TicketHeader>

                    <TicketCategory>{activeTicket.category}</TicketCategory>

                    <TicketMetrics>
                        <Metric>
                            <MetricIcon>
                                <Users size={20} />
                            </MetricIcon>
                            <MetricValue>
                                {activeTicket.peopleAhead}
                            </MetricValue>
                            <MetricLabel>người phía trước</MetricLabel>
                        </Metric>
                        <MetricDivider />
                        <Metric>
                            <MetricIcon>
                                <Clock3 size={20} />
                            </MetricIcon>
                            <MetricValue>
                                {isCalled ? "Ngay" : `~${estimatedMinutes}'`}
                            </MetricValue>
                            <MetricLabel>thời gian dự kiến</MetricLabel>
                        </Metric>
                    </TicketMetrics>

                    <ProgressTrack>
                        <ProgressValue
                            $progress={Math.max(
                                16,
                                Math.min(
                                    100,
                                    100 - activeTicket.peopleAhead * 16,
                                ),
                            )}
                        />
                    </ProgressTrack>
                    <ProgressText>
                        {isCalled
                            ? "Vui lòng di chuyển đến quầy để được phục vụ."
                            : "Bạn có thể rời ứng dụng, lượt chờ vẫn được lưu trên thiết bị."}
                    </ProgressText>
                </TicketCard>

                <TrackingActions>
                    {isCalled && (
                        <CompleteButton
                            type="button"
                            onClick={() => closeActiveTicket("completed")}
                        >
                            <CheckCircle2 size={19} /> Đã hoàn tất
                        </CompleteButton>
                    )}
                    <CancelButton
                        type="button"
                        onClick={() => setShowCancelDialog(true)}
                    >
                        Hủy lượt hiện tại
                    </CancelButton>
                </TrackingActions>

                <HelpfulNote>
                    <ShieldCheck size={20} />
                    <span>
                        Hãy có mặt trước lượt dự kiến 5–10 phút và chuẩn bị đầy
                        đủ hồ sơ cần thiết.
                    </span>
                </HelpfulNote>
            </ContentArea>
        );
    };

    const renderHistory = () => (
        <ContentArea>
            <HistoryFilters>
                <HistoryFilterButton
                    type="button"
                    $active={historyFilter === "all"}
                    onClick={() => setHistoryFilter("all")}
                >
                    Tất cả <span>{ticketHistory.length}</span>
                </HistoryFilterButton>
                <HistoryFilterButton
                    type="button"
                    $active={historyFilter === "completed"}
                    onClick={() => setHistoryFilter("completed")}
                >
                    Hoàn thành <span>{completedCount}</span>
                </HistoryFilterButton>
                <HistoryFilterButton
                    type="button"
                    $active={historyFilter === "cancelled"}
                    onClick={() => setHistoryFilter("cancelled")}
                >
                    Đã hủy <span>{cancelledCount}</span>
                </HistoryFilterButton>
            </HistoryFilters>

            {filteredHistory.length === 0 ? (
                <EmptyState>
                    <EmptyIcon>
                        <History size={35} strokeWidth={1.9} />
                    </EmptyIcon>
                    <EmptyTitle>Chưa có lịch sử lấy số</EmptyTitle>
                    <EmptyDescription>
                        Các lượt đã hoàn thành hoặc đã hủy tại Xã Lộc Ninh sẽ
                        được hiển thị tại đây.
                    </EmptyDescription>
                </EmptyState>
            ) : (
                <HistoryList>
                    {filteredHistory.map(ticket => (
                        <HistoryCard key={ticket.id}>
                            <HistoryNumber>{ticket.number}</HistoryNumber>
                            <HistoryDetails>
                                <HistoryQueue>{ticket.queueName}</HistoryQueue>
                                <HistoryCategory>
                                    {ticket.category}
                                </HistoryCategory>
                                <HistoryDate>
                                    <CalendarDays size={15} />
                                    {formatTime(ticket.createdAt)} ·{" "}
                                    {formatDate(ticket.createdAt)}
                                </HistoryDate>
                            </HistoryDetails>
                            <StatusBadge $status={ticket.status}>
                                {getStatusLabel(ticket.status)}
                            </StatusBadge>
                        </HistoryCard>
                    ))}
                </HistoryList>
            )}
        </ContentArea>
    );

    return (
        <StyledPage>
            <HeroHeader>
                <HeaderTop>
                    <BackButton
                        type="button"
                        aria-label="Quay lại trang chủ"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={23} strokeWidth={2.4} />
                    </BackButton>
                    <BrandMark>
                        <Landmark size={22} strokeWidth={2.2} />
                    </BrandMark>
                    <HeaderCopy>
                        <HeaderTitle>Lấy số từ xa</HeaderTitle>
                        <HeaderSubtitle>
                            Hành chính công · Xã Lộc Ninh
                        </HeaderSubtitle>
                    </HeaderCopy>
                </HeaderTop>

                <MainTabs role="tablist" aria-label="Chức năng lấy số từ xa">
                    <MainTabButton
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "take"}
                        $active={activeTab === "take"}
                        onClick={() => setActiveTab("take")}
                    >
                        <Ticket size={18} />
                        Bốc số
                    </MainTabButton>
                    <MainTabButton
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "tracking"}
                        $active={activeTab === "tracking"}
                        onClick={() => setActiveTab("tracking")}
                    >
                        <RefreshCw size={18} />
                        Theo dõi
                        {activeTicket && <TabDot />}
                    </MainTabButton>
                    <MainTabButton
                        type="button"
                        role="tab"
                        aria-selected={activeTab === "history"}
                        $active={activeTab === "history"}
                        onClick={() => setActiveTab("history")}
                    >
                        <History size={18} />
                        Lịch sử
                    </MainTabButton>
                </MainTabs>
            </HeroHeader>

            {activeTab === "take" && renderTakeNumber()}
            {activeTab === "tracking" && renderTracking()}
            {activeTab === "history" && renderHistory()}

            {pendingQueue && (
                <DialogBackdrop
                    role="presentation"
                    onClick={() => setPendingQueue(null)}
                >
                    <DialogCard
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="take-number-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <DialogClose
                            type="button"
                            aria-label="Đóng"
                            onClick={() => setPendingQueue(null)}
                        >
                            <X size={21} />
                        </DialogClose>
                        <DialogIcon>
                            <Ticket size={29} />
                        </DialogIcon>
                        <DialogTitle id="take-number-title">
                            Xác nhận lấy số
                        </DialogTitle>
                        <DialogDescription>
                            Bạn đang chọn <strong>{pendingQueue.name}</strong> –{" "}
                            {pendingQueue.category}.
                        </DialogDescription>
                        <DialogSummary>
                            <span>Hiện có</span>
                            <strong>{pendingQueue.waiting} người chờ</strong>
                        </DialogSummary>
                        <DialogActions>
                            <DialogSecondary
                                type="button"
                                onClick={() => setPendingQueue(null)}
                            >
                                Xem lại
                            </DialogSecondary>
                            <DialogPrimary type="button" onClick={takeNumber}>
                                Xác nhận
                            </DialogPrimary>
                        </DialogActions>
                    </DialogCard>
                </DialogBackdrop>
            )}

            {showCancelDialog && (
                <DialogBackdrop
                    role="presentation"
                    onClick={() => setShowCancelDialog(false)}
                >
                    <DialogCard
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="cancel-ticket-title"
                        onClick={event => event.stopPropagation()}
                    >
                        <DialogClose
                            type="button"
                            aria-label="Đóng"
                            onClick={() => setShowCancelDialog(false)}
                        >
                            <X size={21} />
                        </DialogClose>
                        <DialogIcon $warning>
                            <X size={28} />
                        </DialogIcon>
                        <DialogTitle id="cancel-ticket-title">
                            Hủy lượt đang chờ?
                        </DialogTitle>
                        <DialogDescription>
                            Số <strong>{activeTicket?.number}</strong> sẽ không
                            còn hiệu lực và được chuyển vào lịch sử.
                        </DialogDescription>
                        <DialogActions>
                            <DialogSecondary
                                type="button"
                                onClick={() => setShowCancelDialog(false)}
                            >
                                Giữ lượt
                            </DialogSecondary>
                            <DialogDanger
                                type="button"
                                onClick={() => closeActiveTicket("cancelled")}
                            >
                                Hủy lượt
                            </DialogDanger>
                        </DialogActions>
                    </DialogCard>
                </DialogBackdrop>
            )}
        </StyledPage>
    );
};

export default RemoteQueuePage;

const StyledPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 0 0 calc(32px + var(--zaui-safe-area-inset-bottom, 0px));
    background: linear-gradient(180deg, #edf7ff 0, #f6f9fc 330px, #f4f6f9 100%);
    color: #172033;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 550;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
`;

const HeroHeader = styled.header`
    position: relative;
    overflow: hidden;
    padding: calc(16px + var(--zaui-safe-area-inset-top, 0px)) 14px 15px;
    color: #ffffff;
    background: radial-gradient(
            circle at 15% 5%,
            rgba(90, 195, 255, 0.32),
            transparent 38%
        ),
        linear-gradient(135deg, #00325f 0%, #004f8e 52%, #0070b9 100%);
    border-radius: 0 0 26px 26px;
    box-shadow: 0 14px 30px rgba(0, 64, 112, 0.22);

    &::after {
        content: "";
        position: absolute;
        width: 170px;
        height: 170px;
        right: -70px;
        top: -90px;
        border: 1px solid rgba(255, 255, 255, 0.13);
        border-radius: 50%;
        box-shadow: 0 0 0 28px rgba(255, 255, 255, 0.035);
        pointer-events: none;
    }
`;

const HeaderTop = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 55px;
`;

const BackButton = styled.button`
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 14px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);

    &:active {
        transform: scale(0.95);
        background: rgba(255, 255, 255, 0.2);
    }
`;

const BrandMark = styled.div`
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 15px;
    color: #005b9c;
    background: linear-gradient(145deg, #ffffff, #dff3ff);
    box-shadow: 0 8px 16px rgba(0, 37, 70, 0.18);
`;

const HeaderCopy = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderTitle = styled.h1`
    margin: 0;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.16;
    font-weight: 950;
    letter-spacing: -0.2px;
`;

const HeaderSubtitle = styled.div`
    margin-top: 4px;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.76);
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 700;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const MainTabs = styled.div`
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 5px;
    margin-top: 18px;
    padding: 5px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 17px;
    background: rgba(0, 42, 78, 0.24);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
`;

const MainTabButton = styled.button<{ $active: boolean }>`
    position: relative;
    min-width: 0;
    height: 48px;
    padding: 0 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 0;
    border-radius: 13px;
    color: ${({ $active }) => ($active ? "#005b9c" : "#ffffff")};
    background: ${({ $active }) =>
        $active ? "linear-gradient(145deg, #ffffff, #edf8ff)" : "transparent"};
    box-shadow: ${({ $active }) =>
        $active ? "0 8px 18px rgba(0, 35, 66, 0.18)" : "none"};
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
    white-space: nowrap;
    transition: transform 160ms ease, background 160ms ease;

    &:active {
        transform: scale(0.97);
    }

    @media (max-width: 350px) {
        gap: 4px;
        font-size: calc(13px * var(--app-font-scale));
    }
`;

const TabDot = styled.span`
    position: absolute;
    top: 8px;
    right: 9px;
    width: 7px;
    height: 7px;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: #1bb87a;
`;

const ContentArea = styled.main`
    padding: 16px 12px 0;
`;

const CurrentTicketBanner = styled.button`
    width: 100%;
    margin-bottom: 12px;
    padding: 12px 13px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(18, 165, 116, 0.14);
    border-radius: 17px;
    color: #155f4c;
    background: linear-gradient(135deg, #e4f9f1, #f2fcf8);
    box-shadow: 0 8px 20px rgba(12, 130, 91, 0.08);
    text-align: left;
`;

const CurrentTicketIcon = styled.span`
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 13px;
    color: #08795a;
    background: rgba(255, 255, 255, 0.76);
`;

const CurrentTicketLabel = styled.div`
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 750;
`;

const CurrentTicketValue = styled.div`
    margin-top: 2px;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const CurrentTicketAction = styled.span`
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    color: #087858;
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 900;
    white-space: nowrap;
`;

const LocationCard = styled.section`
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 14px;
    border: 1px solid rgba(0, 91, 156, 0.1);
    border-radius: 19px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 10px 24px rgba(31, 77, 110, 0.08);
`;

const LocationIcon = styled.div`
    width: 43px;
    height: 43px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 14px;
    color: #0065aa;
    background: linear-gradient(145deg, #eef9ff, #d9efff);
`;

const Eyebrow = styled.div`
    color: #718096;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 850;
    letter-spacing: 0.7px;
    text-transform: uppercase;
`;

const LocationTitle = styled.div`
    margin-top: 3px;
    color: #162338;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 900;
`;

const LocationMeta = styled.div`
    margin-top: 2px;
    color: #718096;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 650;
`;

const VerifiedBadge = styled.div`
    width: 35px;
    height: 35px;
    margin-left: auto;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #087c5b;
    background: #e8faf3;
`;

const WorkingHours = styled.section`
    display: flex;
    align-items: center;
    gap: 11px;
    margin-top: 12px;
    padding: 15px;
    border: 1px solid rgba(0, 101, 170, 0.12);
    border-radius: 19px;
    color: #064c82;
    background: linear-gradient(135deg, #e9f5ff, #f3f9ff);
    box-shadow: 0 8px 22px rgba(0, 91, 156, 0.06);
`;

const ClockIcon = styled.div`
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.72);
`;

const WorkingTitle = styled.div`
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
`;

const WorkingTime = styled.div`
    margin-top: 4px;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 750;
`;

const OpenBadge = styled.span`
    margin-left: auto;
    padding: 6px 8px;
    border-radius: 999px;
    color: #057858;
    background: #dcf8ed;
    font-size: calc(10px * var(--app-font-scale));
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;

    @media (max-width: 360px) {
        display: none;
    }
`;

const SectionHeading = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
    margin: 22px 2px 12px;
`;

const SectionEyebrow = styled.div`
    color: #64748b;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 850;
    letter-spacing: 0.55px;
    text-transform: uppercase;
`;

const SectionTitle = styled.h2`
    margin: 4px 0 0;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
    letter-spacing: -0.2px;
`;

const CounterBadge = styled.span`
    padding: 6px 10px;
    border-radius: 999px;
    color: #0062a7;
    background: #e5f4ff;
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 850;
    white-space: nowrap;
`;

const QueueList = styled.div`
    display: grid;
    gap: 12px;
`;

const QueueCard = styled.article`
    padding: 16px;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 21px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 12px 26px rgba(31, 58, 84, 0.08);
`;

const QueueCardTop = styled.div`
    display: flex;
    align-items: center;
    gap: 11px;
`;

const QueueSymbol = styled.div`
    width: 47px;
    height: 47px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border: 1px solid rgba(0, 101, 170, 0.09);
    border-radius: 16px;
    color: #0065aa;
    background: linear-gradient(145deg, #f4fbff, #e2f3ff);
`;

const QueueIdentity = styled.div`
    min-width: 0;
`;

const QueueName = styled.h3`
    margin: 0;
    color: #172033;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const QueueCode = styled.div`
    margin-top: 2px;
    color: #8490a1;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 750;
`;

const ActiveBadge = styled.span`
    margin-left: auto;
    padding: 7px 9px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 999px;
    color: #057858;
    background: #e6fbf3;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;
`;

const ActiveDot = styled.span`
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #14b880;
    box-shadow: 0 0 0 3px rgba(20, 184, 128, 0.12);
`;

const Category = styled.div`
    margin-top: 14px;
    color: #005c9e;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 900;
`;

const ServiceDescription = styled.p`
    margin: 6px 0 0;
    min-height: 42px;
    color: #657286;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.48;
    font-weight: 600;
`;

const QueueCardBottom = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 15px;
    padding-top: 13px;
    border-top: 1px solid #edf1f5;
`;

const WaitingInfo = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #64748b;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 650;

    svg {
        color: #3578a8;
    }

    strong {
        color: #172033;
        font-weight: 950;
    }
`;

const TakeButton = styled.button`
    min-height: 42px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: 0;
    border-radius: 13px;
    color: #ffffff;
    background: linear-gradient(135deg, #005c9f, #0074bd);
    box-shadow: 0 8px 16px rgba(0, 94, 162, 0.2);
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 900;
    white-space: nowrap;

    &:active {
        transform: scale(0.96);
    }
`;

const EmptyState = styled.section`
    margin-top: 14px;
    padding: 42px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 23px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 12px 28px rgba(31, 58, 84, 0.07);
    text-align: center;
`;

const EmptyIcon = styled.div`
    width: 72px;
    height: 72px;
    display: grid;
    place-items: center;
    border-radius: 23px;
    color: #0064a9;
    background: linear-gradient(145deg, #eff9ff, #dcefff);
    box-shadow: 0 10px 20px rgba(0, 91, 156, 0.1);
`;

const EmptyTitle = styled.h2`
    margin: 19px 0 0;
    color: #172033;
    font-size: calc(19px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 950;
`;

const EmptyDescription = styled.p`
    max-width: 320px;
    margin: 9px 0 0;
    color: #6b778b;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 600;
`;

const PrimaryAction = styled.button`
    min-height: 45px;
    margin-top: 21px;
    padding: 0 22px;
    border: 0;
    border-radius: 14px;
    color: #ffffff;
    background: linear-gradient(135deg, #005c9f, #0076bf);
    box-shadow: 0 9px 18px rgba(0, 94, 162, 0.2);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
`;

const LiveNotice = styled.section<{ $called: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 14px;
    border: 1px solid
        ${({ $called }) =>
            $called ? "rgba(20, 184, 128, 0.16)" : "rgba(0, 101, 170, 0.12)"};
    border-radius: 18px;
    color: ${({ $called }) => ($called ? "#076c51" : "#07568e")};
    background: ${({ $called }) => ($called ? "#e9faf4" : "#eaf6ff")};
`;

const LivePulse = styled.span<{ $called: boolean }>`
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: ${({ $called }) => ($called ? "#11af79" : "#188bcf")};
    box-shadow: 0 0 0 5px
        ${({ $called }) =>
            $called ? "rgba(17, 175, 121, 0.12)" : "rgba(24, 139, 207, 0.12)"};
`;

const LiveTitle = styled.div`
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 900;
`;

const LiveMeta = styled.div`
    margin-top: 2px;
    color: #718096;
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 650;
`;

const RefreshButton = styled.button`
    width: 40px;
    height: 40px;
    margin-left: auto;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border: 1px solid rgba(0, 91, 156, 0.08);
    border-radius: 13px;
    color: #005c9f;
    background: rgba(255, 255, 255, 0.78);

    .spinning {
        animation: spin 550ms linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;

const TicketCard = styled.section<{ $called: boolean }>`
    position: relative;
    overflow: hidden;
    margin-top: 13px;
    padding: 19px;
    border: 1px solid
        ${({ $called }) =>
            $called ? "rgba(15, 172, 118, 0.18)" : "rgba(0, 91, 156, 0.12)"};
    border-radius: 23px;
    background: linear-gradient(145deg, #ffffff, #f7fbff);
    box-shadow: 0 16px 34px rgba(24, 61, 91, 0.11);

    &::before {
        content: "";
        position: absolute;
        width: 130px;
        height: 130px;
        right: -50px;
        top: -58px;
        border-radius: 50%;
        background: ${({ $called }) =>
            $called ? "rgba(20, 184, 128, 0.08)" : "rgba(0, 111, 185, 0.07)"};
    }
`;

const TicketHeader = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
`;

const TicketLabel = styled.div`
    color: #66758a;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 850;
    letter-spacing: 0.55px;
    text-transform: uppercase;
`;

const TicketNumber = styled.div`
    margin-top: 4px;
    color: #005d9f;
    font-size: calc(52px * var(--app-font-scale));
    line-height: 1;
    font-weight: 1000;
    letter-spacing: -2px;
`;

const QueuePill = styled.span`
    padding: 8px 10px;
    border-radius: 999px;
    color: #06638f;
    background: #e3f4ff;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;
`;

const TicketCategory = styled.div`
    position: relative;
    z-index: 1;
    margin-top: 10px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #d8e3ec;
    color: #26364d;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;
`;

const TicketMetrics = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: stretch;
    gap: 12px;
    margin-top: 17px;
`;

const Metric = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 8px;
    align-items: center;
`;

const MetricIcon = styled.div`
    grid-row: 1 / 3;
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #0062a7;
    background: #e9f5fd;
`;

const MetricValue = styled.div`
    align-self: end;
    color: #172033;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.05;
    font-weight: 950;
`;

const MetricLabel = styled.div`
    align-self: start;
    margin-top: 3px;
    color: #7a8798;
    font-size: calc(10px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 700;
`;

const MetricDivider = styled.div`
    width: 1px;
    background: #e4eaf0;
`;

const ProgressTrack = styled.div`
    height: 8px;
    margin-top: 20px;
    overflow: hidden;
    border-radius: 999px;
    background: #e7edf3;
`;

const ProgressValue = styled.div<{ $progress: number }>`
    width: ${({ $progress }) => `${$progress}%`};
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0068ad, #26a4dc);
    transition: width 400ms ease;
`;

const ProgressText = styled.p`
    margin: 10px 0 0;
    color: #718096;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 600;
`;

const TrackingActions = styled.div`
    display: grid;
    gap: 9px;
    margin-top: 13px;
`;

const CompleteButton = styled.button`
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 0;
    border-radius: 15px;
    color: #ffffff;
    background: linear-gradient(135deg, #07805d, #10a878);
    box-shadow: 0 9px 18px rgba(9, 140, 99, 0.2);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
`;

const CancelButton = styled.button`
    min-height: 46px;
    border: 1px solid #d8e1e8;
    border-radius: 15px;
    color: #5f6b7b;
    background: rgba(255, 255, 255, 0.82);
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 850;
`;

const HelpfulNote = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-top: 13px;
    padding: 13px 14px;
    border-radius: 16px;
    color: #59677a;
    background: rgba(255, 255, 255, 0.62);
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;

    svg {
        flex: 0 0 auto;
        color: #07805d;
    }
`;

const HistoryFilters = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
`;

const HistoryFilterButton = styled.button<{ $active: boolean }>`
    min-width: 0;
    min-height: 43px;
    padding: 5px 4px;
    border: 1px solid
        ${({ $active }) =>
            $active ? "rgba(0, 101, 170, 0.2)" : "rgba(36, 62, 85, 0.08)"};
    border-radius: 14px;
    color: ${({ $active }) => ($active ? "#005d9f" : "#566375")};
    background: ${({ $active }) => ($active ? "#e8f5ff" : "#ffffff")};
    box-shadow: ${({ $active }) =>
        $active ? "0 6px 14px rgba(0, 91, 156, 0.1)" : "none"};
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 850;
    white-space: nowrap;

    span {
        display: inline-grid;
        place-items: center;
        min-width: 19px;
        height: 19px;
        margin-left: 2px;
        border-radius: 999px;
        color: ${({ $active }) => ($active ? "#ffffff" : "#758195")};
        background: ${({ $active }) => ($active ? "#0068ad" : "#edf1f5")};
        font-size: 10px;
    }
`;

const HistoryList = styled.div`
    display: grid;
    gap: 10px;
    margin-top: 14px;
`;

const HistoryCard = styled.article`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 9px 22px rgba(31, 58, 84, 0.07);
`;

const HistoryNumber = styled.div`
    min-width: 58px;
    height: 52px;
    padding: 0 8px;
    display: grid;
    place-items: center;
    border-radius: 15px;
    color: #005d9f;
    background: #e7f5ff;
    font-size: calc(20px * var(--app-font-scale));
    font-weight: 1000;
`;

const HistoryDetails = styled.div`
    min-width: 0;
`;

const HistoryQueue = styled.div`
    color: #172033;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
`;

const HistoryCategory = styled.div`
    margin-top: 3px;
    overflow: hidden;
    color: #68758a;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 650;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const HistoryDate = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 7px;
    color: #8792a2;
    font-size: calc(10px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 650;
`;

const StatusBadge = styled.span<{ $status: TicketStatus }>`
    padding: 7px 8px;
    border-radius: 999px;
    color: ${({ $status }) => getStatusColor($status)};
    background: ${({ $status }) => getStatusBackground($status)};
    font-size: calc(10px * var(--app-font-scale));
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;
`;

const DialogBackdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 16px;
    padding-bottom: calc(16px + var(--zaui-safe-area-inset-bottom, 0px));
    background: rgba(9, 28, 45, 0.48);
    backdrop-filter: blur(4px);
`;

const DialogCard = styled.section`
    position: relative;
    width: min(100%, 398px);
    padding: 24px 20px 19px;
    border: 1px solid rgba(255, 255, 255, 0.7);
    border-radius: 25px;
    background: #ffffff;
    box-shadow: 0 28px 60px rgba(5, 31, 51, 0.24);
    text-align: center;
    animation: dialog-in 180ms ease-out;

    @keyframes dialog-in {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;

const DialogClose = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 12px;
    color: #6d798a;
    background: #f2f5f7;
`;

const DialogIcon = styled.div<{ $warning?: boolean }>`
    width: 62px;
    height: 62px;
    margin: 0 auto;
    display: grid;
    place-items: center;
    border-radius: 20px;
    color: ${({ $warning }) => ($warning ? "#b54942" : "#0063a7")};
    background: ${({ $warning }) => ($warning ? "#fff0ee" : "#e8f5ff")};
`;

const DialogTitle = styled.h2`
    margin: 16px 0 0;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 950;
`;

const DialogDescription = styled.p`
    margin: 8px auto 0;
    max-width: 310px;
    color: #68758a;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 600;

    strong {
        color: #26364d;
        font-weight: 900;
    }
`;

const DialogSummary = styled.div`
    margin: 16px 0 0;
    padding: 11px 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 14px;
    color: #657286;
    background: #f2f7fb;
    font-size: calc(13px * var(--app-font-scale));

    strong {
        color: #005e9f;
        font-weight: 950;
    }
`;

const DialogActions = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
    margin-top: 18px;
`;

const DialogButton = styled.button`
    min-height: 47px;
    border-radius: 14px;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
`;

const DialogSecondary = styled(DialogButton)`
    border: 1px solid #dce4ea;
    color: #5f6d80;
    background: #ffffff;
`;

const DialogPrimary = styled(DialogButton)`
    border: 0;
    color: #ffffff;
    background: linear-gradient(135deg, #005c9f, #0076bf);
    box-shadow: 0 8px 18px rgba(0, 94, 162, 0.2);
`;

const DialogDanger = styled(DialogButton)`
    border: 0;
    color: #ffffff;
    background: linear-gradient(135deg, #a93f38, #ca554d);
    box-shadow: 0 8px 18px rgba(174, 67, 59, 0.18);
`;
