import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import Background from "@assets/background.png";
import HeaderBackground from "@assets/header-background.png";
import ReactMarkdown from "react-markdown";
import { openWebView } from "@/services/zalo";
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

type FeatureItem = {
    label: string;
    icon?: React.ComponentProps<typeof Icon>["icon"];
    image?: string;
    path?: string;
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

type ChatSource = {
    id?: string;
    title?: string;
    label?: string;
    url?: string;
    updatedAt?: string;
};

type ChatMessage = {
    id: number;
    role: "assistant" | "user";
    content: string;
    sources?: ChatSource[];
    showSourceNotice?: boolean;
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
                label: "Phản ánh người dân",
                image: FEEDBACK,
                path: "/feedbacks",
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
    { title: "Ảnh đẹp Thiệu Hóa", count: "19 ảnh", image: Background },
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
`;
const SourceNotice = styled.div`
    margin-top: 8px;
    padding: 8px 10px;

    border-radius: 12px;
    background: #f8fafc;
    color: #98a2b3;

    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.4;
    font-weight: 500;
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

const ChatSendButton = styled.button`
    width: 44px;
    height: 44px;

    border: 0;
    border-radius: 50%;

    display: grid;
    place-items: center;

    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);

    &:disabled {
        opacity: 0.55;
    }

    &:active:not(:disabled) {
        transform: scale(0.94);
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

const getAssistantSources = (data: any): ChatSource[] => {
    const possibleSources =
        data?.sources ??
        data?.data?.sources ??
        data?.data?.source ??
        data?.source;

    if (Array.isArray(possibleSources)) {
        return possibleSources;
    }

    return [];
};

const hasSourceField = (data: any): boolean => {
    return (
        Array.isArray(data?.sources) ||
        Array.isArray(data?.data?.sources) ||
        Array.isArray(data?.data?.source) ||
        Array.isArray(data?.source)
    );
};

const removeJsonCodeFence = (value: string): string => {
    return value
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
};

const tryParseJsonAnswer = (value: string): string | null => {
    const cleanedValue = removeJsonCodeFence(value);

    try {
        const parsed = JSON.parse(cleanedValue);

        if (typeof parsed?.answer === "string") {
            return parsed.answer;
        }

        if (typeof parsed?.data?.answer === "string") {
            return parsed.data.answer;
        }

        if (typeof parsed?.message === "string") {
            return parsed.message;
        }

        return null;
    } catch {
        return null;
    }
};

const getAssistantAnswer = (data: any): string => {
    if (typeof data === "string") {
        return tryParseJsonAnswer(data) ?? data;
    }

    const possibleAnswer =
        data?.answer ??
        data?.data?.answer ??
        data?.data?.message ??
        data?.message ??
        data?.result ??
        data?.content;

    if (typeof possibleAnswer === "string") {
        return tryParseJsonAnswer(possibleAnswer) ?? possibleAnswer;
    }

    return "Xin lỗi, tôi chưa nhận được nội dung trả lời phù hợp.";
};

const CHAT_API_BASE_URL = "https://externally-tight-serval.ngrok-free.app";
const CHAT_ASK_TIMEOUT_MS = 90000;
const CHAT_STREAM_TIMEOUT_MS = 120000;

const parseSseEvent = (rawEvent: string): { event: string; data: string } => {
    let eventName = "message";
    const dataLines: string[] = [];

    rawEvent.split("\n").forEach(line => {
        if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trim());
        }
    });

    return { event: eventName, data: dataLines.join("\n") };
};

type StreamChatAnswerParams = {
    jobId: string;
    signal: AbortSignal;
    onDelta: (delta: string) => void;
    onDone: (payload: { answer: string; sources: ChatSource[] }) => void;
    onError: (message: string) => void;
};

/**
 * Dùng fetch + ReadableStream (thay vì EventSource) để có thể kiểm tra
 * HTTP status (404 khi jobId hết hạn) trước khi parse SSE, và để tránh
 * hành vi tự động retry vô hạn của EventSource khi kết nối lỗi.
 */
const streamChatAnswer = async ({
    jobId,
    signal,
    onDelta,
    onDone,
    onError,
}: StreamChatAnswerParams): Promise<void> => {
    let response: Response;

    try {
        response = await fetch(
            `${CHAT_API_BASE_URL}/chat/ask/${jobId}/stream`,
            {
                method: "GET",
                headers: {
                    Accept: "text/event-stream",
                    "ngrok-skip-browser-warning": "true",
                },
                signal,
            },
        );
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        onError("Không thể mở kết nối nhận câu trả lời.");
        return;
    }

    if (response.status === 404) {
        const body = await response.json().catch(() => null);
        onError(body?.message ?? "Yêu cầu không tồn tại hoặc đã hết hạn.");
        return;
    }

    if (!response.ok || !response.body) {
        onError("Không thể mở kết nối nhận câu trả lời.");
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
        while (true) {
            const { value, done } = await reader.read();

            if (done) {
                onError("Kết nối bị ngắt trước khi nhận được câu trả lời.");
                return;
            }

            buffer += decoder.decode(value, { stream: true });

            let separatorIndex = buffer.indexOf("\n\n");

            while (separatorIndex !== -1) {
                const rawEvent = buffer.slice(0, separatorIndex);
                buffer = buffer.slice(separatorIndex + 2);

                const { event: eventName, data: eventData } =
                    parseSseEvent(rawEvent);

                if (eventData) {
                    let parsed: any;

                    try {
                        parsed = JSON.parse(eventData);
                    } catch {
                        parsed = null;
                    }

                    if (parsed) {
                        if (
                            eventName === "chunk" &&
                            typeof parsed.delta === "string"
                        ) {
                            onDelta(parsed.delta);
                        } else if (eventName === "done") {
                            onDone({
                                answer:
                                    typeof parsed.answer === "string"
                                        ? parsed.answer
                                        : "",
                                sources: Array.isArray(parsed.sources)
                                    ? parsed.sources
                                    : [],
                            });
                            reader.cancel().catch(() => undefined);
                            return;
                        } else if (eventName === "error") {
                            onError(
                                typeof parsed.error === "string"
                                    ? parsed.error
                                    : "Có lỗi xảy ra khi xử lý câu hỏi.",
                            );
                            reader.cancel().catch(() => undefined);
                            return;
                        }
                    }
                }

                separatorIndex = buffer.indexOf("\n\n");
            }
        }
    } finally {
        reader.releaseLock();
    }
};

const HomePage: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [chatError, setChatError] = useState("");
    const [isCompanyLogoExpanded, setIsCompanyLogoExpanded] = useState(false);
    const [expandedSections, setExpandedSections] = useState<
        Record<string, boolean>
    >({});
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: Date.now(),
            role: "assistant",
            content:
                "Xin chào, tôi có thể hỗ trợ anh/chị tra cứu thủ tục hành chính.",
        },
    ]);
    const messageIdRef = useRef(Date.now() + 1);
    const activeStreamControllerRef = useRef<AbortController | null>(null);

    const nextMessageId = () => {
        messageIdRef.current += 1;
        return messageIdRef.current;
    };

    const closeActiveStream = () => {
        activeStreamControllerRef.current?.abort();
        activeStreamControllerRef.current = null;
    };

    useEffect(() => {
        return () => {
            closeActiveStream();
        };
    }, []);

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

    const handleSendMessage = async (event: React.FormEvent) => {
        event.preventDefault();

        const question = chatInput.trim();
        if (!question || isSending) {
            return;
        }

        closeActiveStream();

        setChatInput("");
        setChatError("");
        setIsSending(true);
        setMessages(current => [
            ...current,
            {
                id: nextMessageId(),
                role: "user",
                content: question,
            },
        ]);

        const askController = new AbortController();
        const askTimeoutId = window.setTimeout(
            () => askController.abort(),
            CHAT_ASK_TIMEOUT_MS,
        );

        try {
            const response = await fetch(`${CHAT_API_BASE_URL}/chat/ask`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify({ question }),
                signal: askController.signal,
            });

            if (!response.ok) {
                throw new Error("Không thể kết nối trợ lý người dân.");
            }

            const data = await response.json();

            if (data?.cached === true) {
                const assistantSources = getAssistantSources(data);
                const shouldShowSourceNotice =
                    hasSourceField(data) && assistantSources.length === 0;

                setMessages(current => [
                    ...current,
                    {
                        id: nextMessageId(),
                        role: "assistant",
                        content: getAssistantAnswer(data),
                        sources: assistantSources,
                        showSourceNotice: shouldShowSourceNotice,
                    },
                ]);
                return;
            }

            const jobId = data?.jobId;

            if (typeof jobId !== "string" || !jobId) {
                throw new Error("Không nhận được mã yêu cầu từ máy chủ.");
            }

            const assistantMessageId = nextMessageId();

            setMessages(current => [
                ...current,
                { id: assistantMessageId, role: "assistant", content: "" },
            ]);

            const streamController = new AbortController();
            activeStreamControllerRef.current = streamController;
            const streamTimeoutId = window.setTimeout(
                () => streamController.abort(),
                CHAT_STREAM_TIMEOUT_MS,
            );

            try {
                await streamChatAnswer({
                    jobId,
                    signal: streamController.signal,
                    onDelta: delta => {
                        setMessages(current =>
                            current.map(message =>
                                message.id === assistantMessageId
                                    ? {
                                          ...message,
                                          content: message.content + delta,
                                      }
                                    : message,
                            ),
                        );
                    },
                    onDone: ({ answer, sources }) => {
                        setMessages(current =>
                            current.map(message =>
                                message.id === assistantMessageId
                                    ? {
                                          ...message,
                                          content: answer,
                                          sources,
                                          showSourceNotice:
                                              sources.length === 0,
                                      }
                                    : message,
                            ),
                        );
                    },
                    onError: errorMessage => {
                        setChatError(errorMessage);
                        setMessages(current =>
                            current.map(message =>
                                message.id === assistantMessageId
                                    ? {
                                          ...message,
                                          content:
                                              message.content ||
                                              "Hiện chưa thể nhận câu trả lời. Anh/chị vui lòng thử lại sau.",
                                      }
                                    : message,
                            ),
                        );
                    },
                });
            } catch (streamError) {
                const message =
                    streamError instanceof DOMException &&
                    streamError.name === "AbortError"
                        ? "Trợ lý phản hồi quá lâu, vui lòng gửi lại câu hỏi."
                        : "Có lỗi xảy ra khi nhận câu trả lời.";

                setChatError(message);
                setMessages(current =>
                    current.map(m =>
                        m.id === assistantMessageId
                            ? {
                                  ...m,
                                  content:
                                      m.content ||
                                      "Hiện chưa thể nhận câu trả lời. Anh/chị vui lòng thử lại sau.",
                              }
                            : m,
                    ),
                );
            } finally {
                window.clearTimeout(streamTimeoutId);
                if (activeStreamControllerRef.current === streamController) {
                    activeStreamControllerRef.current = null;
                }
            }
        } catch (error) {
            let message = "Có lỗi xảy ra khi gửi câu hỏi.";

            if (error instanceof DOMException && error.name === "AbortError") {
                message =
                    "Trợ lý đang khởi động hoặc phản hồi quá lâu, vui lòng gửi lại câu hỏi.";
            } else if (error instanceof Error) {
                message = error.message;
            }

            setChatError(message);
            setMessages(current => [
                ...current,
                {
                    id: nextMessageId(),
                    role: "assistant",
                    content:
                        "Hiện chưa thể gửi câu hỏi. Anh/chị vui lòng thử lại sau.",
                },
            ]);
        } finally {
            window.clearTimeout(askTimeoutId);
            setIsSending(false);
        }
    };

    const goToPage = (path?: string) => {
        if (path) {
            navigate(path);
        }
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
                {isExpanded ? "Thu gọn" : section.more ?? "Xem thêm"}
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
                            onClick={() => goToPage(item.path)}
                        >
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
                    <HeaderSubTitle>Xã Xuân Thới Sơn</HeaderSubTitle>
                </HeaderText>
                {/* <HeaderActions>
                    <SquareButton aria-label="Tìm kiếm">
                        <Icon icon="zi-search" size={28} />
                    </SquareButton>
                </HeaderActions> */}
            </AppHeader>

            <Content>
                <Hero>
                    <HeroInner></HeroInner>
                    <Dots>
                        <Dot />
                        <Dot $active />
                    </Dots>
                </Hero>

                {featureSections.slice(0, 2).map(renderFeatureSection)}

                <BannerStrip>Tiện ích số </BannerStrip>

                {featureSections.slice(2).map(renderFeatureSection)}

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
                            Tour Núi Bà Đen - Tòa Thánh Tây Ninh
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
                                    alt="Thủ tướng Chính phủ chỉ thị xây dựng kế hoạch phát triển KTXH"
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

                        <ChatBody>
                            {messages.map(message => (
                                <ChatBubble
                                    key={message.id}
                                    $role={message.role}
                                >
                                    {message.role === "assistant" ? (
                                        message.content ? (
                                            <ReactMarkdown>
                                                {message.content}
                                            </ReactMarkdown>
                                        ) : (
                                            "Đang tìm câu trả lời..."
                                        )
                                    ) : (
                                        message.content
                                    )}
                                </ChatBubble>
                            ))}
                            {isSending &&
                                messages[messages.length - 1]?.role !==
                                    "assistant" && (
                                    <ChatBubble $role="assistant">
                                        Đang tìm câu trả lời...
                                    </ChatBubble>
                                )}
                        </ChatBody>

                        <div>
                            {chatError && <ChatError>{chatError}</ChatError>}
                            <ChatForm onSubmit={handleSendMessage}>
                                <ChatInput
                                    value={chatInput}
                                    placeholder="Nhập câu hỏi của anh/chị..."
                                    rows={1}
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
                                    aria-label="Gửi câu hỏi"
                                    disabled={!chatInput.trim() || isSending}
                                >
                                    <Icon icon="zi-arrow-right" size={23} />
                                </ChatSendButton>
                            </ChatForm>
                        </div>
                    </ChatPanel>
                </>
            )}
            <AppBottomNav />
        </StyledPage>
    );
};

export default HomePage;
