import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { CalendarDays } from "lucide-react";
import { Page, useNavigate, useSnackbar } from "zmp-ui";
import AppHeader from "@/components/layout/AppHeader";
import { useStore } from "@store";
import { CreateScheduleForm } from "./CreateScheduleForm";

type ScheduleTab = "create" | "history";

const formatScheduleDate = (date?: Date) =>
    date
        ? new Intl.DateTimeFormat("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
          }).format(date)
        : "-";

const getStatusLabel = (status?: string) => {
    if (status === "approved") {
        return "Đã xác nhận";
    }

    if (status === "rejected") {
        return "Đã từ chối";
    }

    return "Chờ xác nhận";
};

const CreateScheduleAppointmentPage: FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const openSnackbarRef = useRef(openSnackbar);
    const [activeTab, setActiveTab] = useState<ScheduleTab>("create");
    const [wasCreating, setWasCreating] = useState(false);
    const [
        schedule,
        gettingSchedule,
        creatingSchedule,
        getSchedule,
        getAccessToken,
        token,
    ] = useStore(state => [
            state.schedule,
            state.gettingSchedule,
            state.creatingSchedule,
            state.getSchedule,
            state.getAccessToken,
            state.token,
        ]);

    useEffect(() => {
        openSnackbarRef.current = openSnackbar;
    }, [openSnackbar]);

    useEffect(() => {
        if (token) {
            getSchedule();
            return;
        }

        getAccessToken()
            .then(() => {
                if (useStore.getState().token) {
                    getSchedule();
                }
            })
            .catch(error =>
                openSnackbarRef.current({
                    type: "error",
                    text:
                        error instanceof Error
                            ? error.message
                            : "Không thể xác thực tài khoản Zalo.",
                }),
            );
    }, [getAccessToken, getSchedule, token]);

    useEffect(() => {
        if (creatingSchedule) {
            setWasCreating(true);
            return;
        }

        if (wasCreating && schedule) {
            setActiveTab("history");
            setWasCreating(false);
            openSnackbarRef.current({
                type: "success",
                text: "Gửi yêu cầu hẹn thành công.",
            });
        }
    }, [creatingSchedule, schedule, wasCreating]);

    const historyDescription = useMemo(() => {
        if (gettingSchedule) {
            return "Đang tải yêu cầu hẹn...";
        }

        if (!schedule) {
            return "Chưa có yêu cầu hẹn nào.";
        }

        return `${formatScheduleDate(schedule.date)} · ${getStatusLabel(
            schedule.status,
        )}`;
    }, [gettingSchedule, schedule]);

    return (
        <StyledPage>
            <AppHeader
                back
                title="Hẹn làm việc"
                description="Phường Gò Dầu - Tỉnh Tây Ninh"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Tabs role="tablist" aria-label="Hẹn làm việc">
                <TabButton
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "create"}
                    $active={activeTab === "create"}
                    onClick={() => setActiveTab("create")}
                >
                    Hẹn làm việc
                </TabButton>
                <TabButton
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "history"}
                    $active={activeTab === "history"}
                    onClick={() => setActiveTab("history")}
                >
                    Lịch sử
                </TabButton>
            </Tabs>

            {activeTab === "create" ? (
                <CreateScheduleForm authReady={Boolean(token)} />
            ) : (
                <HistoryPanel>
                    <HistoryIcon>
                        <CalendarDays size={28} />
                    </HistoryIcon>
                    <HistoryTitle>Yêu cầu hẹn gần nhất</HistoryTitle>
                    <HistoryDescription>{historyDescription}</HistoryDescription>
                    {schedule && (
                        <HistoryCard>
                            <HistoryRow>
                                <span>Họ và tên</span>
                                <strong>{schedule.fullName}</strong>
                            </HistoryRow>
                            <HistoryRow>
                                <span>Số điện thoại</span>
                                <strong>{schedule.phoneNumber}</strong>
                            </HistoryRow>
                            <HistoryRow>
                                <span>Ngày hẹn</span>
                                <strong>{formatScheduleDate(schedule.date)}</strong>
                            </HistoryRow>
                            <HistoryRow>
                                <span>Trạng thái</span>
                                <StatusPill>{getStatusLabel(schedule.status)}</StatusPill>
                            </HistoryRow>
                            <HistoryContent>{schedule.content}</HistoryContent>
                        </HistoryCard>
                    )}
                    {!schedule && (
                        <GhostButton
                            type="button"
                            onClick={() => setActiveTab("create")}
                        >
                            Tạo yêu cầu hẹn mới
                        </GhostButton>
                    )}
                </HistoryPanel>
            )}
        </StyledPage>
    );
};

export default CreateScheduleAppointmentPage;

const StyledPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 120px;
    color: #172033;
    background: linear-gradient(180deg, #eef7ff 0, #f8fbff 260px, #f5f7fb 100%);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const Tabs = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    margin: 0 16px 14px;
    padding: 5px;
    border: 1px solid rgba(0, 104, 173, 0.12);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 12px 28px rgba(31, 58, 84, 0.1);
`;

const TabButton = styled.button<{ $active?: boolean }>`
    min-height: 50px;
    border: 0;
    border-radius: 14px;
    color: ${({ $active }) => ($active ? "#ffffff" : "#526071")};
    background: ${({ $active }) =>
        $active ? "linear-gradient(180deg, #0077c8 0%, #005f9f 100%)" : "transparent"};
    box-shadow: ${({ $active }) =>
        $active ? "0 8px 18px rgba(0, 104, 173, 0.24)" : "none"};
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 950;
`;

const HistoryPanel = styled.section`
    margin: 0 16px;
    padding: 26px 16px;
    border: 1px solid rgba(20, 62, 92, 0.08);
    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 14px 34px rgba(31, 58, 84, 0.08);
    text-align: center;
`;

const HistoryIcon = styled.div`
    width: 64px;
    height: 64px;
    margin: 0 auto 14px;
    display: grid;
    place-items: center;
    border-radius: 20px;
    color: #0068ad;
    background: #e8f5ff;
`;

const HistoryTitle = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 950;
`;

const HistoryDescription = styled.p`
    margin: 8px 0 0;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 700;
`;

const HistoryCard = styled.div`
    margin-top: 18px;
    padding: 14px;
    border-radius: 18px;
    background: #f7fbff;
    text-align: left;
`;

const HistoryRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 0;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 700;

    strong {
        color: #172033;
        text-align: right;
        font-weight: 900;
    }
`;

const StatusPill = styled.strong`
    padding: 6px 9px;
    border-radius: 999px;
    color: #087354;
    background: #e4f9f0;
`;

const HistoryContent = styled.div`
    margin-top: 10px;
    padding-top: 12px;
    border-top: 1px solid #e4edf5;
    color: #344054;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.5;
    white-space: pre-line;
`;

const GhostButton = styled.button`
    min-height: 44px;
    margin-top: 18px;
    padding: 0 18px;
    border: 1px solid #d0e8f8;
    border-radius: 999px;
    color: #0068ad;
    background: #f5fbff;
    font-weight: 900;
`;
