import AppHeader from "@components/layout/AppHeader";
import React, { FC } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";

const SYNC_ITEMS = [
    {
        icon: "zi-calendar",
        label: "Ngày đăng ký / đồng bộ lần đầu",
        value: "08:06 09/06/2026",
    },
    {
        icon: "zi-clock-1",
        label: "Lần đồng bộ gần nhất",
        value: "22:01 15/06/2026",
    },
    {
        icon: "zi-shield-solid",
        label: "Trạng thái xác minh",
        value: "Chưa xác minh",
    },
] as const;

const SyncPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 16px 32px;
    background: #fbfbfc;
    color: #172033;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const Content = styled.main`
    display: grid;
    gap: 18px;
`;

const StatusBanner = styled.section`
    min-height: 68px;
    border-radius: 22px;
    padding: 0 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #344054;
    background: #f4f4f8;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
`;

const SyncCard = styled.section`
    border: 1px solid #e7e9ee;
    border-radius: 22px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(18, 28, 45, 0.08);
`;

const SectionTitle = styled.h2`
    margin: 0;
    padding: 20px 18px 14px;
    color: #172033;
    font-size: calc(24px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: 950;
`;

const SyncRow = styled.div`
    min-height: 88px;
    padding: 18px;
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 14px;
    align-items: center;
    border-top: 1px solid #eef0f3;
`;

const SyncIcon = styled.span`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #667085;
    background: #f4f5f7;
`;

const SyncLabel = styled.div`
    color: #98a2b3;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 750;
`;

const SyncValue = styled.div`
    margin-top: 7px;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 850;
`;

const Note = styled.p`
    margin: 2px 18px 0;
    color: #98a2b3;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.45;
    text-align: center;
    font-weight: 650;
`;

const SyncHistoryPage: FC = () => {
    const navigate = useNavigate();

    return (
        <SyncPage id="sync-history-page">
            <AppHeader
                back
                title="Lịch sử đồng bộ"
                onBack={() => navigate("/profile", { direction: "backward" })}
            />

            <Content>
                <StatusBanner>
                    <Icon icon="zi-warning-circle" size={22} />
                    Trạng thái xác minh: Chưa xác minh
                </StatusBanner>

                <SyncCard>
                    <SectionTitle>Lịch sử đồng bộ Zalo</SectionTitle>
                    {SYNC_ITEMS.map(item => (
                        <SyncRow key={item.label}>
                            <SyncIcon>
                                <Icon icon={item.icon} size={24} />
                            </SyncIcon>
                            <div>
                                <SyncLabel>{item.label}</SyncLabel>
                                <SyncValue>{item.value}</SyncValue>
                            </div>
                        </SyncRow>
                    ))}
                </SyncCard>

                <Note>
                    Thông tin đồng bộ từ tài khoản Zalo của bạn. Mỗi lần đăng
                    nhập lại sẽ cập nhật thời gian đồng bộ.
                </Note>
            </Content>
        </SyncPage>
    );
};

export default SyncHistoryPage;
