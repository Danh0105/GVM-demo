import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import AppHeader from "@components/layout/AppHeader";
import { openWebView } from "@/services/zalo";
import TTCDTN from "./statics/TTCDTN.png";
import HDT from "./statics/HDT.png";
import VQG from "./statics/VQG.png";
import MTL from "./statics/MTL.png";
import CLH from "./statics/CLH.png";
import NBD from "./statics/NBD.png";
import AppBottomNav from "@/components/layout/AppBottomNav";
const TOUR_REGISTER_URL = "https://www.ivivu.com/du-lich/tour-tay-ninh";

type DestinationCategory = {
    id: string;
    label: string;
};

type Destination = {
    id: string;
    title: string;
    categoryId: string;
    categoryLabel: string;
    description: string;
    image: string;
    meta: string;
};

const categories: DestinationCategory[] = [
    {
        id: "",
        label: "Tất cả",
    },
    {
        id: "culture",
        label: "Văn hóa",
    },
    {
        id: "nature",
        label: "Thiên nhiên",
    },
    {
        id: "spiritual",
        label: "Tâm linh",
    },
    {
        id: "experience",
        label: "Trải nghiệm",
    },
];

const destinations: Destination[] = [
    {
        id: "nui-ba-den",
        title: "Núi Bà Đen",
        categoryId: "nature",
        categoryLabel: "Thiên nhiên",
        description:
            "Biểu tượng du lịch Tây Ninh với cảnh quan hùng vĩ, cáp treo hiện đại và không gian ngắm toàn cảnh thành phố từ trên cao.",
        image: NBD,
        meta: "Điểm đến nổi bật",
    },
    {
        id: "toa-thanh-cao-dai",
        title: "Tòa Thánh Cao Đài Tây Ninh",
        categoryId: "spiritual",
        categoryLabel: "Tâm linh",
        description:
            "Công trình kiến trúc độc đáo, là điểm tham quan văn hóa - tín ngưỡng đặc sắc của Tây Ninh.",
        image: TTCDTN,
        meta: "Văn hóa - tín ngưỡng",
    },
    {
        id: "ho-dau-tieng",
        title: "Hồ Dầu Tiếng",
        categoryId: "nature",
        categoryLabel: "Thiên nhiên",
        description:
            "Không gian rộng thoáng, phù hợp dã ngoại, chụp ảnh, cắm trại và ngắm hoàng hôn.",
        image: HDT,
        meta: "Dã ngoại cuối tuần",
    },
    {
        id: "lo-go-xa-mat",
        title: "Vườn quốc gia Lò Gò - Xa Mát",
        categoryId: "experience",
        categoryLabel: "Trải nghiệm",
        description:
            "Điểm đến sinh thái với rừng tự nhiên, hệ động thực vật phong phú và các hoạt động khám phá thiên nhiên.",
        image: VQG,
        meta: "Du lịch sinh thái",
    },
    {
        id: "ma-thien-lanh",
        title: "Ma Thiên Lãnh",
        categoryId: "nature",
        categoryLabel: "Thiên nhiên",
        description:
            "Cung đường xanh mát, thích hợp cho du khách yêu thích trekking nhẹ và khám phá cảnh quan núi rừng.",
        image: MTL,
        meta: "Khám phá núi rừng",
    },
    {
        id: "cho-long-hoa",
        title: "Chợ Long Hoa",
        categoryId: "culture",
        categoryLabel: "Văn hóa",
        description:
            "Không gian mua sắm, ẩm thực địa phương và trải nghiệm nhịp sống đặc trưng của người dân Tây Ninh.",
        image: CLH,
        meta: "Ẩm thực - mua sắm",
    },
];

const DestinationsPageWrapper = styled(Page)`
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

const Meta = styled.p`
    margin: 10px 0 0;
    color: #87909f;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 700;
`;

const RegisterBox = styled.div`
    margin-top: 16px;
    border-radius: 22px;
    padding: 16px;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    color: #ffffff;
    box-shadow: 0 16px 32px rgba(0, 91, 159, 0.22);
`;

const RegisterTitle = styled.h3`
    margin: 0 0 8px;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 950;
`;

const RegisterText = styled.p`
    margin: 0 0 14px;
    color: rgba(255, 255, 255, 0.86);
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;
`;

const RegisterButton = styled.button`
    width: 100%;
    min-height: 48px;
    border: 0;
    border-radius: 16px;
    background: #ffffff;
    color: #005b9f;
    font-size: calc(17px * var(--app-font-scale));
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;

