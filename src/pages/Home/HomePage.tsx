import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import Background from "@assets/background.png";
import HeaderBackground from "@assets/header-background.png";
import ReactMarkdown from "react-markdown";
import { openWebView } from "@/services/zalo";
import {
    askChatbotStream,
    ChatbotMetadata,
    ChatbotSource,
} from "@/services/chatbot";
import TOUR_TAY_NINH from "@/assets/tnbd.png";
import QK from "@/assets/QK.png";
import WC from "@/assets/WC.png";
import KHXH from "@/assets/ktxh.png";
import AppBottomNav from "@/components/layout/AppBottomNav";
import NEWS from "@/assets/icons/documents.png";
import DOCUMENTS from "@/assets/icons/grammar.png";
import GOVERNMENT from "@/assets/icons/customers.png";
import FEEDBACK from "@/assets/icons/customer-service.png";
import OCOP from "@/assets/icons/star.png";
import JOBS from "@/assets/icons/recruitment.png";
import INDUSTRIAL from "@/assets/icons/manufacture.png";
import BUISSENESS from "@/assets/icons/management.png";
import TRAFFIC from "@/assets/icons/recruitment.png";
import TELEVISION from "@/assets/icons/television.png";
import destinations from "@/assets/icons/luggage.png";
import restaurants from "@/assets/icons/restaurant.png";
import hotels from "@/assets/icons/hotel.png";
import transport from "@/assets/icons/moving.png";
import REMOTE_QUEUE from "@/assets/icons/remote-queue.png";
import PARTY_MEMBER_HANDBOOK from "@/assets/icons/party-member-handbook.png";
import PARTY_DUES from "@/assets/icons/party-dues.png";
import DIGITAL_LITERACY from "@/assets/icons/digital-literacy.png";
import MEETING_ROOM from "@/assets/icons/meeting-room.png";
import APPOINTMENT_SCHEDULE from "@/assets/icons/appointment-schedule.svg";
import SATISFACTION_RATING from "@/assets/icons/satisfaction-rating.svg";
import { useStore } from "@store";
import { getSystemRole, SYSTEM_ROLES } from "@/utils/permissions";

const TOUR_TAY_NINH_URL =
    "https://www.ivivu.com/du-lich/tour-tay-ninh-1n-vieng-nui-ba-chinh-phuc-cap-treo-van-son-toa-thanh-tay-ninh/2289";
const BAU_CU_QH_XVI_URL =
    "https://thuvienphapluat.vn/phap-luat/huong-dan-tuyen-truyen-bau-cu-dai-bieu-quoc-hoi-khoa-xvi-va-bau-cu-dai-bieu-hoi-dong-nhan-dan-cac-c-33890-240434.html";
const KE_HOACH_KTXH_2027_URL =
    "https://baochinhphu.vn/thu-tuong-chinh-phu-chi-thi-xay-dung-ke-hoach-phat-trien-ktxh-va-du-toan-ngan-sach-nha-nuoc-nam-2027-102260613163355849.htm";
const PHONG_CHONG_MA_TUY_2026_URL =
    "https://moit.gov.vn/tin-tuc/bo-cong-thuong-ban-hanh-ke-hoach-trien-khai-thang-hanh-dong-phong-chong-ma-tuy-nam-2026.html";
const NHIEM_VU_VP_HDND_UBND_CAP_XA_URL =
    "https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/chinh-sach-moi/89367/tong-hop-nhiem-vu-cua-van-phong-hdnd-va-ubnd-cap-xa-tu-01-7-2025";
const SO_TAY_DANG_VIEN_URL = "https://sotaydangvien.dcs.vn/auth/login";
const THU_NOP_DANG_PHI_URL =
    "https://dichvucong.dcs.vn/web/home?typeInapp=1&zarsrc=260&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo";
const BINH_DAN_HOC_VU_URL = "https://www.binhdanhocvuso.gov.vn/?typeInapp=1";

type FeatureItem = {
    label: string;
    icon?: React.ComponentProps<typeof Icon>["icon"];
    image?: string;
    path?: string;
    url?: string;
    roles?: string[];
};

type Section = {
    title: string;
    more?: string;
    items: FeatureItem[];
};

type NavItem = FeatureItem & {
    active?: boolean;
    path?: string;
};

type ChatMessage = {
    id: string;
    role: "assistant" | "user";
    content: string;
    status?: "pending" | "streaming" | "completed" | "error" | "stopped";
    source?: ChatbotSource | null;
    cached?: boolean | null;
    knowledgeId?: string | null;
    model?: string | null;
    errorMessage?: string;
    question?: string;
};

const featureSections: Section[] = [
    {
        title: "Hành chính công",
        more: "Xem thêm",
        items: [
            { label: "Tin tức", image: NEWS, path: "/news" },
            { label: "Văn bản", image: DOCUMENTS, path: "/legal-documents" },
            {
                label: "Dịch vụ công",
                image: GOVERNMENT,
                path: "/public-services",
            },
            {
                label: "Lấy số từ xa",
                image: REMOTE_QUEUE,
                path: "/remote-queue",
            },
            {
                label: "Đặt lịch hẹn",
                image: APPOINTMENT_SCHEDULE,
                path: "/create-schedule-appointment",
            },
            {
                label: "Đánh giá hài lòng",
                image: SATISFACTION_RATING,
                path: "/satisfaction-rating",
            },
            {
                label: "Phản ánh người dân",
                image: FEEDBACK,
                path: "/feedbacks",
            },
            {
                label: "Cuộc họp",
                image: MEETING_ROOM,
                path: "/meeting-rooms",
                roles: [
                    SYSTEM_ROLES.USER,
                    SYSTEM_ROLES.WARD_CHAIRMAN,
                    SYSTEM_ROLES.NEIGHBORHOOD_HEAD,
                ],
            },
            {
                label: "Giao việc",
                image: BUISSENESS,
                path: "/task-assignments",
                roles: [SYSTEM_ROLES.WARD_CHAIRMAN],
            },
            {
                label: "Nhận việc",
                image: DOCUMENTS,
                path: "/received-tasks",
                roles: [SYSTEM_ROLES.NEIGHBORHOOD_HEAD],
            },
            {
                label: "Quản lý người dùng",
                image: BUISSENESS,
                path: "/users",
                roles: [SYSTEM_ROLES.ADMIN],
            },
            {
                label: "Sổ tay đảng viên",
                image: PARTY_MEMBER_HANDBOOK,
                url: SO_TAY_DANG_VIEN_URL,
            },
            {
                label: "Thu nộp đảng phí",
                image: PARTY_DUES,
                url: THU_NOP_DANG_PHI_URL,
            },
            {
                label: "Bình dân học vụ",
                image: DIGITAL_LITERACY,
                url: BINH_DAN_HOC_VU_URL,
            },
        ],
    },
    {
        title: "Kinh tế số",
        more: "Xem thêm",
        items: [
            { label: "OCOP", image: OCOP, path: "/ocop" },
            {
                label: "Thông tin tuyển dụng",
                image: JOBS,
                path: "/jobs",
            },
            {
                label: "Khu công nghiệp",
                image: INDUSTRIAL,
                path: "/industrial-zones",
            },
            {
                label: "Doanh nghiệp",
                image: BUISSENESS,
                path: "/businesses",
            },
        ],
    },
    {
        title: "Thông tin số",
        more: "Xem thêm",
        items: [
            {
                label: "Tra phạt nguội",
                image: TRAFFIC,
                path: "/traffic-fines",
            },
            {
                label: "Truyền hình",
                image: TELEVISION,
                path: "/television",
            },
        ],
    },
    {
        title: "Du lịch số",
        more: "Xem thêm",
        items: [
            {
                label: "Du lịch",
                image: destinations,
                path: "/destinations",
            },
            {
                label: "Nhà hàng",
                image: restaurants,
                path: "/restaurants",
            },
            {
                label: "Khách sạn",
                image: hotels,
                path: "/hotels",
            },
            {
                label: "Di chuyển",
                image: transport,
                path: "/transport",
            },
        ],
    },
];

