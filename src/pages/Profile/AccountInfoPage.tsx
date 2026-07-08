import AppHeader from "@components/layout/AppHeader";
import Avatar from "@assets/avatar.png";
import React, { FC } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import { useStore } from "@store";

const AccountPage = styled(Page)`
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
    gap: 16px;
`;

const SummaryCard = styled.section`
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 24px;
    padding: 20px;
    display: grid;
    gap: 18px;
    background: radial-gradient(
            circle at 86% 12%,
            rgba(0, 139, 210, 0.1),
            transparent 38%
        ),
        #ffffff;
    box-shadow: 0 16px 34px rgba(30, 35, 50, 0.1);
`;

const ProfileBlock = styled.div`
    display: grid;
    grid-template-columns: 68px 1fr;
    gap: 14px;
    align-items: center;
`;

const AvatarImage = styled.img`
    width: 68px;
    height: 68px;
    border-radius: 50%;
    object-fit: cover;
    background: #f0f1f5;
    box-shadow: 0 8px 18px rgba(0, 75, 134, 0.16);
`;

const GuestAvatar = styled.div`
    width: 68px;
    height: 68px;
    display: grid;
    place-items: center;
    border-radius: 999px;
    color: #98a2b3;
    background: #f0f1f5;
`;

const Name = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(24px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: 950;
`;

const Description = styled.p`
    margin: 6px 0 0;
    color: #667085;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 650;
`;

const StatusPill = styled.span<{ $active?: boolean }>`
    width: fit-content;
    min-height: 30px;
    border-radius: 999px;
    padding: 0 12px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: ${({ $active }) => ($active ? "#027a48" : "#b42318")};
    background: ${({ $active }) => ($active ? "#ecfdf3" : "#fff2f0")};
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.1;
    font-weight: 850;
`;

const Section = styled.section`
    border: 1px solid #e7e9ee;
    border-radius: 22px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(18, 28, 45, 0.07);
`;

const SectionTitle = styled.h3`
    margin: 0;
    padding: 16px 18px 8px;
    color: #172033;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
`;

const InfoRow = styled.div`
    min-height: 64px;
    padding: 12px 18px;
    display: grid;
    grid-template-columns: minmax(110px, 0.9fr) minmax(0, 1.1fr);
    gap: 12px;
    align-items: center;
    border-top: 1px solid #eef0f3;
`;

const Label = styled.span`
    color: #667085;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 750;
`;

const Value = styled.span`
    min-width: 0;
    color: #172033;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 850;
    text-align: right;
    overflow-wrap: anywhere;
`;

const LoginButton = styled.button`
    width: 100%;
    min-height: 46px;
    border: 0;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #ffffff;
    background: linear-gradient(135deg, #e50920, #f22433);
    box-shadow: 0 10px 18px rgba(229, 9, 32, 0.22);
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.1;
    font-weight: 900;

    &:disabled {
        opacity: 0.72;
    }
`;

type InfoItem = {
    label: string;
    value?: string;
    fallback: string;
};

const AccountInfoPage: FC = () => {
    const navigate = useNavigate();
    const { user, loadingUserInfo, getUserInfo } = useStore();
    const isLoggedIn = Boolean(user);

    const accountInfo: InfoItem[] = [
        {
            label: "Họ và tên",
            value: user?.name,
            fallback: "Chưa cập nhật",
        },
        {
            label: "Mã người dùng",
            value: user?.id,
            fallback: "Chưa cập nhật",
        },
        {
            label: "ID OA",
            value: user?.idByOA,
            fallback: "Chưa liên kết",
        },
    ];

    return (
        <AccountPage id="account-info-page">
            <AppHeader
                back
                title="Thông tin tài khoản"
                description="Quản lý thông tin cá nhân"
                onBack={() => navigate("/profile", { direction: "backward" })}
            />

            <Content>
                <SummaryCard>
                    <ProfileBlock>
                        {isLoggedIn ? (
                            <AvatarImage
                                src={user?.avatar || Avatar}
                                alt="Ảnh đại diện"
                            />
                        ) : (
                            <GuestAvatar>
                                <Icon icon="zi-user" size={34} />
                            </GuestAvatar>
                        )}

                        <div>
                            <Name>
                                {isLoggedIn
                                    ? user?.name || "Người dùng"
                                    : "Bạn chưa đăng nhập"}
                            </Name>
                            <Description>
                                {isLoggedIn
                                    ? "Thông tin được đồng bộ từ tài khoản Zalo."
                                    : "Đăng nhập/Đăng ký để xem và đồng bộ thông tin tài khoản."}
                            </Description>
                        </div>
                    </ProfileBlock>

                    <StatusPill $active={isLoggedIn}>
                        <Icon
                            icon={
                                isLoggedIn
                                    ? "zi-check-circle"
                                    : "zi-info-circle"
                            }
                            size={16}
                        />
                        {isLoggedIn ? "Đã đăng nhập" : "Chưa đăng nhập"}
                    </StatusPill>

                    {!isLoggedIn && (
                        <LoginButton
                            disabled={loadingUserInfo}
                            onClick={getUserInfo}
                            type="button"
                        >
                            <Icon icon="zi-user" size={20} />
                            {loadingUserInfo
                                ? "Đang đăng nhập..."
                                : "Đăng nhập/Đăng ký"}
                        </LoginButton>
                    )}
                </SummaryCard>

                <Section>
                    <SectionTitle>Chi tiết tài khoản</SectionTitle>
                    {accountInfo.map(item => (
                        <InfoRow key={item.label}>
                            <Label>{item.label}</Label>
                            <Value>{item.value || item.fallback}</Value>
                        </InfoRow>
                    ))}
                </Section>
            </Content>
        </AccountPage>
    );
};

export default AccountInfoPage;
