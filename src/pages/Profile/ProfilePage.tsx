import AppHeader from "@components/layout/AppHeader";
import PageLayout from "@components/layout/PageLayout";
import Avatar from "@assets/avatar.png";
import React, { FC, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import { User } from "@dts";
import { useStore } from "@store";
import ProfileInfo from "./ProfileInfo";
import AppBottomNav from "@/components/layout/AppBottomNav";
import account from "@/assets/icons/user.png";
import privacy from "@/assets/icons/security.png";
import points from "@/assets/icons/medal.png";
import history from "@/assets/icons/history.png";
import call from "@/assets/icons/phone.png";

type MenuItem = {
    label: string;
    icon?: React.ComponentProps<typeof Icon>["icon"];
    image?: string;
    path?: string;
    action?: "logout";
    danger?: boolean;
    showChevron?: boolean;
};

const accountMenu: MenuItem[] = [
    {
        label: "Thông tin tài khoản",
        image: account,
        path: "/account-info",
    },
    {
        label: "Điểm tích lũy",
        image: points,
        path: "/loyalty-points",
    },
    {
        label: "Lịch sử đồng bộ",
        image: history,
        path: "/sync-history",
    },
    {
        label: "Chính sách bảo mật",
        image: privacy,
        path: "/privacy-policy",
    },
    {
        label: "Liên hệ chính quyền",
        image: call,
        path: "/government-contact",
    },
    {
        label: "Đăng xuất",
        icon: "zi-arrow-right",
        action: "logout",
        danger: true,
    },
];

const guestMenu: MenuItem[] = [
    {
        label: "Chính sách bảo mật",
        image: privacy,
        path: "/privacy-policy",
        showChevron: true,
    },
    {
        label: "Liên hệ chính quyền",
        image: call,
        path: "/government-contact",
    },
];

const ICON_SIZE = {
    header: 27,
    menu: 25,
    nav: 23,
    floating: 27,
} as const;

const AccountPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 104px;
    background: #fbfbfc;
    color: #172033;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const HeaderIcon = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.16);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
`;

const Content = styled.main`
    padding: 24px 16px 0;
`;

const PageTitle = styled.h2`
    margin: 0 2px 22px;
    color: #172033;
    font-size: calc(30px * var(--app-font-scale));
    line-height: 1.08;
    font-weight: 950;
`;

const ProfileCard = styled.button`
    width: 100%;
    min-height: 92px;
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 24px;
    padding: 16px 18px;
    display: grid;
    grid-template-columns: 66px 1fr 24px;
    gap: 14px;
    align-items: center;
    text-align: left;
    color: #172033;
    background: radial-gradient(
            circle at 86% 18%,
            rgba(0, 139, 210, 0.1),
            transparent 38%
        ),
        #ffffff;
    box-shadow: 0 16px 34px rgba(30, 35, 50, 0.11);
`;

const AvatarImage = styled.img`
    width: 58px;
    height: 58px;
    border-radius: 50%;
    object-fit: cover;
    box-shadow: 0 8px 18px rgba(0, 75, 134, 0.16);
`;

const ProfileName = styled.div`
    font-size: calc(22px * var(--app-font-scale));
    line-height: 1.1;
    font-weight: 950;
`;

const Points = styled.div`
    margin-top: 6px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #667085;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 650;

    .zaui-icon {
        color: #008bd2;
    }
`;

const GuestCard = styled.section`
    min-height: 124px;
    border: 1px solid #e7e9ee;
    border-radius: 22px;
    padding: 22px 18px;
    display: grid;
    grid-template-columns: 86px 1fr;
    gap: 8px;
    align-items: center;
    background: #ffffff;
    box-shadow: 0 6px 14px rgba(18, 28, 45, 0.08);
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

const GuestTitle = styled.h3`
    margin: 0;
    color: #1f2937;
    font-size: calc(23px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: 900;
`;

const GuestDescription = styled.p`
    margin: 6px 0 13px;
    color: #9aa1ad;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 650;
`;

const LoginButton = styled.button`
    min-height: 40px;
    border: 0;
    border-radius: 999px;
    padding: 0 18px;
    color: #ffffff;
    background: linear-gradient(135deg, #e50920, #f22433);
    box-shadow: 0 4px 10px rgba(229, 9, 32, 0.22);
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.1;
    font-weight: 900;

    &:disabled {
        opacity: 0.72;
    }
`;

const MenuList = styled.div`
    display: grid;
    gap: 14px;
    margin-top: 16px;
`;

const MenuButton = styled.button<{ $danger?: boolean }>`
    width: 100%;
    min-height: 76px;
    border: 1px solid
        ${({ $danger }) =>
            $danger ? "rgba(180, 35, 24, 0.12)" : "rgba(0, 95, 168, 0.08)"};
    border-radius: 22px;
    padding: 13px 17px;
    display: grid;
    grid-template-columns: 52px 1fr 22px;
    gap: 14px;
    align-items: center;
    text-align: left;
    color: ${({ $danger }) => ($danger ? "#b42318" : "#172033")};
    background: ${({ $danger }) => ($danger ? "#fff2f0" : "#ffffff")};
    box-shadow: 0 14px 30px rgba(30, 35, 50, 0.09);

    &:active {
        transform: scale(0.985);
    }
`;

const MenuIcon = styled.span<{ $danger?: boolean }>`
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${({ $danger }) => ($danger ? "#d92d20" : "#0063a7")};
    background: ${({ $danger }) =>
        $danger ? "rgba(255, 218, 214, 0.82)" : "rgba(230, 247, 255, 0.94)"};
`;

const MenuIconImage = styled.img`
    width: 30px;
    height: 30px;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 4px 7px rgba(0, 86, 153, 0.16));
`;

const GuestMenuIcon = styled(MenuIcon)`
    color: #7f8793;
    background: #f5f6f8;
`;

const MenuLabel = styled.span`
    min-width: 0;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 900;
`;

const Chevron = styled.span`
    display: grid;
    place-items: center;
    color: #98a2b3;
`;

interface AccountMenuPageProps {
    user?: User;
    loadingUserInfo?: boolean;
    onLogin: () => void;
    onLogout: () => void;
}

const AccountMenuPage: FC<AccountMenuPageProps> = ({
    user,
    loadingUserInfo,
    onLogin,
    onLogout,
}) => {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(user);
    const menuItems = isLoggedIn ? accountMenu : guestMenu;

    const handleMenuClick = (item: MenuItem) => {
        if (item.action === "logout") {
            onLogout();
            return;
        }

        if (item.path) {
            navigate(item.path);
        }
    };

    const renderMenuIcon = (item: MenuItem) => {
        if (item.image) {
            return <MenuIconImage src={item.image} alt="" />;
        }

        if (item.icon) {
            return <Icon icon={item.icon} size={ICON_SIZE.menu} />;
        }

        return null;
    };

    const getShouldShowChevron = (item: MenuItem) => {
        if (isLoggedIn) {
            return !item.danger;
        }

        return Boolean(item.showChevron || item.icon === "zi-call");
    };

    return (
        <AccountPage id="profile-page">
            <AppHeader
                title="Tài khoản"
                leftSlot={
                    <HeaderIcon>
                        <Icon icon="zi-user" size={ICON_SIZE.header} />
                    </HeaderIcon>
                }
            />

            <Content>
                <PageTitle>Menu tài khoản</PageTitle>

                {isLoggedIn ? (
                    <ProfileCard
                        type="button"
                        onClick={() => navigate("/account-info")}
                    >
                        <AvatarImage
                            src={user?.avatar || Avatar}
                            alt="Ảnh đại diện"
                        />

                        <div>
                            <ProfileName>
                                {user?.name || "Người dùng"}
                            </ProfileName>

                            <Points>
                                <Icon icon="zi-star" size={18} />
                                100 điểm
                            </Points>
                        </div>

                        <Chevron>
                            <Icon icon="zi-chevron-right" size={24} />
                        </Chevron>
                    </ProfileCard>
                ) : (
                    <GuestCard>
                        <GuestAvatar>
                            <Icon icon="zi-user" size={34} />
                        </GuestAvatar>

                        <div>
                            <GuestTitle>Xin chào, Khách!</GuestTitle>

                            <GuestDescription>
                                Đăng ký để trải nghiệm đầy đủ
                            </GuestDescription>

                            <LoginButton
                                disabled={loadingUserInfo}
                                onClick={onLogin}
                                type="button"
                            >
                                {loadingUserInfo
                                    ? "Đang đăng nhập..."
                                    : "Đăng nhập/Đăng ký"}
                            </LoginButton>
                        </div>
                    </GuestCard>
                )}

                <MenuList>
                    {menuItems.map(item => {
                        const shouldShowChevron = getShouldShowChevron(item);
                        const IconWrapper = isLoggedIn
                            ? MenuIcon
                            : GuestMenuIcon;

                        return (
                            <MenuButton
                                key={item.label}
                                type="button"
                                $danger={item.danger}
                                onClick={() => handleMenuClick(item)}
                            >
                                <IconWrapper $danger={item.danger}>
                                    {renderMenuIcon(item)}
                                </IconWrapper>

                                <MenuLabel>{item.label}</MenuLabel>

                                {shouldShowChevron && (
                                    <Chevron>
                                        <Icon
                                            icon="zi-chevron-right"
                                            size={24}
                                        />
                                    </Chevron>
                                )}
                            </MenuButton>
                        );
                    })}
                </MenuList>
            </Content>

            <AppBottomNav />
        </AccountPage>
    );
};

const ProfilePage: FC = () => {
    const { profile, getProfile, user, loadingUserInfo, getUserInfo, logout } =
        useStore();

    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    useEffect(() => {
        if (id) {
            getProfile({ id });
        }
    }, [getProfile, id]);

    if (!id) {
        return (
            <AccountMenuPage
                user={user}
                loadingUserInfo={loadingUserInfo}
                onLogin={getUserInfo}
                onLogout={logout}
            />
        );
    }

    return (
        <PageLayout bg="white" title="Chi tiết hồ sơ">
            {profile && <ProfileInfo profile={profile} />}
        </PageLayout>
    );
};

export default ProfilePage;
