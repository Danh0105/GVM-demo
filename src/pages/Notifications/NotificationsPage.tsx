import AppHeader from "@components/layout/AppHeader";
import React from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";

import NewsElderly from "@assets/news-elderly.jpg";
import NewsFeatured from "@assets/news-featured.jpg";
import NewsMeeting from "@assets/news-meeting.jpg";
import Thumb from "@assets/thumb.png";

type NotificationItem = {
    id: number;
    category: string;
    title: string;
    description?: string;
    date: string;
    image: string;
};

type NavItem = {
    label: string;
    icon: React.ComponentProps<typeof Icon>["icon"];
    path: string;
    active?: boolean;
};

const latestNotification: NotificationItem = {
    id: 1,
    category: "Thông báo",
    title: "Lịch tiếp công dân và giải quyết thủ tục tháng tới",
    date: "2026-05-09",
    image: NewsFeatured,
};

const notifications: NotificationItem[] = [
    {
        id: 2,
        category: "Chuyển đổi số",
        title: "Thúc đẩy chi trả an sinh xã hội không dùng tiền mặt",
        description:
            "Các đơn vị tiếp tục hỗ trợ người dân cập nhật thông tin, mở tài khoản và nhận chi trả qua phương thức điện tử.",
        date: "2026-05-29",
        image: NewsFeatured,
    },
    {
        id: 3,
        category: "Văn hóa - Xã hội",
        title: "Triển khai tháng hành động vì trẻ em trên địa bàn xã",
        description:
            "Nhiều hoạt động tuyên truyền, chăm sóc và hỗ trợ trẻ em được tổ chức tại các thôn, ấp.",
        date: "2026-05-26",
        image: NewsElderly,
    },
    {
        id: 4,
        category: "Hành chính công",
        title: "Cập nhật thời gian tiếp nhận hồ sơ trực tuyến",
        description:
            "Bộ phận một cửa khuyến khích người dân đặt lịch và nộp hồ sơ qua cổng dịch vụ công.",
        date: "2026-05-24",
        image: NewsMeeting,
    },
    {
        id: 5,
        category: "Tiện ích số",
        title: "Hướng dẫn sử dụng tài khoản định danh điện tử",
        description:
            "Người dân có thể tra cứu, xác thực và thực hiện nhiều thủ tục ngay trên thiết bị di động.",
        date: "2026-05-21",
        image: Thumb,
    },
];

