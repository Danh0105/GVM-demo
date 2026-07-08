import React from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import AppHeader from "@components/layout/AppHeader";
import AppBottomNav from "@/components/layout/AppBottomNav";
import { openWebView } from "@/services/zalo";

const HOTEL_BOOKING_URL = "https://www.traveloka.com/vi-vn/hotel";

type Hotel = {
    id: string;
    name: string;
    location: string;
    description: string;
    rating: string;
    priceLabel: string;
    image?: string;
};

const hotel: Hotel = {
    id: "tay-ninh-hotel",
    name: "Khách sạn trung tâm Tây Ninh",
    location: "Thành phố Tây Ninh, Tỉnh Tây Ninh",
    description:
        "Gợi ý lưu trú thuận tiện cho du khách khi tham quan Núi Bà Đen, Tòa Thánh Cao Đài và các điểm đến nổi bật tại Tây Ninh.",
    rating: "4.5",
    priceLabel: "Xem giá phòng trên Traveloka",
};

const HotelPageWrapper = styled(Page)`
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
    padding: 112px 0 28px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 12px 98px;
`;

const HeroCard = styled.article`
    border-radius: 28px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 20px 42px rgba(30, 35, 50, 0.13);
`;

const HotelPhoto = styled.div<{ $image?: string }>`
    position: relative;
    height: 248px;
    background: ${({ $image }) =>
        $image
            ? `linear-gradient(
                    180deg,
                    rgba(23, 32, 51, 0.02),
                    rgba(23, 32, 51, 0.2)
                ),
                url(${$image}) center/cover`
            : `linear-gradient(135deg, #005b9f 0%, #008bd2 52%, #62c6f2 100%)`};
`;

const HotelPhotoOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const HotelPlaceholder = styled.div`
    width: 94px;
    height: 94px;
    border-radius: 30px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.28);
    box-shadow: 0 16px 34px rgba(0, 54, 98, 0.18);
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
    background: rgba(23, 32, 51, 0.34);
    backdrop-filter: blur(12px);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
`;

const HotelBody = styled.div`
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
    background: rgba(230, 247, 255, 0.92);
    color: #00558f;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;
`;

const RatingChip = styled(Chip)`
    background: rgba(255, 246, 221, 0.95);
    color: #9a6500;
`;

const HotelName = styled.h2`
    margin: 15px 0 10px;
    font-size: calc(27px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 950;
    color: #172033;
`;

const Location = styled.p`
    margin: 0 0 12px;
    display: flex;
    align-items: flex-start;
    gap: 7px;
    color: #647084;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.42;
    font-weight: 750;
`;

const Description = styled.p`
    margin: 0;
    color: #707987;
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
    background: #f5f9ff;
    border: 1px solid rgba(0, 91, 159, 0.08);
`;

const InfoIcon = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #005b9f;
    background: rgba(0, 91, 159, 0.1);
`;

const InfoText = styled.p`
    margin: 8px 0 0;
    color: #172033;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.28;
    font-weight: 850;
`;

const BookingBox = styled.div`
    margin-top: 16px;
    border-radius: 24px;
    padding: 16px;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    color: #ffffff;
    box-shadow: 0 16px 32px rgba(0, 91, 159, 0.22);
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
    color: #005b9f;
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

const HotelPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const openHotelBooking = async () => {
        try {
            await openWebView(HOTEL_BOOKING_URL);
        } catch {
            window.location.href = HOTEL_BOOKING_URL;
        }
    };

    const scrollToTop = () => {
        document.getElementById("hotel-page")?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <HotelPageWrapper id="hotel-page">
            <AppHeader
                back
                title="Khách sạn"
                description="Gợi ý lưu trú và đặt phòng trực tuyến"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <HeroCard>
                    <HotelPhoto $image={hotel.image}>
                        <TopBadge>
                            <Icon icon="zi-star-solid" size={16} />
                            Gợi ý lưu trú
                        </TopBadge>

                        {!hotel.image && (
                            <HotelPhotoOverlay>
                                <HotelPlaceholder>
                                    <Icon icon="zi-home" size={44} />
                                </HotelPlaceholder>
                            </HotelPhotoOverlay>
                        )}
                    </HotelPhoto>

                    <HotelBody>
                        <ChipRow>
                            <Chip>
                                <Icon icon="zi-location" size={16} />
                                Tây Ninh
                            </Chip>

                            <RatingChip>
                                <Icon icon="zi-star-solid" size={16} />
                                {hotel.rating}
                            </RatingChip>
                        </ChipRow>

                        <HotelName>{hotel.name}</HotelName>

                        <Location>
                            <Icon icon="zi-location" size={18} />
                            <span>{hotel.location}</span>
                        </Location>

                        <Description>{hotel.description}</Description>

                        <InfoGrid>
                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-home" size={18} />
                                </InfoIcon>
                                <InfoText>Phòng nghỉ tiện nghi</InfoText>
                            </InfoItem>

                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-calendar" size={18} />
                                </InfoIcon>
                                <InfoText>Đặt phòng nhanh</InfoText>
                            </InfoItem>

                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-location" size={18} />
                                </InfoIcon>
                                <InfoText>Gần điểm tham quan</InfoText>
                            </InfoItem>
                        </InfoGrid>
                    </HotelBody>
                </HeroCard>

                <BookingBox>
                    <BookingTitle>{hotel.priceLabel}</BookingTitle>

                    <BookingText>
                        Mở Traveloka để xem danh sách khách sạn, giá phòng, đánh
                        giá và đặt phòng phù hợp với lịch trình của bạn.
                    </BookingText>

                    <BookingButton onClick={openHotelBooking} type="button">
                        Đặt phòng trên Traveloka
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
        </HotelPageWrapper>
    );
};

export default HotelPage;