/* const galleryItems = [
                                    Hỏi đáp thủ tục hành chính
    { title: "Ẩm thực địa phương", count: "9 ảnh", image: Thumb },
    { title: "Sản vật quê hương", count: "8 ảnh", image: SocialInsurance },
]; */

const eventItems = [
    {
        title: "LỊCH THI ĐẤU - KÊNH XEM TẠI VIỆT NAM - FIFA World Cup",
        date: "2026-06-11",
        place: "Canada, Mexico, Hoa Kỳ",
        image: WC,
        url: "https://vtv.vn/chinh-thuc-lich-truc-tiep-vck-fifa-world-cup-2026-tren-vtv-100260611134549356.htm",
    },
    {
        title: "Chào mừng Ngày Quốc khánh 2/9",
        date: "2026-08-31",
        place: "Khu dân cư, trung tâm xã",
        image: QK,
        url: "https://hcmussh.edu.vn/news/item/9427",
    },
];
const policyItems = [
    {
        title: "Bộ Công Thương ban hành Kế hoạch triển khai Tháng hành động phòng, chống ma túy năm 2026",
        meta: "Chỉ đạo điều hành · 1049...",
        date: "2026-06-03",
        url: PHONG_CHONG_MA_TUY_2026_URL,
    },
    {
        title: "Tổng hợp nhiệm vụ của Văn phòng HĐND và UBND cấp xã từ 01/7/2025",
        meta: "Chính sách mới · Văn phòng HĐND và UBND",
        date: "2026-06-14",
        url: NHIEM_VU_VP_HDND_UBND_CAP_XA_URL,
    },
];

const DEFAULT_VISIBLE_FEATURE_COUNT = 4;

const getTaskBadgeLabel = (count: number) => {
    if (count > 99) {
        return "99+";
    }

    return String(count);
};

const StyledPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 96px;

    background: radial-gradient(
            circle at 24px 140px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 260px, #f5f7fb 100%);

    color: #172033;

    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;

    font-size: calc(16px * var(--app-font-scale));
    font-weight: 550;
    line-height: 1.5;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
`;

const AppHeader = styled.header`
    position: fixed;
    inset: 0 auto auto 50%;
    transform: translateX(-50%);
    z-index: 10;

    width: min(100vw, 430px);
    min-height: 112px;
    padding: calc(14px + var(--zaui-safe-area-inset-top, 0px)) 14px 14px;

    display: flex;
    align-items: flex-end;
    gap: 11px;

    color: #ffffff;
    background: radial-gradient(
            circle at 18% 18%,
            rgba(77, 184, 255, 0.28),
            transparent 34%
        ),
        linear-gradient(135deg, #00325f 0%, #004b86 48%, #0067ad 100%);

    box-shadow: 0 10px 26px rgba(0, 50, 95, 0.24);
    border-bottom-left-radius: 22px;
    border-bottom-right-radius: 22px;
`;

const HeaderLogo = styled.div`
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    margin-bottom: 8px;
    border-radius: 50%;
    background: radial-gradient(
            circle at 50% 62%,
            #f7cf48 0 12%,
            transparent 13%
        ),
        radial-gradient(circle at 50% 42%, #f7cf48 0 10%, transparent 11%),
        radial-gradient(
            circle at center,
            #9f0614 0 57%,
            #f2ca66 58% 66%,
            transparent 67%
        );
    border: 2px solid #f7cf48;
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1),
        0 10px 18px rgba(66, 2, 8, 0.28);
    position: relative;

    &::before {
        content: "★";
        position: absolute;
        inset: 2px 0 auto;
        text-align: center;
        color: #f7cf48;
        font-size: calc(15px * var(--app-font-scale));
        line-height: 1;
    }

    &::after {
        content: "";
        position: absolute;
        left: 9px;
        right: 9px;
        bottom: 7px;
        height: 9px;
        border: 2px solid #f7cf48;
        border-top: 0;
        border-radius: 0 0 10px 10px;
    }
`;

const HeaderText = styled.div`
    flex: 1;
    min-width: 0;
`;

const HeaderTitle = styled.div`
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: 900;
    letter-spacing: 0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const HeaderSubTitle = styled.div`
    margin-top: 5px;

    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 700;

    color: rgba(255, 255, 255, 0.78);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 0;
    transform: translateY(10px);
`;

const SquareButton = styled.button`
    width: 40px;
    height: 40px;

    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 13px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;

    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(8px);

    transition: transform 160ms ease, background 160ms ease;

    &:active {
        transform: scale(0.94);
        background: rgba(255, 255, 255, 0.22);
    }
`;

const Content = styled.main`
    overflow: hidden;
`;

const Hero = styled.section`
    position: relative;
    overflow: hidden;

    width: auto;
    min-height: 230px;
    height: clamp(235px, 62vw, 285px);

    margin: 6px 8px 8px;
    border-radius: 18px;

    background-image: url(${HeaderBackground});
    background-size: 112% auto;
    background-position: center center;
    background-repeat: no-repeat;
    background-color: #d9ecf8;

    box-shadow: 0 10px 22px rgba(0, 75, 134, 0.14),
        inset 0 1px 0 rgba(255, 255, 255, 0.18);

    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(
            180deg,
            rgba(0, 36, 68, 0.01) 0%,
            rgba(0, 36, 68, 0.03) 55%,
            rgba(0, 36, 68, 0.12) 100%
        );
        pointer-events: none;
    }

    @media (max-width: 360px) {
        min-height: 220px;
        height: 230px;
        margin: 5px 7px 8px;
        border-radius: 16px;
        background-size: 116% auto;
    }

    @media (min-width: 431px) {
        height: 290px;
        margin-left: 8px;
        margin-right: 8px;
        border-radius: 20px;
        background-size: 110% auto;
    }
`;
const HeroInner = styled.div`
    position: absolute;
    inset: 0;
    z-index: 1;

    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(68px, 22vw, 98px);
    align-items: center;
    gap: clamp(8px, 2vw, 14px);

    padding: clamp(14px, 4vw, 22px) clamp(14px, 4vw, 18px);
`;

const HeroCopy = styled.div`
    text-align: left;
    color: #ffffff;
    text-shadow: 0 8px 20px rgba(49, 5, 10, 0.35);
`;

const Script = styled.div`
    color: #ffe08a;

    font-size: clamp(19px, 5.2vw, 24px);
    line-height: 1.15;
    font-weight: 850;
    font-style: italic;
`;

const HeroTitle = styled.div`
    margin-top: 7px;

    color: #ffffff;

    font-size: clamp(19px, 5.4vw, 25px);
    line-height: 1.08;
    font-weight: 950;
    letter-spacing: -0.3px;
`;

const HeroMeta = styled.div`
    width: fit-content;
    max-width: 100%;
    margin-top: clamp(10px, 3vw, 14px);
    padding: 5px 10px;

    border-radius: 999px;

    color: #00558f;
    background: rgba(230, 247, 255, 0.92);

    font-size: clamp(10px, 2.7vw, 12px);
    line-height: 1.2;
    font-weight: 850;

    white-space: nowrap;
`;

const PhonePreview = styled.div`
    width: clamp(66px, 21vw, 88px);
    height: clamp(130px, 39vw, 166px);

    overflow: hidden;

    border: clamp(5px, 1.5vw, 7px) solid #171719;
    border-radius: clamp(18px, 5vw, 24px);

    background: #ffffff;

    box-shadow: 0 14px 26px rgba(0, 0, 0, 0.28);
`;

const PhoneTop = styled.div`
    height: 32px;
    background: linear-gradient(135deg, #870713, #d90d22);
`;

const PhoneImage = styled.div`
    height: 58px;
    background: url(${Background}) center/cover;
`;

const PhoneGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 10px;
`;

const PhoneDot = styled.div`
    aspect-ratio: 1;
    border-radius: 999px;
    background: #a25b32;
`;

const Dots = styled.div`
    position: absolute;
    left: 50%;
    bottom: 10px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Dot = styled.div<{ $active?: boolean }>`
    width: ${({ $active }) => ($active ? "32px" : "8px")};
    height: 8px;
    border-radius: 999px;
    background: ${({ $active }) =>
        $active ? "#ffffff" : "rgba(255,255,255,0.42)"};
`;

const SectionBlock = styled.section`
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.85);
    border-radius: 22px;
    margin: 12px;
    padding: 22px 14px 6px;
    box-shadow: 0 14px 30px rgba(30, 35, 50, 0.07);
`;

const SectionHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: calc(25px * var(--app-font-scale));
    line-height: 1.1;
    font-weight: 1000;
    color: #172033;
`;

const MoreLink = styled.button<{ $expanded?: boolean }>`
    border: 0;
    background: transparent;
    color: #b50b1b;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 900;
    white-space: nowrap;

    svg {
        transform: rotate(
            ${({ $expanded }) => ($expanded ? "-90deg" : "0deg")}
        );
        transition: transform 160ms ease;
    }
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
`;

const FeatureButton = styled.button`
    position: relative;
    min-width: 0;
    padding: 2px 2px 12px;

    border: 0;
    border-radius: 14px;
    background: transparent;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;

    color: #26364d;

    transition: transform 160ms ease, background 160ms ease;

    &:active {
        transform: scale(0.95);
        background: rgba(0, 91, 160, 0.06);
    }
`;

const Medallion = styled.div`
    width: 52px;
    height: 52px;

    border: 1px solid rgba(0, 95, 168, 0.1);
    border-radius: 17px;

    display: grid;
    place-items: center;

    color: #0063a7;
    background: linear-gradient(145deg, #f7fcff, #e4f3ff);

    box-shadow: 0 8px 18px rgba(0, 86, 153, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);

    transition: transform 180ms ease, box-shadow 180ms ease;

    ${FeatureButton}:active & {
        transform: translateY(1px);
        box-shadow: 0 4px 10px rgba(0, 86, 153, 0.1);
    }
`;
const FeatureIconImage = styled.img`
    width: 34px;
    height: 34px;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 4px 7px rgba(0, 86, 153, 0.18));
`;
const TaskBadge = styled.span`
    position: absolute;
    top: -4px;
    right: calc(50% - 34px);
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: #d92d20;
    font-size: calc(10px * var(--app-font-scale));
    line-height: 1;
    font-weight: 900;
    box-shadow: 0 3px 8px rgba(217, 45, 32, 0.28);
`;
const FeatureLabel = styled.span`
    min-height: 32px;

    display: flex;
    align-items: flex-start;
    justify-content: center;

    color: #344054;

    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 800;
    letter-spacing: -0.05px;

    text-align: center;
    overflow-wrap: anywhere;
`;

const BannerStrip = styled.div`
    height: 78px;
    margin: 12px;
    padding: 0 22px;

    display: flex;
    align-items: center;

    border-radius: 20px;

    background: linear-gradient(
            105deg,
            rgba(0, 50, 95, 0.96),
            rgba(0, 75, 134, 0.92) 55%,
            rgba(0, 132, 207, 0.82)
        ),
        url(${Background});

    background-size: cover;
    background-position: center;

    color: #ffffff;

    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: 0.3px;
    text-transform: uppercase;

    box-shadow: 0 14px 26px rgba(0, 75, 134, 0.2);
`;

const DestinationCard = styled.article`
    margin: 0 12px 18px;
    border-radius: 24px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 18px 34px rgba(30, 35, 50, 0.12);
`;

const DestinationImage = styled.div`
    position: relative;
    height: 246px;
    overflow: hidden;
    background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.1),
            rgba(23, 32, 51, 0.12)
        ),
        url(${Background}) center/cover;

    img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const Badge = styled.span`
    position: absolute;
    top: 18px;
    left: 18px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.86);
    padding: 8px 14px;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
    color: #475467;
`;

