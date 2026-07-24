import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Page, useNavigate, useSnackbar } from "zmp-ui";
import {
    AlertTriangle,
    CalendarDays,
    ChevronRight,
    Clock3,
    History,
    MapPin,
    RefreshCw,
    ShieldCheck,
    Ticket,
    UserCheck,
    Users,
    X,
} from "lucide-react";
import { ApiError } from "@/services/api-client";
import {
    cancelRemoteQueueTicket,
    createRemoteQueueTicket,
    getActiveTicketFromError,
    getMyActiveRemoteQueueTicket,
    getMyRemoteQueueTickets,
    getRemoteQueueDesks,
    getRemoteQueueTicket,
    normalizeDesk,
    QueueUpdatedPayload,
    RemoteQueueDesk,
    RemoteQueueTicket,
    RemoteQueueTicketStatus,
} from "@/services/remoteQueue";
import {
    connectRemoteQueueSocket,
    disconnectRemoteQueueSocket,
    vietnamServiceDate,
} from "@/services/remoteQueueSocket";
import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@/components/layout/AppHeader";
import { useStore } from "@store";

type MainTab = "take" | "tracking" | "history";
type HistoryFilter = "all" | RemoteQueueTicketStatus;

const PAGE_SIZE = 10;

const HISTORY_FILTERS: Array<{ value: HistoryFilter; label: string }> = [
    { value: "all", label: "Tất cả" },
    { value: "WAITING", label: "Đang chờ" },
    { value: "SERVING", label: "Đang phục vụ" },
    { value: "COMPLETED", label: "Hoàn thành" },
    { value: "CANCELLED", label: "Đã hủy" },
];

const statusConfig: Record<
    RemoteQueueTicketStatus,
    { label: string; color: string; background: string }
> = {
    WAITING: {
        label: "Đang chờ",
        color: "#a15c00",
        background: "#fff5de",
    },
    SERVING: {
        label: "Đang phục vụ",
        color: "#087354",
        background: "#e4f9f0",
    },
    COMPLETED: {
        label: "Hoàn thành",
        color: "#4b5565",
        background: "#eef2f6",
    },
    CANCELLED: {
        label: "Đã hủy",
        color: "#a44842",
        background: "#fff0ee",
    },
    SKIPPED: {
        label: "Bỏ lượt",
        color: "#b42318",
        background: "#fef2f1",
    },
    EXPIRED: {
        label: "Hết hạn",
        color: "#4b5565",
        background: "#eef2f6",
    },
};

const formatTime = (date?: string | null) =>
    date
        ? new Intl.DateTimeFormat("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
          }).format(new Date(date))
        : "-";

const formatDate = (date?: string | null) =>
    date
        ? new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          }).format(new Date(date))
        : "-";

const getTicketDisplayNumber = (number: string) =>
    number.length < 3 ? number.padStart(3, "0") : number;

const getFriendlyRemoteQueueError = (error: unknown) => {
    if (error instanceof ApiError) {
        return error.message;
    }

    return error instanceof Error
        ? error.message
        : "Không thể tải dữ liệu lấy số từ xa.";
};

const canCancelTicket = (ticket?: RemoteQueueTicket | null) =>
    ticket?.status === "WAITING" || ticket?.status === "SERVING";

const shouldShowPeopleAhead = (ticket?: RemoteQueueTicket | null) =>
    ticket?.status === "WAITING";

const getTakeButtonLabel = (
    hasActiveTicket: boolean,
    taking: boolean,
    retryRemaining: number,
) => {
    if (hasActiveTicket) {
        return "Xem lượt";
    }

    if (taking) {
        return "Đang lấy...";
    }

    if (retryRemaining) {
        return `${retryRemaining}s`;
    }

    return "Lấy số";
};

const getEstimatedTimeLabel = (
    ticket: RemoteQueueTicket,
    estimatedMinutes: number,
) => {
    if (ticket.status === "SERVING") {
        return "Ngay";
    }

    if (shouldShowPeopleAhead(ticket)) {
        return `~${estimatedMinutes}'`;
    }

    return "-";
};

const getAssignedUserLabel = (
    name?: string | null,
    title?: string | null,
) => {
    if (!name) {
        return "";
    }

    return title ? `${name} - ${title}` : name;
};

const deskStatusConfig = {
    active: {
        label: "Đang hoạt động",
        color: "#087354",
        background: "#e4f9f0",
    },
    paused: {
        label: "Tạm ngưng",
        color: "#a15c00",
        background: "#fff5de",
    },
    unassigned: {
        label: "Chưa có người phụ trách",
        color: "#a44842",
        background: "#fff0ee",
    },
    offline: {
        label: "Tạm ngưng",
        color: "#4b5565",
        background: "#eef2f6",
    },
} as const;

const getAvatarInitial = (name?: string | null) =>
    (name || "?").trim().charAt(0).toUpperCase();

const canTakeNumberAtDesk = (desk: RemoteQueueDesk) =>
    desk.status === "active" && desk.assignees.length > 0;

const updateDeskByQueuePayload = (
    desk: RemoteQueueDesk,
    payload: QueueUpdatedPayload,
) => {
    if (desk.id !== payload.deskId) {
        return desk;
    }

    if (payload.desk) {
        return normalizeDesk(payload.desk);
    }

    return {
        ...desk,
        waiting: payload.waiting,
        currentServingNumber:
            payload.currentServingNumber ?? desk.currentServingNumber,
    };
};

