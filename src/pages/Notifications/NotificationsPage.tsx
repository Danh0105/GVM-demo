import AppHeader from "@components/layout/AppHeader";
import AppBottomNav from "@/components/layout/AppBottomNav";
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
                back
                title="Thông báo"
                description="Cập nhật thông tin và hoạt động mới nhất tại địa phương"
                onBack={() => navigate("/", { direction: "backward" })}
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

            <AppBottomNav activeKey="notifications" />
        </PageWrapper>
    );
};

export default NotificationsPage;