const DestinationBody = styled.div`
    padding: 18px;
`;

const CardTitle = styled.h3`
    margin: 0;

    color: #182230;

    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 850;
    letter-spacing: -0.15px;
`;

const MetaLine = styled.div`
    margin-top: 10px;

    display: flex;
    align-items: center;
    gap: 7px;

    color: #667085;

    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.4;
    font-weight: 650;
`;

const HorizontalScroller = styled.div`
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 0 12px 18px;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

const GalleryCard = styled.article`
    width: 154px;
    flex: 0 0 154px;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 14px 28px rgba(30, 35, 50, 0.1);
    overflow: hidden;
    scroll-snap-align: start;
`;

const GalleryImage = styled.div<{ $image: string }>`
    height: 82px;
    margin: 10px;
    border-radius: 14px;
    background: url(${({ $image }) => $image}) center/cover;
    box-shadow: 8px 0 0 rgba(255, 255, 255, 0.9),
        14px 0 0 rgba(16, 24, 40, 0.12);
`;

const GalleryBody = styled.div`
    padding: 0 14px 16px;
`;

const GalleryTitle = styled.div`
    color: #25324b;

    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 700;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const GalleryCount = styled.div`
    margin-top: 5px;

    color: #7b8494;

    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 500;
`;

const EventCard = styled.article`
    width: 280px;
    flex: 0 0 280px;
    border-radius: 22px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 18px 34px rgba(30, 35, 50, 0.12);
`;

const EventImage = styled.div<{ $image: string }>`
    height: 150px;
    position: relative;
    background: url(${({ $image }) => $image}) center/cover;
`;

const Status = styled.span`
    position: absolute;
    left: 16px;
    bottom: 16px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.62);
    color: #ffffff;
    padding: 6px 12px;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
    backdrop-filter: blur(4px);
`;

const EventBody = styled.div`
    padding: 18px;
`;

const EventTitle = styled.h3`
    margin: 0 0 12px;

    color: #1d2939;

    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.4;
    font-weight: 850;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const PolicyGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 0 12px 22px;
`;

const PolicyCard = styled.article`
    border-radius: 20px;
    background: #ffffff;
    padding: 24px 18px 18px;
    min-height: 172px;
    box-shadow: 0 16px 30px rgba(30, 35, 50, 0.1);
`;

const PolicyIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #b77413;
    background: linear-gradient(135deg, #fff9eb, #fff0cc);
    margin-bottom: 18px;
`;

const PolicyTitle = styled.div`
    color: #27364b;

    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 850;
`;

const PolicyMeta = styled.div`
    margin-top: 10px;

    color: #7b8494;

    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 650;
`;

const RadioCard = styled.article`
    margin: 0 12px 18px;
    border-radius: 22px;
    background: #ffffff;
    border: 1px solid rgba(126, 7, 18, 0.08);
    overflow: hidden;
    box-shadow: 0 18px 34px rgba(30, 35, 50, 0.1);
`;

const RadioRow = styled.div`
    display: grid;
    grid-template-columns: 58px 68px 1fr;
    gap: 12px;
    align-items: center;
    padding: 16px 18px;
    border-top: 1px solid #eef0f3;
`;

const RadioNumber = styled.div`
    color: #e20018;
    font-size: calc(24px * var(--app-font-scale));
    font-weight: 1000;
`;

const RadioTitle = styled.div`
    color: #26364d;

    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.4;
    font-weight: 850;
`;

const RadioDate = styled.div`
    margin-top: 6px;

    color: #7b8494;

    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 650;
`;

const BoardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    padding: 0 12px 28px;
`;

const BoardImage = styled.div<{ $image: string }>`
    height: 134px;
    border-radius: 18px;
    background: url(${({ $image }) => $image}) center/cover;
    box-shadow: 0 16px 28px rgba(30, 35, 50, 0.12);
`;

const FloatingActions = styled.div`
    position: fixed;
    right: max(14px, calc((100vw - 430px) / 2 + 14px));
    bottom: calc(104px + var(--zaui-safe-area-inset-bottom, 0px));
    z-index: 30;

    display: flex;
    align-items: center;
    gap: 7px;
`;
const AssistantLabel = styled.span`
    padding: 7px 11px;

    border: 1px solid rgba(0, 99, 167, 0.12);
    border-radius: 999px;

    color: #005b9f;
    background: rgba(255, 255, 255, 0.94);

    font-size: calc(13px * var(--app-font-scale));
    line-height: 1;
    font-weight: 850;

    box-shadow: 0 8px 18px rgba(30, 35, 50, 0.1);
`;
const AssistantButton = styled.button`
    position: relative;

    width: 52px;
    height: 52px;

    display: grid;
    place-items: center;

    border: 0;
    border-radius: 999px;

    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);

    box-shadow: 0 10px 20px rgba(0, 91, 159, 0.26),
        0 0 0 4px rgba(0, 132, 207, 0.1);

    &:active {
        transform: scale(0.92);
    }
`;

const ChatBackdrop = styled.div`
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(15, 23, 42, 0.34);
    backdrop-filter: blur(2px);
`;

const ChatPanel = styled.section`
    position: fixed;
    left: 50%;
    right: auto;
    bottom: calc(18px + var(--zaui-safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    z-index: 50;

    width: min(calc(100vw - 24px), 406px);
    height: min(620px, calc(100vh - 42px));

    display: grid;
    grid-template-rows: auto 1fr auto;

    overflow: hidden;

    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 24px 52px rgba(15, 23, 42, 0.26);
`;

const ChatHeader = styled.div`
    min-height: 64px;
    padding: 13px 14px;

    display: flex;
    align-items: center;
    gap: 10px;

    color: #ffffff;
    background: linear-gradient(135deg, #004b86, #008bd2);
`;

const ChatAvatar = styled.div`
    width: 38px;
    height: 38px;

    display: grid;
    place-items: center;
    flex: 0 0 auto;

    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
`;

const ChatHeading = styled.div`
    flex: 1;
    min-width: 0;
`;

const ChatTitle = styled.div`
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 800;
`;

const ChatSubtitle = styled.div`
    margin-top: 2px;

    color: rgba(255, 255, 255, 0.78);

    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 500;
`;

const ChatCloseButton = styled.button`
    width: 36px;
    height: 36px;

    border: 0;
    border-radius: 50%;

    display: grid;
    place-items: center;

    color: #ffffff;
    background: rgba(255, 255, 255, 0.14);

    &:active {
        transform: scale(0.94);
    }
`;

const ChatBody = styled.div`
    min-height: 0;
    padding: 14px;

    display: flex;
    flex-direction: column;
    gap: 10px;

    overflow-y: auto;
    background: linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%);
`;

const ChatBubble = styled.div<{ $role: ChatMessage["role"] }>`
    max-width: 82%;
    align-self: ${({ $role }) =>
        $role === "user" ? "flex-end" : "flex-start"};

    padding: 10px 12px;
    border-radius: ${({ $role }) =>
        $role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px"};

    color: ${({ $role }) => ($role === "user" ? "#ffffff" : "#1d2939")};
    background: ${({ $role }) => ($role === "user" ? "#0063a7" : "#ffffff")};

    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.55;
    font-weight: 500;
    overflow-wrap: anywhere;
    word-break: break-word;

    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);

    p {
        margin: 0 0 8px;
    }

    p:last-child {
        margin-bottom: 0;
    }

    strong {
        font-weight: 800;
    }

    ul,
    ol {
        margin: 8px 0 8px 18px;
        padding: 0;
    }

    li {
        margin: 4px 0;
    }

    a {
        color: ${({ $role }) => ($role === "user" ? "#ffffff" : "#0063a7")};
        font-weight: 800;
        text-decoration: underline;
    }

    table {
        width: 100%;
        display: block;
        overflow-x: auto;
        border-collapse: collapse;
        font-size: calc(12px * var(--app-font-scale));
    }

    th,
    td {
        padding: 6px 8px;
        border: 1px solid #d0d5dd;
        text-align: left;
        vertical-align: top;
    }

    code {
        white-space: pre-wrap;
    }
`;

const AssistantMeta = styled.div`
    width: fit-content;
    margin-bottom: 6px;
    padding: 3px 7px;
    border-radius: 999px;
    color: #0063a7;
    background: #eaf6ff;
    font-size: calc(10px * var(--app-font-scale));
    line-height: 1;
    font-weight: 850;
`;

const StreamingContent = styled.div`
    position: relative;
`;

const TypingCursor = styled.span`
    display: inline-block;
    width: 7px;
    height: 17px;
    margin-left: 3px;
    border-radius: 999px;
    background: #0063a7;
    vertical-align: text-bottom;
    animation: chat-cursor-blink 900ms steps(2, start) infinite;

    @keyframes chat-cursor-blink {
        50% {
            opacity: 0;
        }
    }
`;

const TypingDots = styled.div`
    min-width: 52px;
    min-height: 24px;
    display: inline-flex;
    align-items: center;
    gap: 5px;

    span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #98a2b3;
        animation: chat-dot-bounce 900ms ease-in-out infinite;
    }

    span:nth-child(2) {
        animation-delay: 120ms;
    }

    span:nth-child(3) {
        animation-delay: 240ms;
    }

    @keyframes chat-dot-bounce {
        0%,
        80%,
        100% {
            transform: translateY(0);
            opacity: 0.45;
        }

        40% {
            transform: translateY(-4px);
            opacity: 1;
        }
    }
`;

const MessageError = styled.div`
    margin-top: 8px;
    color: #b42318;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 700;
`;

const MessageActions = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
`;

const MessageActionButton = styled.button`
    min-height: 36px;
    padding: 0 10px;
    border: 1px solid #d0e8f8;
    border-radius: 999px;
    color: #0063a7;
    background: #f5fbff;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;

    &:disabled {
        opacity: 0.55;
    }
`;

const NewMessagesButton = styled.button`
    position: absolute;
    left: 50%;
    bottom: 86px;
    transform: translateX(-50%);
    z-index: 2;
    min-height: 38px;
    padding: 0 14px;
    border: 1px solid #d0e8f8;
    border-radius: 999px;
    color: #0063a7;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;
`;

const ChatError = styled.div`
    margin: 0 14px 10px;

    color: #b42318;

    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 650;
`;

const ChatForm = styled.form`
    padding: 12px;

    display: grid;
    grid-template-columns: 1fr 44px;
    gap: 8px;

    border-top: 1px solid #e4e7ec;
    background: #ffffff;
`;

const ChatInput = styled.textarea`
    min-height: 44px;
    max-height: 112px;
    resize: none;

    padding: 11px 12px;

    border: 1px solid #d0d5dd;
    border-radius: 16px;
    outline: none;

    color: #182230;
    background: #ffffff;

    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 500;

    &:focus {
        border-color: #008bd2;
        box-shadow: 0 0 0 3px rgba(0, 139, 210, 0.12);
    }
`;

const ChatSendButton = styled.button<{ $stopping?: boolean }>`
    width: 44px;
    height: 44px;

    border: 0;
    border-radius: 50%;

    display: grid;
    place-items: center;

    color: #ffffff;
    background: ${({ $stopping }) =>
        $stopping
            ? "linear-gradient(135deg, #b42318, #f04438)"
            : "linear-gradient(135deg, #005b9f, #008bd2)"};

    &:disabled {
        opacity: 0.55;
    }

    &:active:not(:disabled) {
        transform: scale(0.94);
    }
`;

const StopGenerationButton = styled.button`
    min-height: 34px;
    margin: 0 12px 10px;
    border: 1px solid #fecaca;
    border-radius: 999px;
    color: #b42318;
    background: #fff7f7;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 850;
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

const BottomNavLogo = styled.div<{ $expanded?: boolean }>`
    position: absolute;
    left: 50%;
    top: ${({ $expanded }) => ($expanded ? "-48px" : "-30px")};
    transform: translateX(-50%);
    z-index: 3;

    width: ${({ $expanded }) => ($expanded ? "150px" : "94px")};
    height: ${({ $expanded }) => ($expanded ? "26px" : "16px")};

    display: grid;
    place-items: center;

    padding: ${({ $expanded }) => ($expanded ? "9px 15px" : "5px 10px")};

    background: ${({ $expanded }) =>
        $expanded ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.94)"};

    border: 1px solid
        ${({ $expanded }) =>
            $expanded ? "rgba(0, 83, 145, 0.16)" : "rgba(0, 83, 145, 0.08)"};
    border-bottom: 0;
    border-radius: ${({ $expanded }) =>
        $expanded ? "24px 24px 0 0" : "18px 18px 0 0"};

    box-shadow: ${({ $expanded }) =>
        $expanded
            ? "0 -12px 28px rgba(0, 75, 134, 0.22)"
            : "0 -5px 14px rgba(0, 75, 134, 0.1)"};

    transition: width 180ms ease, height 180ms ease, top 180ms ease,
        padding 180ms ease, border-radius 180ms ease, box-shadow 180ms ease,
        background 180ms ease;

    &::after {
        content: "";
        position: absolute;
        left: -1px;
        right: -1px;
        bottom: ${({ $expanded }) => ($expanded ? "-22px" : "-16px")};

        height: ${({ $expanded }) => ($expanded ? "24px" : "18px")};

        background: ${({ $expanded }) =>
            $expanded ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.94)"};

        transition: bottom 180ms ease, height 180ms ease, background 180ms ease;
    }
`;

const BottomNavLogoImage = styled.img<{ $expanded?: boolean }>`
    position: relative;
    z-index: 1;

    width: 100%;
    height: 100%;

    display: block;
    object-fit: contain;
    opacity: ${({ $expanded }) => ($expanded ? 1 : 0.86)};
    filter: ${({ $expanded }) =>
        $expanded ? "drop-shadow(0 2px 3px rgba(0, 75, 134, 0.16))" : "none"};

    transition: opacity 180ms ease, filter 180ms ease;
`;
const NavButton = styled.button<{ $active?: boolean }>`
    position: relative;

    border: 0;
    background: transparent;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;

    color: ${({ $active }) => ($active ? "#0063a7" : "#98a2b3")};

    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: ${({ $active }) => ($active ? 700 : 550)};

    transition: color 160ms ease, transform 160ms ease;

    &:active {
        transform: scale(0.94);
    }

    /* Item giữa: Cộng đồng */
    &:nth-of-type(3) {
        justify-content: flex-end;
        padding-bottom: 10px;
    }

    &:nth-of-type(3) svg {
        display: none;
    }
`;
const RadioHero = styled.div`
    position: relative;
    height: 170px;
    overflow: hidden;
    cursor: pointer;
    border-radius: 22px;
    background: #7f1d1d;
`;

const RadioHeroImage = styled.img`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
`;

const RadioHeroOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        180deg,
        rgba(127, 29, 29, 0.15) 0%,
        rgba(127, 29, 29, 0.82) 100%
    );