const RemoteQueuePage: React.FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const [token, getAccessToken] = useStore(state => [
        state.token,
        state.getAccessToken,
    ]);

    const [activeTab, setActiveTab] = useState<MainTab>("take");
    const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
    const [desks, setDesks] = useState<RemoteQueueDesk[]>([]);
    const [deskError, setDeskError] = useState("");
    const [activeTicket, setActiveTicket] = useState<RemoteQueueTicket | null>(
        null,
    );
    const [historyItems, setHistoryItems] = useState<RemoteQueueTicket[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [takingDeskId, setTakingDeskId] = useState("");
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [retryRemaining, setRetryRemaining] = useState(0);
    const [socketConnected, setSocketConnected] = useState(false);
    const [connectionLost, setConnectionLost] = useState(false);
    const servingNotifiedRef = useRef<string | undefined>();
    const deskRequestRef = useRef(0);

    const activeDesk = useMemo(
        () => desks.find(desk => desk.id === activeTicket?.deskId),
        [activeTicket?.deskId, desks],
    );

    const estimatedMinutes = shouldShowPeopleAhead(activeTicket)
        ? Math.max(0, activeTicket?.peopleAhead || 0) * 7
        : 0;
    const activeAssignedUserLabel = getAssignedUserLabel(
        activeTicket?.assignedUserName ||
            activeDesk?.assignees[0]?.name ||
            activeDesk?.assignedUserName,
        activeTicket?.assignedUserTitle ||
            activeDesk?.assignees[0]?.position ||
            activeDesk?.assignees[0]?.departmentName ||
            activeDesk?.assignedUserTitle,
    );

    const loadDesks = async () => {
        const requestId = deskRequestRef.current + 1;
        deskRequestRef.current = requestId;
        const result = await getRemoteQueueDesks();

        if (deskRequestRef.current !== requestId) {
            return;
        }

        setDeskError("");
        setDesks(result);
    };

    const loadActiveTicket = async () => {
        const ticket = await getMyActiveRemoteQueueTicket();

        setActiveTicket(ticket);
        setActiveTab(ticket ? "tracking" : "take");
    };

    const loadInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([loadDesks(), loadActiveTicket()]);
        } catch (error) {
            setDeskError("Không thể tải thông tin quầy.");
            openSnackbar({
                type: "error",
                text: getFriendlyRemoteQueueError(error),
            });
        } finally {
            setLoading(false);
        }
    };

    const refreshTicket = async (ticketId = activeTicket?.id) => {
        if (!ticketId) {
            return;
        }

        try {
            const ticket = await getRemoteQueueTicket(ticketId);

            setActiveTicket(ticket);
        } catch (error) {
            openSnackbar({
                type: "error",
                text: getFriendlyRemoteQueueError(error),
            });
        }
    };

    const loadHistory = async (page = 0, append = false) => {
        setHistoryLoading(true);
        try {
            const result = await getMyRemoteQueueTickets({
                page,
                size: PAGE_SIZE,
                status: historyFilter === "all" ? "" : historyFilter,
            });

            setHistoryItems(current =>
                append ? [...current, ...result.items] : result.items,
            );
            setHistoryPage(result.page);
            setHistoryTotal(result.total);
        } catch (error) {
            openSnackbar({
                type: "error",
                text: getFriendlyRemoteQueueError(error),
            });
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        getAccessToken()
            .then(loadInitialData)
            .catch(error =>
                openSnackbar({
                    type: "error",
                    text: getFriendlyRemoteQueueError(error),
                }),
            );
    }, []);

    useEffect(() => {
        if (activeTab === "history") {
            loadHistory(0);
        }
    }, [activeTab, historyFilter]);

    useEffect(() => {
        if (!retryRemaining) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setRetryRemaining(current => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [retryRemaining]);

    useEffect(() => {
        if (!token) {
            disconnectRemoteQueueSocket();
            return undefined;
        }

        const socket = connectRemoteQueueSocket(token);
        const serviceDate = activeTicket?.serviceDate || vietnamServiceDate();

        const joinVisibleDesks = () => {
            desks.forEach(desk => {
                socket.emit("join-desk", { deskId: desk.id, serviceDate });
            });
            if (activeTicket?.deskId) {
                socket.emit("join-desk", {
                    deskId: activeTicket.deskId,
                    serviceDate: activeTicket.serviceDate,
                });
            }
        };

        const handleConnect = () => {
            setSocketConnected(true);
            setConnectionLost(false);
            joinVisibleDesks();
        };
        const handleDisconnect = () => {
            setSocketConnected(false);
            setConnectionLost(true);
        };
        const handleQueueUpdated = (payload: QueueUpdatedPayload) => {
            setDesks(current =>
                current.map(desk => updateDeskByQueuePayload(desk, payload)),
            );
            if (payload.deskId === activeTicket?.deskId) {
                refreshTicket();
            }
        };
        const handleTicketStatusUpdated = (payload: RemoteQueueTicket) => {
            if (payload.id !== activeTicket?.id) {
                return;
            }

            setActiveTicket(payload);
            if (
                payload.status === "SERVING" &&
                servingNotifiedRef.current !== payload.id
            ) {
                servingNotifiedRef.current = payload.id;
                navigator.vibrate?.([180, 80, 180]);
                openSnackbar({
                    type: "success",
                    text: `Đã tới lượt bạn. Vui lòng tới quầy ${
                        payload.deskCode || payload.deskName || ""
                    }`.trim(),
                });
            }
        };
        const handleTicketCreated = (payload: RemoteQueueTicket) => {
            if (payload.id === activeTicket?.id) {
                setActiveTicket(payload);
            }
        };
        const handleDeskAssignmentChanged = (payload: unknown) => {
            const record =
                payload && typeof payload === "object"
                    ? (payload as { desk?: unknown; deskId?: string })
                    : {};

            if (record.desk) {
                const nextDesk = normalizeDesk(record.desk);
                setDesks(current =>
                    current.map(desk =>
                        desk.id === nextDesk.id ? nextDesk : desk,
                    ),
                );
                return;
            }

            loadDesks().catch(() => undefined);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("queue-updated", handleQueueUpdated);
        socket.on("ticket-created", handleTicketCreated);
        socket.on("ticket-status-updated", handleTicketStatusUpdated);
        socket.on("desk-updated", handleDeskAssignmentChanged);
        socket.on("desk-assignment-updated", handleDeskAssignmentChanged);
        socket.on("desk-assignment-created", handleDeskAssignmentChanged);
        socket.on("desk-assignment-cancelled", handleDeskAssignmentChanged);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            desks.forEach(desk => {
                socket.emit("leave-desk", { deskId: desk.id, serviceDate });
            });
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("queue-updated", handleQueueUpdated);
            socket.off("ticket-created", handleTicketCreated);
            socket.off("ticket-status-updated", handleTicketStatusUpdated);
            socket.off("desk-updated", handleDeskAssignmentChanged);
            socket.off("desk-assignment-updated", handleDeskAssignmentChanged);
            socket.off("desk-assignment-created", handleDeskAssignmentChanged);
            socket.off("desk-assignment-cancelled", handleDeskAssignmentChanged);
        };
    }, [token, desks, activeTicket?.id, activeTicket?.deskId]);

    useEffect(() => {
        if (!activeTicket?.id || socketConnected) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            refreshTicket(activeTicket.id);
        }, 15000);

        return () => window.clearInterval(timer);
    }, [activeTicket?.id, socketConnected]);

    const handleTakeNumber = async (desk: RemoteQueueDesk) => {
        if (activeTicket) {
            setActiveTab("tracking");
            openSnackbar({
                text: `Bạn đang có một lượt tại ${
                    activeTicket.deskName || "quầy tiếp nhận"
                }.`,
            });
            return;
        }

        setTakingDeskId(desk.id);
        try {
            const ticket = await createRemoteQueueTicket(desk.id);

            setActiveTicket(ticket);
            setActiveTab("tracking");
            openSnackbar({
                type: "success",
                text: "Lấy số thành công.",
            });
            await loadDesks();
        } catch (error) {
            const existingTicket = getActiveTicketFromError(error);

            if (existingTicket) {
                setActiveTicket(existingTicket);
                setActiveTab("tracking");
                openSnackbar({
                    text: `Bạn đang có một lượt tại ${
                        existingTicket.deskName || "quầy tiếp nhận"
                    }.`,
                });
                return;
            }

            if (error instanceof ApiError && error.status === 429) {
                setRetryRemaining(error.retryAfter || 30);
            }

            openSnackbar({
                type: "error",
                text: getFriendlyRemoteQueueError(error),
            });
            if (error instanceof ApiError && [400, 404].includes(error.status)) {
                await loadDesks();
            }
        } finally {
            setTakingDeskId("");
        }
    };

    const handleCancelTicket = async () => {
        if (!activeTicket) {
            return;
        }

        setCancelLoading(true);
        try {
            await cancelRemoteQueueTicket(activeTicket.id);
            setActiveTicket(null);
            setShowCancelDialog(false);
            setActiveTab("take");
            openSnackbar({
                type: "success",
                text: "Đã hủy lượt hiện tại.",
            });
            await Promise.all([loadDesks(), loadHistory(0)]);
        } catch (error) {
            if (error instanceof ApiError && error.status === 400) {
                await refreshTicket(activeTicket.id);
            }
            openSnackbar({
                type: "error",
                text: getFriendlyRemoteQueueError(error),
            });
        } finally {
            setCancelLoading(false);
        }
    };

    const renderTakeNumber = () => (
        <ContentArea>
            {activeTicket && (
                <CurrentTicketBanner
                    type="button"
                    onClick={() => setActiveTab("tracking")}
                >
                    <Ticket size={22} />
                    <div>
                        <CurrentTicketLabel>Bạn đang giữ số</CurrentTicketLabel>
                        <CurrentTicketValue>
                            {getTicketDisplayNumber(activeTicket.number)} ·{" "}
                            {activeTicket.deskName}
                        </CurrentTicketValue>
                    </div>
                    <ChevronRight size={18} />
                </CurrentTicketBanner>
            )}

            <LocationCard>
                <MapPin size={22} />
                <div>
                    <Eyebrow>Điểm phục vụ</Eyebrow>
                    <LocationTitle>Trung tâm HCC Phường Gò Dầu</LocationTitle>
                    <LocationMeta>Tỉnh Tây Ninh</LocationMeta>
                </div>
                <VerifiedBadge>
                    <ShieldCheck size={18} />
                </VerifiedBadge>
            </LocationCard>

            <WorkingHours>
                <Clock3 size={22} />
                <div>
                    <WorkingTitle>Giờ làm việc hôm nay</WorkingTitle>
                    <WorkingTime>07:00-11:30 · 13:30-17:00</WorkingTime>
                </div>
            </WorkingHours>

            {connectionLost && (
                <ConnectionNotice>
                    Đang kết nối lại. Dữ liệu sẽ tự động đồng bộ khi có mạng.
                </ConnectionNotice>
            )}

            <SectionHeading>
                <div>
                    <SectionEyebrow>Chọn lĩnh vực cần giải quyết</SectionEyebrow>
                    <SectionTitle>Các quầy đang phục vụ</SectionTitle>
                </div>
                <CounterBadge>{desks.length} quầy</CounterBadge>
            </SectionHeading>

            {loading && desks.length === 0 && (
                <QueueList>
                    {[0, 1, 2].map(item => (
                        <QueueCardSkeleton key={item}>
                            <SkeletonTop>
                                <SkeletonCircle />
                                <div>
                                    <SkeletonLine $width="138px" />
                                    <SkeletonLine $width="86px" />
                                </div>
                            </SkeletonTop>
                            <SkeletonAssignee>
                                <SkeletonCircle />
                                <div>
                                    <SkeletonLine $width="112px" />
                                    <SkeletonLine $width="170px" />
                                    <SkeletonLine $width="128px" />
                                </div>
                            </SkeletonAssignee>
                        </QueueCardSkeleton>
                    ))}
                </QueueList>
            )}

            {!loading && deskError && desks.length === 0 && (
                <StateBox>
                    <AlertTriangle size={28} />
                    <strong>Không thể tải thông tin quầy.</strong>
                    <span>Vui lòng thử lại.</span>
                    <RetryButton type="button" onClick={loadInitialData}>
                        Thử lại
                    </RetryButton>
                </StateBox>
            )}

            {!loading && !deskError && desks.length === 0 && (
                <StateBox>
                    <AlertTriangle size={28} />
                    <strong>Hiện chưa có quầy nào mở tiếp nhận</strong>
                    <RetryButton type="button" onClick={loadInitialData}>
                        Thử lại
                    </RetryButton>
                </StateBox>
            )}

            <QueueList>
                {desks.map(desk => {
                    const taking = takingDeskId === desk.id;
                    const disabled =
                        taking ||
                        retryRemaining > 0 ||
                        Boolean(activeTicket) ||
                        !canTakeNumberAtDesk(desk);
                    const status = deskStatusConfig[desk.status];
                    const primaryAssignee = desk.assignees[0] || null;
                    const otherAssigneeCount = Math.max(
                        0,
                        desk.assignees.length - 1,
                    );
                    const assigneeName = primaryAssignee?.name || "";
                    const assigneeSubtitle =
                        primaryAssignee?.position ||
                        primaryAssignee?.departmentName ||
                        desk.assignedUserTitle;

                    return (
                        <QueueCard key={desk.id}>
                            <QueueCardTop>
                                <QueueSymbol>
                                    <Ticket size={24} strokeWidth={2.2} />
                                </QueueSymbol>
                                <QueueIdentity>
                                    <QueueName>{desk.name}</QueueName>
                                    <QueueCode>{desk.code}</QueueCode>
                                </QueueIdentity>
                                <DeskStatusBadge
                                    $color={status.color}
                                    $background={status.background}
                                >
                                    {status.label}
                                </DeskStatusBadge>
                            </QueueCardTop>

                            <Category>{desk.category}</Category>
                            <AssigneePanel $empty={!assigneeName}>
                                {assigneeName ? (
                                    <>
                                        <AssigneeAvatar
                                            data-initial={getAvatarInitial(
                                                assigneeName,
                                            )}
                                        >
                                            {primaryAssignee?.avatar ? (
                                                <img
                                                    src={primaryAssignee.avatar}
                                                    alt={assigneeName}
                                                    onError={event => {
                                                        event.currentTarget.classList.add(
                                                            "is-hidden",
                                                        );
                                                        event.currentTarget.parentElement?.classList.add(
                                                            "avatar-error",
                                                        );
                                                    }}
                                                />
                                            ) : (
                                                getAvatarInitial(assigneeName)
                                            )}
                                        </AssigneeAvatar>
                                        <AssigneeInfo>
                                            <AssigneeLabel>
                                                Người phụ trách
                                            </AssigneeLabel>
                                            <AssigneeName>
                                                {assigneeName}
                                            </AssigneeName>
                                            {assigneeSubtitle && (
                                                <AssigneeSubtitle>
                                                    {assigneeSubtitle}
                                                </AssigneeSubtitle>
                                            )}
                                            {otherAssigneeCount > 0 && (
                                                <AssigneeMore>
                                                    và {otherAssigneeCount} người
                                                    khác
                                                </AssigneeMore>
                                            )}
                                        </AssigneeInfo>
                                    </>
                                ) : (
                                    <>
                                        <AssigneeAvatar $empty>
                                            <UserCheck size={22} />
                                        </AssigneeAvatar>
                                        <AssigneeInfo>
                                            <AssigneeName>
                                                Chưa có người phụ trách
                                            </AssigneeName>
                                            <AssigneeSubtitle>
                                                Quầy hiện chưa tiếp nhận yêu
                                                cầu.
                                            </AssigneeSubtitle>
                                        </AssigneeInfo>
                                    </>
                                )}
                            </AssigneePanel>
                            {desk.currentServingNumber && (
                                <ServingLine>
                                    Đang phục vụ:{" "}
                                    <strong>{desk.currentServingNumber}</strong>
                                </ServingLine>
                            )}
                            <ServiceDescription>
                                {desk.services}
                            </ServiceDescription>

                            <QueueCardBottom>
                                <WaitingInfo>
                                    <Users size={19} />
                                    <span>
                                        Đang chờ: <strong>{desk.waiting}</strong>
                                    </span>
                                </WaitingInfo>
                                <TakeButton
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => handleTakeNumber(desk)}
                                >
                                    {getTakeButtonLabel(
                                        Boolean(activeTicket),
                                        taking,
                                        retryRemaining,
                                    )}
                                    <ChevronRight size={18} />
                                </TakeButton>
                            </QueueCardBottom>
                        </QueueCard>
                    );
                })}
            </QueueList>
        </ContentArea>
    );

    const renderTracking = () => {
        if (!activeTicket) {
            return (
                <ContentArea>
                    <StateBox>
                        <Ticket size={34} />
                        <strong>Bạn chưa có lượt đang chờ</strong>
                        <span>Chọn quầy phù hợp để lấy số và theo dõi lượt.</span>
                        <RetryButton type="button" onClick={() => setActiveTab("take")}>
                            Lấy số ngay
                        </RetryButton>
                    </StateBox>
                </ContentArea>
            );
        }

        const status = statusConfig[activeTicket.status];

        return (
            <ContentArea>
                {connectionLost && (
                    <ConnectionNotice>
                        Mất kết nối realtime, hệ thống đang cập nhật định kỳ.
                    </ConnectionNotice>
                )}

                <LiveNotice $serving={activeTicket.status === "SERVING"}>
                    <LivePulse $serving={activeTicket.status === "SERVING"} />
                    <div>
                        <LiveTitle>
                            {activeTicket.status === "SERVING"
                                ? "Đã tới lượt phục vụ"
                                : "Lượt của bạn đang được theo dõi"}
                        </LiveTitle>
                        <LiveMeta>
                            Cập nhật gần nhất lúc {formatTime(new Date().toISOString())}
                        </LiveMeta>
                    </div>
                    <RefreshButton
                        type="button"
                        aria-label="Cập nhật lượt"
                        onClick={() => refreshTicket()}
                    >
                        <RefreshCw size={21} />
                    </RefreshButton>
                </LiveNotice>

                <TicketCard $serving={activeTicket.status === "SERVING"}>
                    <TicketHeader>
                        <div>
                            <TicketLabel>Số thứ tự của bạn</TicketLabel>
                            <TicketNumber>
                                {getTicketDisplayNumber(activeTicket.number)}
                            </TicketNumber>
                        </div>
                        <QueuePill>
                            {activeTicket.deskCode || activeTicket.deskName}
                        </QueuePill>
                    </TicketHeader>

                    <StatusLine>
                        <TicketStatusBadge
                            $color={status.color}
                            $background={status.background}
                        >
                            {status.label}
                        </TicketStatusBadge>
                        <span>{activeTicket.category}</span>
                    </StatusLine>

                    {activeAssignedUserLabel && (
                        <TicketAssignedUser>
                            <UserCheck size={18} />
                            <span>
                                Phụ trách:{" "}
                                <strong>{activeAssignedUserLabel}</strong>
                            </span>
                        </TicketAssignedUser>
                    )}

                    <TicketMetrics>
                        <Metric>
                            <MetricValue>
                                {shouldShowPeopleAhead(activeTicket)
                                    ? activeTicket.peopleAhead || 0
                                    : "-"}
                            </MetricValue>
                            <MetricLabel>người phía trước</MetricLabel>
                        </Metric>
                        <Metric>
                            <MetricValue>
                                {getEstimatedTimeLabel(
                                    activeTicket,
                                    estimatedMinutes,
                                )}
                            </MetricValue>
                            <MetricLabel>thời gian dự kiến</MetricLabel>
                        </Metric>
                        <Metric>
                            <MetricValue>{formatDate(activeTicket.serviceDate)}</MetricValue>
                            <MetricLabel>ngày làm việc</MetricLabel>
                        </Metric>
                    </TicketMetrics>

                    <ProgressText>
                        {activeTicket.status === "SERVING"
                            ? `Vui lòng tới quầy ${
                                  activeTicket.deskCode ||
                                  activeTicket.deskName ||
                                  ""
                              } để được phục vụ.`
                            : "Hãy có mặt sớm 10 phút. Nếu đến muộn, vé có thể hết hiệu lực."}
                    </ProgressText>
                </TicketCard>

                {canCancelTicket(activeTicket) && (
                    <TrackingActions>
                        <CancelButton
                            type="button"
                            onClick={() => setShowCancelDialog(true)}
                        >
                            Hủy số
                        </CancelButton>
                    </TrackingActions>
                )}

                {activeDesk && (
                    <HelpfulNote>
                        <ShieldCheck size={20} />
                        <span>
                            {activeDesk.services}. Vui lòng chuẩn bị hồ sơ trước khi
                            tới quầy.
                        </span>
                    </HelpfulNote>
                )}
            </ContentArea>
        );
    };

    const renderHistory = () => (
        <ContentArea>
            <HistoryFilters>
                {HISTORY_FILTERS.map(filter => (
                    <HistoryFilterButton
                        key={filter.value}
                        type="button"
                        $active={historyFilter === filter.value}
                        onClick={() => setHistoryFilter(filter.value)}
                    >
                        {filter.label}
                    </HistoryFilterButton>
                ))}
            </HistoryFilters>

            {!historyLoading && historyItems.length === 0 && (
                <StateBox>
                    <History size={34} />
                    <strong>Chưa có lịch sử lấy số</strong>
                    <span>Các lượt đã hoàn thành hoặc đã hủy sẽ hiển thị tại đây.</span>
                </StateBox>
            )}

            <HistoryList>
                {historyItems.map(ticket => {
                    const status = statusConfig[ticket.status];

                    return (
                        <HistoryCard
                            key={ticket.id}
                            type="button"
                            onClick={() => {
                                setActiveTicket(ticket);
                                setActiveTab("tracking");
                                refreshTicket(ticket.id);
                            }}
                        >
                            <HistoryNumber>
                                {getTicketDisplayNumber(ticket.number)}
                            </HistoryNumber>
                            <HistoryDetails>
                                <HistoryQueue>{ticket.deskName}</HistoryQueue>
                                <HistoryCategory>{ticket.category}</HistoryCategory>
                                <HistoryDate>
                                    <CalendarDays size={15} />
                                    {formatTime(ticket.createdAt)} ·{" "}
                                    {formatDate(ticket.serviceDate)}
                                </HistoryDate>
                            </HistoryDetails>
                            <TicketStatusBadge
                                $color={status.color}
                                $background={status.background}
                            >
                                {status.label}
                            </TicketStatusBadge>
                        </HistoryCard>
                    );
                })}
            </HistoryList>

            {historyItems.length < historyTotal && (
                <LoadMoreButton
                    type="button"
                    disabled={historyLoading}
                    onClick={() => loadHistory(historyPage + 1, true)}
                >
                    {historyLoading ? "Đang tải..." : "Xem thêm"}
                </LoadMoreButton>
            )}
        </ContentArea>
    );

    return (
        <StyledPage>
            <AppHeader
                back
                title="Lấy số từ xa"
                description="Trung tâm HCC Phường Gò Dầu"
                onBack={() => navigate("/", { direction: "backward" })}
                rightSlot={
                    <HeaderButton type="button" onClick={() => setActiveTab("history")}>
                        <History size={18} />
                    </HeaderButton>
                }
            />

            <MainTabs role="tablist" aria-label="Chức năng lấy số từ xa">
                <MainTabButton
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "take"}
                    $active={activeTab === "take"}
                    onClick={() => setActiveTab("take")}
                >
                    <Ticket size={18} />
                    <span>Lấy số</span>
                </MainTabButton>
                <MainTabButton
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "tracking"}
                    $active={activeTab === "tracking"}
                    onClick={() => setActiveTab("tracking")}
                >
                    <Clock3 size={18} />
                    <span>Theo dõi</span>
                    {activeTicket && <TabDot aria-label="Có lượt đang chờ" />}
                </MainTabButton>
                <MainTabButton
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "history"}
                    $active={activeTab === "history"}
                    onClick={() => setActiveTab("history")}
                >
                    <History size={18} />
                    <span>Lịch sử</span>
                    {historyTotal > 0 && (
                        <TabBadge>
                            {historyTotal > 99 ? "99+" : historyTotal}
                        </TabBadge>
                    )}
                </MainTabButton>
            </MainTabs>

            {activeTab === "take" && renderTakeNumber()}
            {activeTab === "tracking" && renderTracking()}
            {activeTab === "history" && renderHistory()}

            {showCancelDialog && activeTicket && (
                <DialogBackdrop>
                    <DialogCard>
                        <DialogClose
                            type="button"
                            aria-label="Đóng"
                            onClick={() => setShowCancelDialog(false)}
                        >
                            <X size={20} />
                        </DialogClose>
                        <DialogIcon>
                            <AlertTriangle size={30} />
                        </DialogIcon>
                        <DialogTitle>Bạn chắc chắn muốn hủy lượt?</DialogTitle>
                        <DialogDescription>
                            Số thứ tự{" "}
                            <strong>
                                {getTicketDisplayNumber(activeTicket.number)}
                            </strong>{" "}
                            sẽ không lấy lại được.
                        </DialogDescription>
                        <DialogActions>
                            <DialogSecondary
                                type="button"
                                disabled={cancelLoading}
                                onClick={() => setShowCancelDialog(false)}
                            >
                                Giữ lại
                            </DialogSecondary>
                            <DialogDanger
                                type="button"
                                disabled={cancelLoading}
                                onClick={handleCancelTicket}
                            >
                                {cancelLoading ? "Đang hủy..." : "Hủy số"}
                            </DialogDanger>
                        </DialogActions>
                    </DialogCard>
                </DialogBackdrop>
            )}

            <AppBottomNav />
        </StyledPage>
    );
};

