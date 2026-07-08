import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import Thumb from "@assets/thumb.png";
import NewsFeatured from "@assets/news-featured.jpg";
import NewsElderly from "@assets/news-elderly.jpg";
import NewsMeeting from "@assets/news-meeting.jpg";
import AppHeader from "@components/layout/AppHeader";
import LHBD from "./static/LHBD.png";
import HYDTC from "./static/HYDTC.png";
import AppBottomNav from "@/components/layout/AppBottomNav";
const NUI_BA_DEN_EVENT_URL =
    "https://vneconomy.vn/tay-ninh-le-hoi-nui-ba-den-lan-dau-to-chuc-loat-trai-nghiem-van-hoa-quy-mo-lon.htm";
const YEN_DIEU_TRI_CUNG_URL =
    "https://thanhnien.vn/dai-le-hoi-yen-dieu-tri-cung-2025-o-toa-thanh-tay-ninh-ruc-ro-hoa-trai-dang-mau-185251004194851287.htm";
const TUAN_LE_DU_LICH =
    "https://vietnam.vnanet.vn/vietnamese/tin-van/tay-ninh-bung-no-suc-hut-du-lich-mua-le-hoi-thang-gieng-431374.html";
const NGAY_HOI_OCOP =
    "https://www.vietnam.vn/dac-san-tay-ninh-hut-khach-tai-hoi-cho-trien-lam-xuc-tien-thuong-mai-trai-cay";
const CHUONG_TRINH_VAN_NGHE =
    "https://chinhsachcuocsong.vnanet.vn/day-manh-chuyen-doi-so-nang-cao-hieu-qua-hoat-dong-bao-chi/88911.html";
const HOAT_DONG_CONG_DONG =
    "https://baovephapluat.vn/van-hoa-xa-hoi/doi-song-xa-hoi/tuoi-tre-vksnd-khu-vuc-4-tinh-tay-ninh-tham-gia-hien-mau-tinh-nguyen-200715.html";
type EventCategory = {
    id: string;
    label: string;
};

type LocalEvent = {
    id: string;
    title: string;
    categoryId: string;
    categoryLabel: string;
    description: string;
    image: string;
    date: string;
    time: string;
    location: string;
    status: "upcoming" | "today" | "done";
    link?: string;
};
const eventCategories: EventCategory[] = [
    {
        id: "",
        label: "Tất cả",
    },
    {
        id: "festival",
        label: "Lễ hội",
    },
    {
        id: "tourism",
        label: "Du lịch",
    },
    {
        id: "culture",
        label: "Văn hóa",
    },
    {
        id: "trade",
        label: "Xúc tiến thương mại",
    },
    {
        id: "community",
        label: "Cộng đồng",
    },
];

const events: LocalEvent[] = [
    {
        id: "le-hoi-nui-ba-den",
        title: "Lễ hội Núi Bà Đen",
        categoryId: "festival",
        categoryLabel: "Lễ hội",
        description:
            "Sự kiện văn hóa - du lịch tiêu biểu của Tây Ninh, thu hút đông đảo người dân và du khách tham quan, hành hương.",
        image: LHBD,
        date: "Tháng Giêng âm lịch",
        time: "Cả ngày",
        location: "Khu du lịch quốc gia Núi Bà Đen, Tây Ninh",
        status: "upcoming",
        link: NUI_BA_DEN_EVENT_URL,
    },
    {
        id: "hoi-yen-dieu-tri-cung",
        title: "Hội Yến Diêu Trì Cung",
        categoryId: "festival",
        categoryLabel: "Lễ hội",
        description:
            "Một trong những lễ hội văn hóa, tín ngưỡng đặc sắc tại Tòa Thánh Cao Đài Tây Ninh.",
        image: HYDTC,
        date: "Rằm tháng 8 âm lịch",
        time: "Cả ngày",
        location: "Tòa Thánh Cao Đài Tây Ninh",
        status: "upcoming",
        link: YEN_DIEU_TRI_CUNG_URL,
    },
    {
        id: "tuan-le-du-lich-tay-ninh",
        title: "Tuần lễ du lịch Tây Ninh",
        categoryId: "tourism",
        categoryLabel: "Du lịch",
        description:
            "Chuỗi hoạt động quảng bá điểm đến, sản phẩm du lịch, ẩm thực và văn hóa đặc trưng của Tây Ninh.",
        image: NewsElderly,
        date: "Đang cập nhật",
        time: "Đang cập nhật",
        location: "TP. Tây Ninh và các điểm du lịch trọng điểm",
        status: "upcoming",
        link: TUAN_LE_DU_LICH,
    },
    {
        id: "ngay-hoi-ocop-tay-ninh",
        title: "Ngày hội OCOP và sản phẩm đặc trưng Tây Ninh",
        categoryId: "trade",
        categoryLabel: "Xúc tiến thương mại",
        description:
            "Không gian trưng bày, giới thiệu sản phẩm OCOP, nông sản, đặc sản và sản phẩm tiêu biểu của địa phương.",
        image: Thumb,
        date: "Đang cập nhật",
        time: "08:00 - 21:00",
        location: "Trung tâm TP. Tây Ninh",
        status: "upcoming",
        link: NGAY_HOI_OCOP,
    },
    {
        id: "chuong-trinh-van-nghe-tay-ninh",
        title: "Chương trình văn nghệ phục vụ người dân",
        categoryId: "culture",
        categoryLabel: "Văn hóa",
        description:
            "Các hoạt động biểu diễn văn nghệ, giao lưu cộng đồng, tuyên truyền văn hóa và đời sống địa phương.",
        image: NewsMeeting,
        date: "Đang cập nhật",
        time: "19:00 - 21:00",
        location: "Quảng trường hoặc nhà văn hóa địa phương",
        status: "upcoming",
        link: CHUONG_TRINH_VAN_NGHE,
    },
    {
        id: "hoat-dong-cong-dong-tay-ninh",
        title: "Hoạt động cộng đồng tại Tây Ninh",
        categoryId: "community",
        categoryLabel: "Cộng đồng",
        description:
            "Các chương trình ra quân vệ sinh môi trường, tuyên truyền chuyển đổi số và hỗ trợ người dân sử dụng dịch vụ công.",
        image: NewsFeatured,
        date: "Hằng tháng",
        time: "07:30 - 10:30",
        location: "Các xã, phường trên địa bàn Tây Ninh",
        status: "upcoming",
        link: HOAT_DONG_CONG_DONG,
    },
];

const EventsPageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: radial-gradient(
            circle at 24px 126px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 238px, #f5f7fb 100%);
    color: #172033;
    padding: 162px 0 28px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const CategoryBar = styled.div`
    position: fixed;
    top: 96px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 11;
    width: min(100vw, 430px);
    height: 66px;
    background: rgba(255, 255, 255, 0.86);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 95, 168, 0.1);

    display: flex;
    flex-wrap: nowrap;
    gap: 10px;

    overflow-x: scroll;
    overflow-y: hidden;

    padding: 10px 12px 12px;

    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
    overscroll-behavior-x: contain;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const CategoryPill = styled.button<{ $active?: boolean }>`
    border: 0;
    border-radius: 16px;
    padding: 0 18px;

    flex: 0 0 auto;
    min-width: max-content;
    white-space: nowrap;

    color: ${({ $active }) => ($active ? "#ffffff" : "#4a5568")};
    background: ${({ $active }) =>
        $active
            ? "linear-gradient(135deg, #005b9f, #008bd2)"
            : "rgba(255, 255, 255, 0.92)"};

    box-shadow: ${({ $active }) =>
        $active
            ? "0 12px 24px rgba(0, 91, 159, 0.24)"
            : "0 8px 20px rgba(30, 35, 50, 0.08)"};

    font-size: calc(18px * var(--app-font-scale));
    font-weight: 850;
`;

const Content = styled.main`
    padding: 0 12px 98px;
`;

const FeaturedCard = styled.article`
    border-radius: 24px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 18px 36px rgba(30, 35, 50, 0.12);
`;

const FeaturedImage = styled.div<{ $image: string }>`
    height: 234px;
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
    height: 34px;
    border-radius: 999px;
    padding: 0 14px;
    background: rgba(230, 247, 255, 0.92);
    color: #00558f;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;
`;

const StatusChip = styled.span<{ $status: LocalEvent["status"] }>`
    display: inline-flex;
    align-items: center;
    height: 30px;
    border-radius: 999px;
    padding: 0 12px;
    color: ${({ $status }) => {
        if ($status === "today") return "#b45309";
        if ($status === "done") return "#64748b";

        return "#047857";
    }};
    background: ${({ $status }) => {
        if ($status === "today") return "#fff7ed";
        if ($status === "done") return "#f1f5f9";

        return "#ecfdf5";
    }};
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 850;
`;

const FeaturedTitle = styled.h2`
    margin: 14px 0 12px;
    font-size: calc(26px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 950;
    color: #172033;
`;

const Excerpt = styled.p`
    margin: 0;
    color: #707987;
    font-size: calc(19px * var(--app-font-scale));
    line-height: 1.45;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const EventInfoGrid = styled.div`
    display: grid;
    gap: 8px;
    margin-top: 16px;
`;

const EventInfo = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #4a5568;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 750;

    strong {
        color: #172033;
    }
`;

const EventList = styled.div`
    display: grid;
    gap: 14px;
    margin-top: 16px;
`;

const EventCard = styled.article`
    display: grid;
    grid-template-columns: 142px 1fr;
    gap: 14px;
    min-height: 168px;
    border-radius: 22px;
    background: #ffffff;
    padding: 14px;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
`;

const EventImage = styled.div<{ $image: string }>`
    border-radius: 17px;
    background: linear-gradient(
            180deg,
            rgba(23, 32, 51, 0.02),
            rgba(23, 32, 51, 0.08)
        ),
        url(${({ $image }) => $image}) center/cover;
`;

const EventBody = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const EventTitle = styled.h3`
    margin: 10px 0 8px;
    color: #172033;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.28;
    font-weight: 950;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const EventExcerpt = styled(Excerpt)`
    font-size: calc(16px * var(--app-font-scale));
`;

const Meta = styled.p`
    margin: 10px 0 0;
    color: #87909f;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 750;
`;

const StateBox = styled.div`
    min-height: 220px;
    border-radius: 24px;
    background: #ffffff;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
    display: grid;
    place-items: center;
    padding: 24px;
    text-align: center;
    color: #697386;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 750;
`;

const FloatingActions = styled.div`
    position: fixed;
    right: max(16px, calc((100vw - 430px) / 2 + 16px));
    bottom: 28px;
    z-index: 12;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const FloatingButton = styled.button`
    width: 58px;
    height: 58px;
    border: 0;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    box-shadow: 0 14px 26px rgba(0, 91, 159, 0.28);
`;

function getStatusText(status: LocalEvent["status"]) {
    if (status === "today") return "Diễn ra hôm nay";
    if (status === "done") return "Đã kết thúc";

    return "Sắp diễn ra";
}

const EventsPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    const filteredEvents = useMemo(() => {
        if (!selectedCategoryId) {
            return events;
        }

        return events.filter(event => event.categoryId === selectedCategoryId);
    }, [selectedCategoryId]);

    const featuredEvent = filteredEvents[0];
    const normalEvents = filteredEvents.slice(1);

    const scrollToTop = () => {
        const page = document.getElementById("events-page");

        page?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <EventsPageWrapper id="events-page">
            <AppHeader
                back
                title="Lịch sự kiện"
                description="Theo dõi các hoạt động, hội nghị và chương trình tại địa phương"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <CategoryBar>
                {eventCategories.map(category => (
                    <CategoryPill
                        key={category.id || category.label}
                        $active={selectedCategoryId === category.id}
                        onClick={event => {
                            setSelectedCategoryId(category.id);

                            event.currentTarget.scrollIntoView({
                                behavior: "smooth",
                                inline: "center",
                                block: "nearest",
                            });

                            document.getElementById("events-page")?.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                        type="button"
                    >
                        {category.label}
                    </CategoryPill>
                ))}
            </CategoryBar>

            <Content>
                {filteredEvents.length === 0 && (
                    <StateBox>Chưa có sự kiện nào.</StateBox>
                )}

                {featuredEvent && (
                    <>
                        <FeaturedCard>
                            <FeaturedImage $image={featuredEvent.image} />

                            <FeaturedBody>
                                <Chip>{featuredEvent.categoryLabel}</Chip>

                                <FeaturedTitle>
                                    {featuredEvent.title}
                                </FeaturedTitle>

                                <Excerpt>{featuredEvent.description}</Excerpt>

                                <EventInfoGrid>
                                    <EventInfo>
                                        <strong>Ngày:</strong>
                                        <span>{featuredEvent.date}</span>
                                    </EventInfo>

                                    <EventInfo>
                                        <strong>Thời gian:</strong>
                                        <span>{featuredEvent.time}</span>
                                    </EventInfo>

                                    <EventInfo>
                                        <strong>Địa điểm:</strong>
                                        <span>{featuredEvent.location}</span>
                                    </EventInfo>

                                    <StatusChip $status={featuredEvent.status}>
                                        {getStatusText(featuredEvent.status)}
                                    </StatusChip>
                                </EventInfoGrid>
                            </FeaturedBody>
                        </FeaturedCard>

                        <EventList>
                            {normalEvents.map(event => (
                                <EventCard key={event.id}>
                                    <EventImage $image={event.image} />

                                    <EventBody>
                                        <Chip>{event.categoryLabel}</Chip>

                                        <EventTitle>{event.title}</EventTitle>

                                        <EventExcerpt>
                                            {event.description}
                                        </EventExcerpt>

                                        <Meta>
                                            {event.date} · {event.time}
                                            <br />
                                            {event.location}
                                        </Meta>
                                    </EventBody>
                                </EventCard>
                            ))}
                        </EventList>
                    </>
                )}
            </Content>

            <FloatingActions>
                <FloatingButton
                    aria-label="Lên đầu trang"
                    onClick={scrollToTop}
                    type="button"
                >
                    <Icon icon="zi-arrow-up" size={28} />
                </FloatingButton>
            </FloatingActions>
            <AppBottomNav />
        </EventsPageWrapper>
    );
};

export default EventsPage;