`;

const RadioHeroTitle = styled.h3`
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 16px;
    z-index: 2;
    margin: 0;
    color: #fff;
    font-size: calc(19px * var(--app-font-scale));
    font-weight: 900;
    line-height: 1.35;
`;

const RadioThumb = styled.div`
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 14px;
    background: #fee2e2;

    img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
    }
`;
const ICON_SIZE = {
    header: 23,
    feature: 23,
    inline: 18,
    policy: 20,
    nav: 23,
    floating: 25,
} as const;

const CHAT_ASK_TIMEOUT_MS = 90000;
const MAX_CHAT_QUESTION_LENGTH = 2000;

const isAbortError = (error: unknown) =>
    error instanceof Error && error.name === "AbortError";

const getAssistantSourceLabel = (message: ChatMessage) => {
    const source = String(message.source || "").trim().toLowerCase();

    if (
        message.cached === true ||
        ["database", "db", "cache", "cached", "saved", "history"].includes(
            source,
        )
    ) {
        return "Dữ liệu đã lưu";
    }

    return "AI";
};

const HomePage: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const user = useStore(state => state.user);
    const unreadTaskNotifications = useStore(
        state => state.unreadTaskNotifications,
    );
    const role = getSystemRole(user);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [chatError, setChatError] = useState("");
    const [copiedMessageId, setCopiedMessageId] = useState<string>();
    const [hasUnreadChatMessages, setHasUnreadChatMessages] = useState(false);
    const [isCompanyLogoExpanded, setIsCompanyLogoExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState<
        Record<string, boolean>
    >({});
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: String(Date.now()),
            role: "assistant",
            content:
                "Xin chào, tôi có thể hỗ trợ anh/chị tra cứu thủ tục hành chính.",
            status: "completed",
            source: null,
            cached: null,
            knowledgeId: null,
            model: null,
        },
    ]);
    const messageIdRef = useRef(Date.now() + 1);
    const activeStreamControllerRef = useRef<AbortController | null>(null);
    const chatBodyRef = useRef<HTMLDivElement | null>(null);
    const shouldAutoScrollChatRef = useRef(true);
    const isMountedRef = useRef(true);
    const visibleFeatureSections = useMemo(
        () =>
            featureSections
                .map(section => ({
                    ...section,
                    items: section.items.filter(
                        item => !item.roles || item.roles.includes(role),
                    ),
                }))
                .filter(section => section.items.length > 0),
        [role],
    );

    const nextMessageId = () => {
        messageIdRef.current += 1;
        return String(messageIdRef.current);
    };

    const closeActiveStream = () => {
        activeStreamControllerRef.current?.abort();
        activeStreamControllerRef.current = null;
    };

    useEffect(
        () => () => {
            isMountedRef.current = false;
            closeActiveStream();
        },
        [],
    );

    useEffect(() => {
        const element = chatBodyRef.current;

        if (!element) {
            return;
        }

        if (!shouldAutoScrollChatRef.current) {
            if (isChatOpen) {
                setHasUnreadChatMessages(true);
            }
            return;
        }

        element.scrollTo({
            top: element.scrollHeight,
            behavior: "smooth",
        });
        setHasUnreadChatMessages(false);
    }, [isChatOpen, messages]);

    useEffect(() => {
        let isExpanded = false;

        const updateLogoByScroll = () => {
            const pageElement = document.getElementById("home-page");
            const nextExpanded =
                window.scrollY > 24 || Number(pageElement?.scrollTop) > 24;

            if (nextExpanded !== isExpanded) {
                isExpanded = nextExpanded;
                setIsCompanyLogoExpanded(nextExpanded);
            }
        };

        updateLogoByScroll();
        const intervalId = window.setInterval(updateLogoByScroll, 120);
        window.addEventListener("scroll", updateLogoByScroll, {
            passive: true,
        });

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener("scroll", updateLogoByScroll);
        };
    }, []);

    const applyAssistantMetadata = (
        assistantMessageId: string,
        metadata: Partial<ChatbotMetadata>,
    ) => {
        if (!isMountedRef.current) {
            return;
        }

        setMessages(current =>
            current.map(message =>
                message.id === assistantMessageId
                    ? {
                          ...message,
                          source: metadata.source ?? message.source ?? null,
                          cached: metadata.cached ?? message.cached ?? null,
                          knowledgeId:
                              metadata.knowledgeId ?? message.knowledgeId ?? null,
                          model: metadata.model ?? message.model ?? null,
                      }
                    : message,
            ),
        );
    };

    const stopChatStream = () => {
        activeStreamControllerRef.current?.abort();
        activeStreamControllerRef.current = null;
        setIsSending(false);
    };

    const startChatStream = async (question: string, assistantMessageId: string) => {
        const streamController = new AbortController();
        activeStreamControllerRef.current = streamController;
        const timeoutId = window.setTimeout(
            () => streamController.abort(),
            CHAT_ASK_TIMEOUT_MS,
        );

        setChatError("");
        setIsSending(true);
        shouldAutoScrollChatRef.current = true;

        setMessages(current =>
            current.map(message =>
                message.id === assistantMessageId
                    ? {
                          ...message,
                          content: "",
                          status: "pending",
                          errorMessage: undefined,
                          question,
                      }
                    : message,
            ),
        );

        try {
            await askChatbotStream(question, streamController.signal, {
                onMetadata: metadata => {
                    applyAssistantMetadata(assistantMessageId, metadata);
                },
                onDelta: delta => {
                    if (!isMountedRef.current) {
                        return;
                    }

                    setMessages(current =>
                        current.map(message =>
                            message.id === assistantMessageId
                                ? {
                                      ...message,
                                      content: message.content + delta,
                                      status: "streaming",
                                  }
                                : message,
                        ),
                    );
                },
                onDone: metadata => {
                    if (!isMountedRef.current) {
                        return;
                    }

                    applyAssistantMetadata(assistantMessageId, metadata);
                    setMessages(current =>
                        current.map(message =>
                            message.id === assistantMessageId
                                ? {
                                      ...message,
                                      content:
                                          message.content ||
                                          "Xin lỗi, tôi chưa thể trả lời câu hỏi này. Anh/chị vui lòng thử lại.",
                                      status: "completed",
                                  }
                                : message,
                        ),
                    );
                },
                onError: message => {
                    if (!isMountedRef.current) {
                        return;
                    }

                    setChatError(message);
                    setMessages(current =>
                        current.map(chatMessage =>
                            chatMessage.id === assistantMessageId
                                ? {
                                      ...chatMessage,
                                      status: "error",
                                      errorMessage: message,
                                  }
                                : chatMessage,
                        ),
                    );
                },
            });
        } catch (error) {
            if (!isMountedRef.current) {
                return;
            }

            const wasStopped =
                isAbortError(error) || streamController.signal.aborted;
            let message = "Có lỗi xảy ra khi nhận câu trả lời.";

            if (wasStopped) {
                message = "Đã dừng tạo câu trả lời.";
            } else if (error instanceof Error) {
                message = error.message;
            }

            setChatError(wasStopped ? "" : message);
            setMessages(current =>
                current.map(chatMessage =>
                    chatMessage.id === assistantMessageId
                        ? {
                              ...chatMessage,
                              status: wasStopped ? "stopped" : "error",
                              errorMessage: wasStopped ? undefined : message,
                          }
                        : chatMessage,
                ),
            );
        } finally {
            window.clearTimeout(timeoutId);
            if (activeStreamControllerRef.current === streamController) {
                activeStreamControllerRef.current = null;
            }
            if (isMountedRef.current) {
                setIsSending(false);
            }
        }
    };

    const retryAssistantMessage = (message: ChatMessage) => {
        if (!message.question || isSending) {
            return;
        }

        shouldAutoScrollChatRef.current = true;
        setHasUnreadChatMessages(false);
        startChatStream(message.question, message.id).catch(() => undefined);
    };

    const copyAssistantMessage = (message: ChatMessage) => {
        const content = message.content.trim();

        if (!content) {
            return;
        }

        const fallbackCopy = () => {
            const textarea = document.createElement("textarea");
            textarea.value = content;
            textarea.setAttribute("readonly", "true");
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        };

        const copyPromise = navigator.clipboard?.writeText
            ? navigator.clipboard.writeText(content)
            : Promise.resolve().then(fallbackCopy);

        copyPromise
            .catch(fallbackCopy)
            .finally(() => {
                setCopiedMessageId(message.id);
                window.setTimeout(() => {
                    setCopiedMessageId(current =>
                        current === message.id ? undefined : current,
                    );
                }, 1700);
            });
    };

    const handleSendMessage = (event: React.FormEvent) => {
        event.preventDefault();

        const question = chatInput.trim();
        if (isSending) {
            return;
        }

        if (!question) {
            setChatError("Vui lòng nhập câu hỏi trước khi gửi.");
            return;
        }

        if (question.length > MAX_CHAT_QUESTION_LENGTH) {
            setChatError("Câu hỏi tối đa 2000 ký tự.");
            return;
        }

        setChatInput("");
        setChatError("");
        shouldAutoScrollChatRef.current = true;

        const assistantMessageId = nextMessageId();

        setMessages(current => [
            ...current,
            {
                id: nextMessageId(),
                role: "user",
                content: question,
            },
            {
                id: assistantMessageId,
                role: "assistant",
                content: "",
                status: "pending",
                source: null,
                cached: null,
                knowledgeId: null,
                model: null,
                question,
            },
        ]);

        startChatStream(question, assistantMessageId).catch(() => undefined);
    };

    const handleChatBodyScroll = () => {
        const element = chatBodyRef.current;

        if (!element) {
            return;
        }

        const distanceFromBottom =
            element.scrollHeight - element.scrollTop - element.clientHeight;
        const isNearBottom = distanceFromBottom < 80;
        shouldAutoScrollChatRef.current = isNearBottom;

        if (isNearBottom) {
            setHasUnreadChatMessages(false);
        }
    };

    const scrollChatToBottom = () => {
        const element = chatBodyRef.current;

        if (!element) {
            return;
        }

        shouldAutoScrollChatRef.current = true;
        setHasUnreadChatMessages(false);
        element.scrollTo({
            top: element.scrollHeight,
            behavior: "smooth",
        });
    };

    const renderAssistantMessage = (message: ChatMessage) => {
        const isLoading =
            !message.content &&
            (message.status === "pending" || message.status === "streaming");

        return (
            <>
                <AssistantMeta>{getAssistantSourceLabel(message)}</AssistantMeta>
                {message.content && (
                    <StreamingContent>
                        <ReactMarkdown
                            components={{
                                html: () => null,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                        {(message.status === "pending" ||
                            message.status === "streaming") && <TypingCursor />}
                    </StreamingContent>
                )}
                {isLoading && (
                    <TypingDots aria-label="AI đang tạo câu trả lời">
                        <span />
                        <span />
                        <span />
                    </TypingDots>
                )}
                {message.status === "error" && !message.errorMessage && (
                    <MessageError>
                        Không thể nhận câu trả lời. Anh/chị vui lòng thử lại.
                    </MessageError>
                )}
                {message.errorMessage && (
                    <MessageError>{message.errorMessage}</MessageError>
                )}
                {message.status === "error" && (
                    <MessageActionButton
                        type="button"
                        onClick={() => retryAssistantMessage(message)}
                        disabled={isSending}
                    >
                        Thử lại
                    </MessageActionButton>
                )}
                {message.status === "completed" && message.content && (
                    <MessageActions>
                        <MessageActionButton
                            type="button"
                            onClick={() => copyAssistantMessage(message)}
                        >
                            {copiedMessageId === message.id
                                ? "Đã sao chép"
                                : "Sao chép"}
                        </MessageActionButton>
                        {message.question && (
                            <MessageActionButton
                                type="button"
                                onClick={() => retryAssistantMessage(message)}
                                disabled={isSending}
                            >
                                Hỏi lại
                            </MessageActionButton>
                        )}
                    </MessageActions>
                )}
            </>
        );
    };

    const goToPage = (path?: string) => {
        if (path) {
            navigate(path);
        }
    };

    const openFeature = (item: FeatureItem) => {
        if (item.url) {
            openWebView(item.url).catch(() => undefined);
            return;
        }

        goToPage(item.path);
    };

    const toggleSection = (sectionTitle: string) => {
        setExpandedSections(current => ({
            ...current,
            [sectionTitle]: !current[sectionTitle],
        }));
    };

    const getVisibleSectionItems = (section: Section) => {
        if (expandedSections[section.title]) {
            return section.items;
        }

        return section.items.slice(0, DEFAULT_VISIBLE_FEATURE_COUNT);
    };

    const renderSectionMoreButton = (section: Section) => {
        const isExpanded = Boolean(expandedSections[section.title]);
        const hasHiddenItems =
            section.items.length > DEFAULT_VISIBLE_FEATURE_COUNT;
        const label = isExpanded ? "Thu gọn" : section.more || "Xem thêm";

        if (!hasHiddenItems) {
            return null;
        }

        return (
            <MoreLink
                type="button"
                $expanded={isExpanded}
                aria-expanded={isExpanded}
                onClick={() => toggleSection(section.title)}
            >
                {label}
                <Icon icon="zi-chevron-right" size={22} />
            </MoreLink>
        );
    };

    const renderFeatureSection = (section: Section) => {
        const visibleItems = getVisibleSectionItems(section);

        return (
            <SectionBlock key={section.title}>
                <SectionHead>
                    <SectionTitle>{section.title}</SectionTitle>
                    {renderSectionMoreButton(section)}
                </SectionHead>
                <FeatureGrid>
                    {visibleItems.map(item => (
                        <FeatureButton
                            key={item.label}
                            onClick={() => openFeature(item)}
                        >
                            {(item.path === "/task-assignments" ||
                                item.path === "/received-tasks") &&
                                unreadTaskNotifications > 0 && (
                                    <TaskBadge>
                                        {getTaskBadgeLabel(
                                            unreadTaskNotifications,
                                        )}
                                    </TaskBadge>
                                )}
                            <Medallion>
                                {item.image ? (
                                    <FeatureIconImage src={item.image} alt="" />
                                ) : item.icon ? (
                                    <Icon
                                        icon={item.icon}
                                        size={ICON_SIZE.feature}
                                    />
                                ) : null}
                            </Medallion>
                            <FeatureLabel>{item.label}</FeatureLabel>
                        </FeatureButton>
                    ))}
                </FeatureGrid>
            </SectionBlock>
        );
    };

    const renderNavigateButton = (path?: string, label = "Xem thêm") => (
        <MoreLink type="button" onClick={() => goToPage(path)}>
            {label}
            <Icon icon="zi-chevron-right" size={22} />
        </MoreLink>
    );

    return (
        <StyledPage id="home-page">
            <AppHeader>
                <HeaderLogo aria-label="Công dân số" />
                <HeaderText>
                    <HeaderTitle>CÔNG DÂN SỐ</HeaderTitle>
                            Tây Ninh
                </HeaderText>
                {/* <HeaderActions>
                    <SquareButton aria-label="Tìm kiếm">
                        <Icon icon="zi-search" size={28} />
                    </SquareButton>
                </HeaderActions> */}
            </AppHeader>

            <Content>
                <Hero>
                    <HeroInner />
                    <Dots>
                        <Dot />
                        <Dot $active />
                    </Dots>
                </Hero>

                {visibleFeatureSections.slice(0, 2).map(renderFeatureSection)}

                <BannerStrip>Tiện ích số </BannerStrip>

                {visibleFeatureSections.slice(2).map(renderFeatureSection)}

                <SectionBlock>
                    <SectionHead>
                        <SectionTitle>Điểm đến du lịch</SectionTitle>
                        {renderNavigateButton("/destinations")}
                    </SectionHead>
                </SectionBlock>
                <DestinationCard
                    onClick={() => openWebView(TOUR_TAY_NINH_URL)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openWebView(TOUR_TAY_NINH_URL);
                        }
                    }}
                >
                    <DestinationImage>
                        <img
                            src={TOUR_TAY_NINH}
                            alt="Tour Núi Bà Đen Tây Ninh"
                        />
                        <Badge>Du Lịch</Badge>
                    </DestinationImage>

                    <DestinationBody>
                        <CardTitle>
                            Tây Ninh
                        </CardTitle>

                        <MetaLine>
                            <Icon icon="zi-location" size={21} />
                            Tây Ninh
                        </MetaLine>
                    </DestinationBody>
                </DestinationCard>

                {/*   <SectionBlock>
                    <SectionHead>
                        <SectionTitle>Hình ảnh</SectionTitle>
                        {renderNavigateButton("/gallery")}
                    </SectionHead>
                </SectionBlock> */}
                {/*  <HorizontalScroller>
                    {galleryItems.map(item => (
                        <GalleryCard key={item.title}>
                            <GalleryImage $image={item.image} />
                            <GalleryBody>
                                <GalleryTitle>{item.title}</GalleryTitle>
                                <GalleryCount>{item.count}</GalleryCount>
                            </GalleryBody>
                        </GalleryCard>
                    ))}
                </HorizontalScroller> */}

                <SectionBlock>
                    <SectionHead>
                        <SectionTitle>Lịch sự kiện</SectionTitle>
                        {renderNavigateButton("/events", "Xem tất cả")}
                    </SectionHead>
                </SectionBlock>
                <HorizontalScroller>
                    {eventItems.map(item => (
                        <EventCard
                            key={item.title}
                            role="button"
                            tabIndex={0}
                            onClick={() => openWebView(item.url)}
                            onKeyDown={event => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    openWebView(item.url);
                                }
                            }}
                        >
                            <EventImage $image={item.image}>
                                <Status>Sắp diễn ra</Status>
                            </EventImage>

                            <EventBody>
                                <EventTitle>{item.title}</EventTitle>

                                <MetaLine>
                                    <Icon icon="zi-calendar" size={20} />
                                    {item.date}
                                </MetaLine>

                                <MetaLine>
                                    <Icon icon="zi-location" size={20} />
                                    {item.place}
                                </MetaLine>

                                <MetaLine>
                                    <Icon icon="zi-user" size={20} />
                                    0/1000000 đã đăng ký
                                </MetaLine>
                            </EventBody>
                        </EventCard>
                    ))}
                </HorizontalScroller>

                <SectionBlock>
                    <SectionHead>
                        <SectionTitle>Văn bản chính sách</SectionTitle>
                        {renderNavigateButton("/legal-documents", "Xem tất cả")}
                    </SectionHead>
                </SectionBlock>
                <PolicyGrid>
                    {policyItems.map(item => (
                        <PolicyCard
                            key={item.title}
                            onClick={() => openWebView(item.url)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={event => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    openWebView(item.url);
                                }
                            }}
                        >
                            <PolicyIcon>
                                <Icon icon="zi-file" size={22} />
                            </PolicyIcon>

                            <PolicyTitle>{item.title}</PolicyTitle>

                            <PolicyMeta>
                                {item.meta}
                                <br />
                                {item.date}
                            </PolicyMeta>
                        </PolicyCard>
                    ))}
                </PolicyGrid>
                <RadioCard>
                    <RadioHero
                        onClick={() => openWebView(KE_HOACH_KTXH_2027_URL)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={event => {
                            if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                openWebView(KE_HOACH_KTXH_2027_URL);
                            }
                        }}
                    >
                        <RadioHeroImage
                            src={KHXH}
                            alt="Thủ tướng Chính phủ chỉ thị xây dựng kế hoạch phát triển KTXH và dự toán ngân sách nhà nước năm 2027"
                        />

                        <RadioHeroOverlay />

                        <RadioHeroTitle>
                            Thủ tướng Chính phủ chỉ thị xây dựng kế hoạch phát
                            triển KTXH và dự toán ngân sách nhà nước năm 2027
                        </RadioHeroTitle>
                    </RadioHero>

                    {[2, 3].map(number => (
                        <RadioRow
                            key={number}
                            onClick={() => openWebView(KE_HOACH_KTXH_2027_URL)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={event => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    event.preventDefault();
                                    openWebView(KE_HOACH_KTXH_2027_URL);
                                }
                            }}
                        >
                            <RadioNumber>
                                {String(number).padStart(2, "0")}
                            </RadioNumber>

                            <RadioThumb>
                                <img
                                    src={KHXH}
                            alt="Thủ tướng Chính phủ chỉ thị xây dựng kế hoạch phát triển KTXH và dự toán ngân sách nhà nước năm 2027"
                                />
                            </RadioThumb>

                            <div>
                                <RadioTitle>
                                    {number === 2
                                        ? "Thủ tướng Chính phủ chỉ thị xây dựng kế hoạch phát triển KTXH"
                                        : "Dự toán ngân sách nhà nước năm 2027"}
                                </RadioTitle>

                                <RadioDate>
                                    2026-05-{number === 2 ? "09" : "10"}{" "}
                                    00:00:00
                                </RadioDate>
                            </div>
                        </RadioRow>
                    ))}
                </RadioCard>

                {/*   <SectionBlock>
                    <SectionHead>
                        <SectionTitle>Bảng điện tử</SectionTitle>
                        {renderNavigateButton("/digital-board")}
                    </SectionHead>
                </SectionBlock> */}
                {/*   <BoardGrid>
                    <BoardImage $image={Youtube} />
                    <BoardImage $image={Thumb} />
                </BoardGrid> */}
            </Content>

            <FloatingActions>
                <AssistantLabel>Trợ lý người dân</AssistantLabel>

                <AssistantButton
                    aria-label="Mở trợ lý số"
                    onClick={() => setIsChatOpen(true)}
                >
                    <Icon icon="zi-chat" size={27} />
                </AssistantButton>
            </FloatingActions>

            {isChatOpen && (
                <>
                    <ChatBackdrop
                        onClick={() => {
                            closeActiveStream();
                            setIsChatOpen(false);
                        }}
                    />
                    <ChatPanel aria-label="Trợ lý người dân">
                        <ChatHeader>
                            <ChatAvatar>
                                <Icon icon="zi-chat" size={24} />
                            </ChatAvatar>
                            <ChatHeading>
                                <ChatTitle>Trợ lý người dân</ChatTitle>
                                <ChatSubtitle>
                                    Hỏi đáp thủ tục hành chính
                                </ChatSubtitle>
                            </ChatHeading>
                            <ChatCloseButton
                                aria-label="Đóng trợ lý"
                                onClick={() => {
                                    closeActiveStream();
                                    setIsChatOpen(false);
                                }}
                            >
                                <Icon icon="zi-close" size={22} />
                            </ChatCloseButton>
                        </ChatHeader>

                        <ChatBody
                            ref={chatBodyRef}
                            aria-live="polite"
                            onScroll={handleChatBodyScroll}
                        >
                            {messages.map(message => (
                                <ChatBubble
                                    key={message.id}
                                    $role={message.role}
                                >
                                    {message.role === "assistant"
                                        ? renderAssistantMessage(message)
                                        : message.content}
                                </ChatBubble>
                            ))}
                        </ChatBody>
                        {hasUnreadChatMessages && (
                            <NewMessagesButton
                                type="button"
                                onClick={scrollChatToBottom}
                            >
                                Xuống tin nhắn mới
                            </NewMessagesButton>
                        )}

                        <div>
                            {chatError && <ChatError>{chatError}</ChatError>}
                            <ChatForm onSubmit={handleSendMessage}>
                                <ChatInput
                                    value={chatInput}
                                    placeholder="Nhập câu hỏi của anh/chị..."
                                    rows={1}
                                    maxLength={MAX_CHAT_QUESTION_LENGTH}
                                    disabled={isSending}
                                    onChange={event =>
                                        setChatInput(event.target.value)
                                    }
                                    onKeyDown={event => {
                                        if (
                                            event.key === "Enter" &&
                                            !event.shiftKey
                                        ) {
                                            event.preventDefault();
                                            handleSendMessage(event);
                                        }
                                    }}
                                />
                                <ChatSendButton
                                    type="submit"
                                    aria-label={
                                        isSending
                                            ? "Đang gửi câu hỏi"
                                            : "Gửi câu hỏi"
                                    }
                                    disabled={isSending || !chatInput.trim()}
                                    $stopping={isSending}
                                >
                                    <Icon
                                        icon={
                                            isSending
                                                ? "zi-close"
                                                : "zi-arrow-right"
                                        }
                                        size={23}
                                    />
                                </ChatSendButton>
                            </ChatForm>
                            {isSending && (
                                <StopGenerationButton
                                    type="button"
                                    onClick={stopChatStream}
                                >
                                    Dừng tạo câu trả lời
                                </StopGenerationButton>
                            )}
                        </div>
                    </ChatPanel>
                </>
            )}
            <AppBottomNav />
        </StyledPage>
    );
};

export default HomePage;