export default RemoteQueuePage;

const StyledPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 92px;
    color: #172033;
    background: linear-gradient(180deg, #eef7ff 0, #f7fbff 260px, #f5f7fb 100%);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const HeaderButton = styled.button`
    position: relative;
    top: 34px;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 14px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.16);
`;

const MainTabs = styled.div`
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    margin: 0 12px 12px;
    padding: 5px;
    border: 1px solid rgba(0, 104, 173, 0.12);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 12px 28px rgba(31, 58, 84, 0.1);
    backdrop-filter: blur(12px);
`;

const MainTabButton = styled.button<{ $active?: boolean }>`
    position: relative;
    min-width: 0;
    min-height: 48px;
    padding: 7px 5px;
    border: 0;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: ${({ $active }) => ($active ? "#ffffff" : "#526071")};
    background: ${({ $active }) =>
        $active ? "linear-gradient(180deg, #0077c8 0%, #005f9f 100%)" : "transparent"};
    box-shadow: ${({ $active }) =>
        $active ? "0 8px 18px rgba(0, 104, 173, 0.25)" : "none"};
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;
    line-height: 1.1;
    transition:
        background 0.2s ease,
        box-shadow 0.2s ease,
        color 0.2s ease,
        transform 0.2s ease;

    svg {
        flex: 0 0 auto;
        stroke-width: 2.4;
    }

    span {
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &:active {
        transform: scale(0.98);
    }
`;

const TabDot = styled.i`
    position: absolute;
    top: 7px;
    right: 15px;
    width: 8px;
    height: 8px;
    border: 2px solid #ffffff;
    border-radius: 999px;
    background: #ffb020;
`;

const TabBadge = styled.span`
    position: absolute;
    top: 5px;
    right: 8px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: #e5484d;
    font-size: 10px;
    font-weight: 900;
    line-height: 1;
`;

const ContentArea = styled.main`
    padding: 0 12px 24px;
`;

const CurrentTicketBanner = styled.button`
    width: 100%;
    min-height: 68px;
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid rgba(0, 104, 173, 0.18);
    border-radius: 18px;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    text-align: left;
    color: #005d9f;
    background: #e8f5ff;
`;

const CurrentTicketLabel = styled.div`
    color: #667085;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 750;
`;

const CurrentTicketValue = styled.div`
    margin-top: 3px;
    color: #172033;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
`;

const LocationCard = styled.section`
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 15px;
    border: 1px solid rgba(0, 101, 170, 0.11);
    border-radius: 19px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgba(31, 58, 84, 0.07);
`;

const Eyebrow = styled.div`
    color: #718096;
    font-size: calc(11px * var(--app-font-scale));
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
    border-radius: 19px;
    color: #064c82;
    background: linear-gradient(135deg, #e9f5ff, #f3f9ff);
`;

const WorkingTitle = styled.div`
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 900;
`;

const WorkingTime = styled.div`
    margin-top: 4px;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 750;
`;

const ConnectionNotice = styled.div`
    margin-top: 12px;
    padding: 11px 13px;
    border-radius: 14px;
    color: #a15c00;
    background: #fff5de;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;
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
`;

const CounterBadge = styled.span`
    padding: 6px 10px;
    border-radius: 999px;
    color: #0062a7;
    background: #e5f4ff;
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 850;
`;

const QueueList = styled.div`
    display: grid;
    gap: 12px;
`;

const QueueCard = styled.article`
    padding: 16px;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 21px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 12px 26px rgba(31, 58, 84, 0.08);
`;

const QueueCardSkeleton = styled(QueueCard)`
    min-height: 206px;
`;

const SkeletonTop = styled.div`
    display: flex;
    align-items: center;
    gap: 11px;
`;

const SkeletonAssignee = styled.div`
    min-height: 76px;
    margin-top: 14px;
    padding: 12px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 11px;
    background: #f5f9fd;
`;

const SkeletonCircle = styled.div`
    width: 47px;
    height: 47px;
    flex: 0 0 47px;
    border-radius: 16px;
    background: linear-gradient(90deg, #edf2f7 0%, #f8fbff 50%, #edf2f7 100%);
    background-size: 200% 100%;
    animation: queue-skeleton 1.2s ease-in-out infinite;
`;

const SkeletonLine = styled.div<{ $width: string }>`
    width: ${({ $width }) => $width};
    max-width: 100%;
    height: 12px;
    margin-top: 8px;
    border-radius: 999px;
    background: linear-gradient(90deg, #edf2f7 0%, #f8fbff 50%, #edf2f7 100%);
    background-size: 200% 100%;
    animation: queue-skeleton 1.2s ease-in-out infinite;

    @keyframes queue-skeleton {
        0% {
            background-position: 0% 50%;
        }

        100% {
            background-position: -200% 50%;
        }
    }
`;

const QueueCardTop = styled.div`
    display: flex;
    align-items: center;
    gap: 11px;
`;

const QueueSymbol = styled.div`
    width: 47px;
    height: 47px;
    display: grid;
    place-items: center;
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
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const QueueCode = styled.div`
    margin-top: 2px;
    color: #8490a1;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 750;
`;

const DeskStatusBadge = styled.span<{ $color: string; $background: string }>`
    margin-left: auto;
    padding: 7px 9px;
    border-radius: 999px;
    color: ${({ $color }) => $color};
    background: ${({ $background }) => $background};
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 900;
    white-space: nowrap;
    align-self: flex-start;
`;

const Category = styled.div`
    margin-top: 14px;
    color: #005c9e;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
`;

const AssigneePanel = styled.div<{ $empty?: boolean }>`
    min-height: 76px;
    margin-top: 10px;
    padding: 12px;
    border: 1px solid ${({ $empty }) => ($empty ? "#fee2e2" : "#e0edf8")};
    border-radius: 16px;
    color: #475467;
    background: ${({ $empty }) => ($empty ? "#fff7f7" : "#f4f9ff")};
    display: flex;
    align-items: center;
    gap: 11px;
`;

const AssigneeAvatar = styled.div<{ $empty?: boolean }>`
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: ${({ $empty }) => ($empty ? "#a44842" : "#0068ad")};
    background: ${({ $empty }) => ($empty ? "#fee2e2" : "#dff2ff")};
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 950;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    img.is-hidden {
        display: none;
    }

    &.avatar-error::before {
        content: attr(data-initial);
    }
`;

const AssigneeInfo = styled.div`
    min-width: 0;
`;

const AssigneeLabel = styled.div`
    color: #0068ad;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
`;

const AssigneeName = styled.div`
    margin-top: 3px;
    color: #172033;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 950;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const AssigneeSubtitle = styled.div`
    margin-top: 3px;
    color: #667085;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 750;
`;

const AssigneeMore = styled.div`
    margin-top: 5px;
    color: #0068ad;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
`;

const ServingLine = styled.div`
    margin-top: 9px;
    color: #475467;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;

    strong {
        color: #005c9e;
        font-weight: 950;
    }
`;

const ServiceDescription = styled.p`
    margin: 6px 0 0;
    min-height: 42px;
    color: #657286;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.48;
    font-weight: 600;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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

    strong {
        color: #172033;
        font-weight: 950;
    }
`;

const TakeButton = styled.button`
    min-height: 44px;
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    border: 0;
    border-radius: 13px;
    color: #ffffff;
    background: linear-gradient(135deg, #005c9f, #0074bd);
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 900;

    &:disabled {
        opacity: 0.62;
    }
`;

const StateBox = styled.section`
    margin-top: 14px;
    padding: 32px 20px;
    display: grid;
    place-items: center;
    gap: 9px;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 21px;
    background: #ffffff;
    color: #667085;
    text-align: center;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 700;

    strong {
        color: #172033;
        font-size: calc(15px * var(--app-font-scale));
        font-weight: 900;
    }
`;

const RetryButton = styled.button`
    min-height: 42px;
    margin-top: 8px;
    padding: 0 18px;
    border: 0;
    border-radius: 13px;
    color: #ffffff;
    background: #0068ad;
    font-weight: 900;
`;

const LiveNotice = styled.section<{ $serving: boolean }>`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 14px;
    border-radius: 18px;
    color: ${({ $serving }) => ($serving ? "#076c51" : "#07568e")};
    background: ${({ $serving }) => ($serving ? "#e9faf4" : "#eaf6ff")};
`;

const LivePulse = styled.span<{ $serving: boolean }>`
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${({ $serving }) => ($serving ? "#11af79" : "#188bcf")};
    box-shadow: 0 0 0 5px
        ${({ $serving }) =>
            $serving ? "rgba(17, 175, 121, 0.12)" : "rgba(24, 139, 207, 0.12)"};
`;

const LiveTitle = styled.div`
    font-size: calc(13px * var(--app-font-scale));
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
    border: 1px solid rgba(0, 91, 156, 0.08);
    border-radius: 13px;
    display: grid;
    place-items: center;
    color: #005c9f;
    background: rgba(255, 255, 255, 0.78);
`;

const TicketCard = styled.section<{ $serving: boolean }>`
    margin-top: 13px;
    padding: 19px;
    border-radius: 23px;
    background: linear-gradient(145deg, #ffffff, #f7fbff);
    box-shadow: 0 16px 34px rgba(24, 61, 91, 0.11);
`;

const TicketHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
`;

const TicketLabel = styled.div`
    color: #66758a;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 850;
    letter-spacing: 0.55px;
    text-transform: uppercase;
`;

const TicketNumber = styled.div`
    margin-top: 4px;
    color: #005d9f;
    font-size: calc(58px * var(--app-font-scale));
    line-height: 1;
    font-weight: 1000;
`;

const QueuePill = styled.span`
    padding: 8px 10px;
    border-radius: 999px;
    color: #06638f;
    background: #e3f4ff;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;
`;

const StatusLine = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 700;
`;

const TicketStatusBadge = styled.span<{
    $color: string;
    $background: string;
}>`
    padding: 7px 9px;
    border-radius: 999px;
    color: ${({ $color }) => $color};
    background: ${({ $background }) => $background};
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 900;
    white-space: nowrap;
`;

const TicketAssignedUser = styled.div`
    margin-top: 13px;
    padding: 10px 12px;
    border-radius: 14px;
    color: #475467;
    background: rgba(255, 255, 255, 0.72);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 750;

    svg {
        flex: 0 0 auto;
        color: #0068ad;
    }

    strong {
        color: #172033;
        font-weight: 950;
    }
`;

const TicketMetrics = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 17px;
`;

const Metric = styled.div`
    padding: 10px 8px;
    border-radius: 14px;
    background: #f2f7fb;
    text-align: center;
`;

const MetricValue = styled.div`
    color: #172033;
    font-size: calc(17px * var(--app-font-scale));
    font-weight: 950;
`;

const MetricLabel = styled.div`
    margin-top: 4px;
    color: #7a8798;
    font-size: calc(10px * var(--app-font-scale));
    font-weight: 700;
`;

const ProgressText = styled.p`
    margin: 13px 0 0;
    color: #718096;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;
`;

const TrackingActions = styled.div`
    margin-top: 13px;
`;

const PrimaryAction = styled.button`
    min-height: 46px;
    border: 0;
    border-radius: 14px;
    color: #ffffff;
    background: linear-gradient(135deg, #005c9f, #0076bf);
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 900;
`;

const CancelButton = styled(PrimaryAction)`
    width: 100%;
    color: #a44842;
    background: #fff0ee;
`;

const HelpfulNote = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 9px;
    margin-top: 13px;
    padding: 13px 14px;
    border-radius: 16px;
    color: #59677a;
    background: rgba(255, 255, 255, 0.74);
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;

    svg {
        flex: 0 0 auto;
        color: #07805d;
    }
`;

const HistoryFilters = styled.div`
    display: flex;
    gap: 7px;
    overflow-x: auto;
`;

const HistoryFilterButton = styled.button<{ $active: boolean }>`
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid
        ${({ $active }) =>
            $active ? "rgba(0, 101, 170, 0.2)" : "rgba(36, 62, 85, 0.08)"};
    border-radius: 999px;
    color: ${({ $active }) => ($active ? "#005d9f" : "#566375")};
    background: ${({ $active }) => ($active ? "#e8f5ff" : "#ffffff")};
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 850;
    white-space: nowrap;
`;

const HistoryList = styled.div`
    display: grid;
    gap: 10px;
    margin-top: 14px;
`;

const HistoryCard = styled.button`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 18px;
    background: #ffffff;
    text-align: left;
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
    font-weight: 900;
`;

const HistoryCategory = styled.div`
    margin-top: 3px;
    overflow: hidden;
    color: #68758a;
    font-size: calc(11px * var(--app-font-scale));
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
    font-weight: 650;
`;

const LoadMoreButton = styled.button`
    width: 100%;
    min-height: 44px;
    margin-top: 12px;
    border: 1px solid #dce8f1;
    border-radius: 14px;
    color: #0068ad;
    background: #ffffff;
    font-weight: 900;
`;

const DialogBackdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 16px;
    background: rgba(9, 28, 45, 0.48);
`;

const DialogCard = styled.section`
    position: relative;
    width: min(100%, 398px);
    padding: 24px 20px 19px;
    border-radius: 25px;
    background: #ffffff;
    box-shadow: 0 28px 60px rgba(5, 31, 51, 0.24);
    text-align: center;
`;

const DialogClose = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #6d798a;
    background: #f2f5f7;
`;

const DialogIcon = styled.div`
    width: 62px;
    height: 62px;
    margin: 0 auto;
    display: grid;
    place-items: center;
    border-radius: 20px;
    color: #b54942;
    background: #fff0ee;
`;

const DialogTitle = styled.h2`
    margin: 16px 0 0;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
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

const DialogDanger = styled(DialogButton)`
    border: 0;
    color: #ffffff;
    background: linear-gradient(135deg, #a93f38, #ca554d);
`;
