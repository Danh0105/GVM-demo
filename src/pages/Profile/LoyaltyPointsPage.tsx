import AppHeader from "@components/layout/AppHeader";
import React, { FC } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";

const TOTAL_POINTS = 100;

const PointPage = styled(Page)`
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

const PointSummary = styled.section`
    min-height: 154px;
    border-radius: 24px;
    padding: 26px 22px;
    color: #ffffff;
    background: linear-gradient(135deg, #b90018 0%, #d90820 100%);
    box-shadow: 0 18px 34px rgba(185, 0, 24, 0.22);
`;

const PointLabel = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
    text-transform: uppercase;
`;

const PointValue = styled.div`
    margin-top: 20px;
    font-size: calc(64px * var(--app-font-scale));
    line-height: 0.82;
    font-weight: 950;
`;

const HistoryCard = styled.section`
    border: 1px solid #e7e9ee;
    border-radius: 22px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(18, 28, 45, 0.08);
`;

const SectionTitle = styled.h2`
    margin: 0;
    padding: 18px 18px 16px;
    color: #172033;
    font-size: calc(24px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: 950;
`;

const TransactionRow = styled.div`
    min-height: 78px;
    padding: 18px;
    display: grid;
    grid-template-columns: 52px 1fr auto;
    gap: 14px;
    align-items: center;
    border-top: 1px solid #eef0f3;
`;

const TransactionIcon = styled.span`
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #12b76a;
    background: #dcfae6;
`;

const TransactionName = styled.div`
    color: #172033;
    font-size: calc(19px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
`;

const TransactionDate = styled.div`
    margin-top: 5px;
    color: #98a2b3;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 700;
`;

const TransactionPoint = styled.div`
    color: #12a557;
    font-size: calc(22px * var(--app-font-scale));
    line-height: 1;
    font-weight: 950;
`;

const LoyaltyPointsPage: FC = () => {
    const navigate = useNavigate();

    return (
        <PointPage id="loyalty-points-page">
            <AppHeader
                back
                title="Điểm tích lũy"
                onBack={() => navigate("/profile", { direction: "backward" })}
            />

            <Content>
                <PointSummary>
                    <PointLabel>
                        <Icon icon="zi-star" size={26} />
                        Điểm tích lũy
                    </PointLabel>
                    <PointValue>{TOTAL_POINTS}</PointValue>
                </PointSummary>

                <HistoryCard>
                    <SectionTitle>Lịch sử giao dịch</SectionTitle>
                    <TransactionRow>
                        <TransactionIcon>
                            <Icon icon="zi-arrow-up" size={24} />
                        </TransactionIcon>
                        <div>
                            <TransactionName>Đăng ký tài khoản</TransactionName>
                            <TransactionDate>09/06/2026</TransactionDate>
                        </div>
                        <TransactionPoint>+{TOTAL_POINTS}</TransactionPoint>
                    </TransactionRow>
                </HistoryCard>
            </Content>
        </PointPage>
    );
};

export default LoyaltyPointsPage;
