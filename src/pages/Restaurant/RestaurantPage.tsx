import React from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import AppHeader from "@components/layout/AppHeader";
import AppBottomNav from "@/components/layout/AppBottomNav";
import { openWebView } from "@/services/zalo";

const RESTAURANT_URL = "https://nhahanghamruousongcautayninh.com/";

type Restaurant = {
    id: string;
    name: string;
    address: string;
    description: string;
    rating: string;
    category: string;
    image?: string;
};

const restaurant: Restaurant = {
    id: "ham-ruou-song-cau",
    name: "Nhà hàng Hầm Rượu Sông Cầu",
    address: "Tây Ninh, Việt Nam",
    description:
        "Không gian ẩm thực sang trọng, phù hợp dùng bữa gia đình, tiếp khách, tổ chức tiệc và trải nghiệm ẩm thực địa phương tại Tây Ninh.",
    rating: "4.8",
    category: "Ẩm thực - Nhà hàng",
};

const RestaurantPageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: radial-gradient(
            circle at 24px 126px,
            rgba(150, 42, 18, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #fff4ec 0, #fffaf6 238px, #f7f2ee 100%);
    color: #211813;
    padding: 112px 0 28px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 12px 98px;
`;

const RestaurantCard = styled.article`
    border-radius: 28px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 20px 42px rgba(70, 37, 20, 0.14);
`;

const RestaurantPhoto = styled.div<{ $image?: string }>`
    position: relative;
    height: 250px;
    background: ${({ $image }) =>
        $image
            ? `linear-gradient(
                    180deg,
                    rgba(33, 24, 19, 0.02),
                    rgba(33, 24, 19, 0.24)
                ),
                url(${$image}) center/cover`
            : `linear-gradient(135deg, #7a2e16 0%, #b65a26 52%, #f0a35a 100%)`};
`;

const PhotoOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const PlaceholderIcon = styled.div`
    width: 96px;
    height: 96px;
    border-radius: 30px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 16px 34px rgba(80, 35, 10, 0.2);
`;

const TopBadge = styled.span`
    position: absolute;
    left: 16px;
    top: 16px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    border-radius: 999px;
    padding: 0 14px;
    color: #ffffff;
    background: rgba(33, 24, 19, 0.36);
    backdrop-filter: blur(12px);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
`;

const RestaurantBody = styled.div`
    padding: 20px 18px 22px;
`;

const ChipRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 34px;
    border-radius: 999px;
    padding: 0 13px;
    background: rgba(255, 238, 224, 0.95);
    color: #8d3a16;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;
`;

const RatingChip = styled(Chip)`
    background: rgba(255, 247, 218, 0.95);
    color: #9a6500;
`;

const RestaurantName = styled.h2`
    margin: 15px 0 10px;
    font-size: calc(27px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 950;
    color: #211813;
`;

const Address = styled.p`
    margin: 0 0 12px;
    display: flex;
    align-items: flex-start;
    gap: 7px;
    color: #74655c;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.42;
    font-weight: 750;
`;

const Description = styled.p`
    margin: 0;
    color: #766b64;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.48;
`;

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 18px;
`;

const InfoItem = styled.div`
    min-height: 82px;
    border-radius: 18px;
    padding: 12px 10px;
    background: #fff7f1;
    border: 1px solid rgba(141, 58, 22, 0.08);
`;

const InfoIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #8d3a16;
    background: rgba(141, 58, 22, 0.1);
`;

const InfoText = styled.p`
    margin: 8px 0 0;
    color: #211813;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.28;
    font-weight: 850;
`;

const BookingBox = styled.div`
    margin-top: 16px;
    border-radius: 24px;
    padding: 16px;
    background: linear-gradient(135deg, #7a2e16, #b65a26);
    color: #ffffff;
    box-shadow: 0 16px 32px rgba(122, 46, 22, 0.24);
`;

const BookingTitle = styled.h3`
    margin: 0 0 8px;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 950;
`;

const BookingText = styled.p`
    margin: 0 0 14px;
    color: rgba(255, 255, 255, 0.86);
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;
`;

const BookingButton = styled.button`
    width: 100%;
    min-height: 50px;
    border: 0;
    border-radius: 17px;
    background: #ffffff;
    color: #8d3a16;
    font-size: calc(17px * var(--app-font-scale));
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;

const FloatingActions = styled.div`
    position: fixed;
    right: max(16px, calc((100vw - 430px) / 2 + 16px));
    bottom: 100px;
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
    background: linear-gradient(135deg, #7a2e16, #b65a26);
    box-shadow: 0 14px 26px rgba(122, 46, 22, 0.28);
`;

const RestaurantPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const openRestaurant = async () => {
        try {
            await openWebView(RESTAURANT_URL);
        } catch {
            window.location.href = RESTAURANT_URL;
        }
    };

    const scrollToTop = () => {
        document.getElementById("restaurant-page")?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <RestaurantPageWrapper id="restaurant-page">
            <AppHeader
                back
                title="Nhà hàng"
                description="Gợi ý địa điểm ẩm thực tại Tây Ninh"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <RestaurantCard>
                    <RestaurantPhoto $image={restaurant.image}>
                        <TopBadge>
                            <Icon icon="zi-star-solid" size={16} />
                            Nhà hàng nổi bật
                        </TopBadge>

                        {!restaurant.image && (
                            <PhotoOverlay>
                                <PlaceholderIcon>
                                    <Icon icon="zi-home" size={44} />
                                </PlaceholderIcon>
                            </PhotoOverlay>
                        )}
                    </RestaurantPhoto>

                    <RestaurantBody>
                        <ChipRow>
                            <Chip>
                                <Icon icon="zi-location" size={16} />
                                Tây Ninh
                            </Chip>

                            <RatingChip>
                                <Icon icon="zi-star-solid" size={16} />
                                {restaurant.rating}
                            </RatingChip>
                        </ChipRow>

                        <RestaurantName>{restaurant.name}</RestaurantName>

                        <Address>
                            <Icon icon="zi-location" size={18} />
                            <span>{restaurant.address}</span>
                        </Address>

                        <Description>{restaurant.description}</Description>

                        <InfoGrid>
                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-home" size={18} />
                                </InfoIcon>
                                <InfoText>Không gian sang trọng</InfoText>
                            </InfoItem>

                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-calendar" size={18} />
                                </InfoIcon>
                                <InfoText>Phù hợp đặt tiệc</InfoText>
                            </InfoItem>

                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-location" size={18} />
                                </InfoIcon>
                                <InfoText>Ẩm thực Tây Ninh</InfoText>
                            </InfoItem>
                        </InfoGrid>
                    </RestaurantBody>
                </RestaurantCard>

                <BookingBox>
                    <BookingTitle>Xem thông tin nhà hàng</BookingTitle>

                    <BookingText>
                        Truy cập website chính thức để xem thực đơn, không gian,
                        dịch vụ đặt bàn và thông tin liên hệ của nhà hàng.
                    </BookingText>

                    <BookingButton onClick={openRestaurant} type="button">
                        Mở website nhà hàng
                        <Icon icon="zi-arrow-right" size={20} />
                    </BookingButton>
                </BookingBox>
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
        </RestaurantPageWrapper>
    );
};

export default RestaurantPage;