const navItems: NavItem[] = [
    { label: "Trang chủ", icon: "zi-home", path: "/" },
    { label: "Tin tức", icon: "zi-note", path: "/news" },
    { label: "Cộng đồng", icon: "zi-chat", path: "/feedbacks" },
    {
        label: "Thông báo",
        icon: "zi-notif",
        path: "/notifications",
        active: true,
    },
    { label: "Tài khoản", icon: "zi-user", path: "/profile" },
];

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 116px 0 108px;

    color: #172033;
    background: radial-gradient(
            circle at 24px 132px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 260px, #f5f7fb 100%);

    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const HeaderButton = styled.button`
    width: 42px;
    height: 42px;
    flex: 0 0 auto;

    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 15px;

    display: grid;
    place-items: center;

    color: #ffffff;
    background: rgba(255, 255, 255, 0.14);
    box-shadow: 0 8px 18px rgba(0, 50, 95, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);

    &:active {
        transform: scale(0.94);
        background: rgba(255, 255, 255, 0.24);
    }
`;

const HeaderActions = styled.div`
    display: flex;
    gap: 7px;
`;

const SegmentedActions = styled.div`
    width: 88px;
    height: 42px;
    flex: 0 0 auto;

    display: grid;
    grid-template-columns: 1fr 1fr;

    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;

    color: #ffffff;
    background: rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 18px rgba(0, 50, 95, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(8px);
`;

const SegmentButton = styled.button`
    border: 0;
    display: grid;
    place-items: center;
    color: inherit;
    background: transparent;

    & + & {
        border-left: 1px solid rgba(0, 50, 95, 0.18);
    }

    &:active {
        background: rgba(255, 255, 255, 0.18);
    }

    span {
        width: 5px;
        height: 5px;
        border-radius: 999px;
        background: currentColor;
        box-shadow: -10px 0 0 currentColor, 10px 0 0 currentColor;
    }
`;

const Content = styled.main`
    padding: 0 16px;
`;

const Section = styled.section`
    & + & {
        margin-top: 34px;
    }
`;

const SectionTitle = styled.h2`
    margin: 0 0 18px;
    color: #172033;
    font-size: calc(30px * var(--app-font-scale));
    line-height: 1.08;
    font-weight: 950;
`;

const FeaturedCard = styled.article`
    width: min(100%, 320px);
    border-radius: 24px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 18px 36px rgba(30, 35, 50, 0.12);
`;

const FeaturedImage = styled.div<{ $image: string }>`
    height: 182px;
    background: linear-gradient(
            180deg,
            rgba(23, 32, 51, 0.02),
            rgba(23, 32, 51, 0.08)
        ),
        url(${({ $image }) => $image}) center/cover;
`;

const FeaturedBody = styled.div`
    padding: 20px 18px 22px;
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    min-height: 32px;
    border-radius: 999px;
    padding: 5px 13px;

    color: #00558f;
    background: rgba(230, 247, 255, 0.96);

    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.1;
    font-weight: 850;
`;

const FeaturedTitle = styled.h3`
    margin: 14px 0 16px;
    color: #172033;
    font-size: calc(23px * var(--app-font-scale));
    line-height: 1.28;
    font-weight: 950;
`;

const DateText = styled.p`
    margin: 0;
    color: #87909f;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 750;
`;

const NotificationList = styled.div`
    display: grid;
    gap: 16px;
`;

const NotificationCard = styled.article`
    min-height: 154px;
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 24px;
    padding: 14px;

    display: grid;
    grid-template-columns: 130px 1fr;
    gap: 14px;
    align-items: stretch;

    background: #ffffff;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
`;

const NotificationImage = styled.div<{ $image: string }>`
    min-height: 126px;
    border-radius: 18px;
    background: linear-gradient(
            180deg,
            rgba(23, 32, 51, 0.02),
            rgba(23, 32, 51, 0.08)
        ),
        url(${({ $image }) => $image}) center/cover;
`;

const NotificationBody = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const NotificationTitle = styled.h3`
    margin: 10px 0 8px;
    color: #172033;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.26;
    font-weight: 950;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const Description = styled.p`
    margin: 0 0 9px;
    color: #707987;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.36;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const FloatingButton = styled.button`
    position: fixed;
    right: max(18px, calc((100vw - 430px) / 2 + 18px));
    bottom: calc(92px + var(--zaui-safe-area-inset-bottom, 0px));
    z-index: 21;

    width: 60px;
    height: 60px;
    border: 0;
    border-radius: 999px;

    display: grid;
    place-items: center;

    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    box-shadow: 0 14px 26px rgba(0, 91, 159, 0.28);

    .zaui-icon {
        transform: rotate(45deg);
    }
`;

const BottomNav = styled.nav`
    position: fixed;
    inset: auto auto 0 50%;
    transform: translateX(-50%);
    z-index: 20;

    width: min(100vw, 430px);
    height: calc(76px + var(--zaui-safe-area-inset-bottom, 0px));
    padding-bottom: var(--zaui-safe-area-inset-bottom, 0px);

    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    background: rgba(255, 255, 255, 0.97);
    border-top: 1px solid rgba(0, 83, 145, 0.08);
    box-shadow: 0 -8px 24px rgba(30, 35, 50, 0.08);
    backdrop-filter: blur(18px);
`;

const NavButton = styled.button<{ $active?: boolean }>`
    border: 0;
    border-radius: ${({ $active }) => ($active ? "18px" : "0")};
    margin: ${({ $active }) => ($active ? "8px 4px" : "0")};

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;

    color: ${({ $active }) => ($active ? "#0063a7" : "#98a2b3")};
    background: ${({ $active }) =>
        $active ? "rgba(0, 99, 167, 0.1)" : "transparent"};

    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: ${({ $active }) => ($active ? 800 : 550)};

    &:active {
        transform: scale(0.94);
    }
`;

const NotificationsPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const scrollToTop = () => {
        const page = document.getElementById("notifications-page");

        page?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <PageWrapper id="notifications-page">
            <AppHeader
                title="Thông báo"
                leftSlot={
                    <>
                        <HeaderButton
                            aria-label="Quay lại"
                            onClick={() =>
                                navigate("/", { direction: "backward" })
                            }
                            type="button"
                        >
                            <Icon icon="zi-arrow-left" size={28} />
                        </HeaderButton>

                        <HeaderButton aria-label="Thông báo" type="button">
                            <Icon icon="zi-notif" size={27} />
                        </HeaderButton>
                    </>
                }
                rightSlot={
                    <HeaderActions>
                        <HeaderButton
                            aria-label="Tìm kiếm"
                            onClick={() => navigate("/search")}
                            type="button"
                        >
                            <Icon icon="zi-search" size={27} />
                        </HeaderButton>

                        <SegmentedActions>
                            <SegmentButton
                                aria-label="Tùy chọn"
                                type="button"
                            >
                                <span />
                            </SegmentButton>

                            <SegmentButton
                                aria-label="Đóng"
                                onClick={() =>
                                    navigate("/", { direction: "backward" })
                                }
                                type="button"
                            >
                                <Icon icon="zi-close" size={24} />
                            </SegmentButton>
                        </SegmentedActions>
                    </HeaderActions>
                }
            />
            <Content>
                <Section>
                    <SectionTitle>Thông báo mới</SectionTitle>

                    <FeaturedCard>
                        <FeaturedImage $image={latestNotification.image} />

                        <FeaturedBody>
                            <Chip>{latestNotification.category}</Chip>
                            <FeaturedTitle>
                                {latestNotification.title}
                            </FeaturedTitle>
                            <DateText>{latestNotification.date}</DateText>
                        </FeaturedBody>
                    </FeaturedCard>
                </Section>

                <Section>
                    <SectionTitle>Tất cả thông báo</SectionTitle>

                    <NotificationList>
                        {notifications.map(item => (
                            <NotificationCard key={item.id}>
                                <NotificationImage $image={item.image} />

                                <NotificationBody>
                                    <Chip>{item.category}</Chip>
                                    <NotificationTitle>
                                        {item.title}
                                    </NotificationTitle>
                                    {item.description && (
                                        <Description>
                                            {item.description}
                                        </Description>
                                    )}
                                    <DateText>{item.date}</DateText>
                                </NotificationBody>
                            </NotificationCard>
                        ))}
                    </NotificationList>
                </Section>
            </Content>

            <FloatingButton
                aria-label="Lên đầu trang"
                onClick={scrollToTop}
                type="button"
            >
                <Icon icon="zi-arrow-up" size={28} />
            </FloatingButton>

            <BottomNav>
                {navItems.map(item => (
                    <NavButton
                        key={item.label}
                        $active={item.active}
                        onClick={() => navigate(item.path)}
                        type="button"
                    >
                        <Icon icon={item.icon} size={23} />
                        <span>{item.label}</span>
                    </NavButton>
                ))}
            </BottomNav>
        </PageWrapper>
    );
};

export default NotificationsPage;