const DestinationList = styled.div`
    display: grid;
    gap: 14px;
    margin-top: 16px;
`;

const DestinationCard = styled.article`
    display: grid;
    grid-template-columns: 142px 1fr;
    gap: 14px;
    min-height: 156px;
    border-radius: 22px;
    background: #ffffff;
    padding: 14px;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
`;

const DestinationImage = styled.div<{ $image: string }>`
    border-radius: 17px;
    background: linear-gradient(
            180deg,
            rgba(23, 32, 51, 0.02),
            rgba(23, 32, 51, 0.08)
        ),
        url(${({ $image }) => $image}) center/cover;
`;

const DestinationBody = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const DestinationTitle = styled.h3`
    margin: 10px 0 10px;
    color: #172033;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.28;
    font-weight: 950;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const DestinationExcerpt = styled(Excerpt)`
    font-size: calc(17px * var(--app-font-scale));
`;

const SmallRegisterButton = styled.button`
    width: fit-content;
    min-height: 36px;
    margin-top: 12px;
    border: 0;
    border-radius: 999px;
    padding: 0 14px;
    background: rgba(0, 91, 159, 0.1);
    color: #005b9f;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;
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

const DestinationsPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const [selectedCategoryId, setSelectedCategoryId] = useState("");

    const filteredDestinations = useMemo(() => {
        if (!selectedCategoryId) {
            return destinations;
        }

        return destinations.filter(
            destination => destination.categoryId === selectedCategoryId,
        );
    }, [selectedCategoryId]);

    const featuredDestination = filteredDestinations[0];
    const normalDestinations = filteredDestinations.slice(1);

    const openTourRegister = async () => {
        try {
            await openWebView(TOUR_REGISTER_URL);
        } catch {
            window.location.href = TOUR_REGISTER_URL;
        }
    };

    const scrollToTop = () => {
        const page = document.getElementById("destinations-page");

        page?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <DestinationsPageWrapper id="destinations-page">
            <AppHeader
                back
                title="Điểm đến"
                description="Khám phá du lịch Tây Ninh và đăng ký tour tham quan"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <CategoryBar>
                {categories.map(category => (
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

                            document
                                .getElementById("destinations-page")
                                ?.scrollTo({
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
                {filteredDestinations.length === 0 && (
                    <StateBox>Chưa có điểm đến nào.</StateBox>
                )}

                {featuredDestination && (
                    <>
                        <FeaturedCard>
                            <FeaturedImage $image={featuredDestination.image} />

                            <FeaturedBody>
                                <Chip>{featuredDestination.categoryLabel}</Chip>

                                <FeaturedTitle>
                                    {featuredDestination.title}
                                </FeaturedTitle>

                                <Excerpt>
                                    {featuredDestination.description}
                                </Excerpt>

                                <Meta>{featuredDestination.meta}</Meta>
                            </FeaturedBody>
                        </FeaturedCard>

                        <RegisterBox>
                            <RegisterTitle>
                                Đăng ký tour du lịch Tây Ninh
                            </RegisterTitle>

                            <RegisterText>
                                Xem lịch trình, giá tour và thông tin đặt chỗ
                                trực tiếp trên iVIVU.
                            </RegisterText>

                            <RegisterButton
                                onClick={openTourRegister}
                                type="button"
                            >
                                Đăng ký tour ngay
                                <Icon icon="zi-arrow-right" size={20} />
                            </RegisterButton>
                        </RegisterBox>

                        <DestinationList>
                            {normalDestinations.map(destination => (
                                <DestinationCard key={destination.id}>
                                    <DestinationImage
                                        $image={destination.image}
                                    />

                                    <DestinationBody>
                                        <Chip>{destination.categoryLabel}</Chip>

                                        <DestinationTitle>
                                            {destination.title}
                                        </DestinationTitle>

                                        <DestinationExcerpt>
                                            {destination.description}
                                        </DestinationExcerpt>

                                        <Meta>{destination.meta}</Meta>

                                        <SmallRegisterButton
                                            onClick={openTourRegister}
                                            type="button"
                                        >
                                            Đăng ký tour
                                        </SmallRegisterButton>
                                    </DestinationBody>
                                </DestinationCard>
                            ))}
                        </DestinationList>
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
        </DestinationsPageWrapper>
    );
};

export default DestinationsPage;
