import React from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import AppHeader from "@components/layout/AppHeader";
import AppBottomNav from "@/components/layout/AppBottomNav";
import { openWebView } from "@/services/zalo";

const TRANSPORT_BOOKING_URL = "https://thaokimngan.com/";

type TransportService = {
    id: string;
    name: string;
    location: string;
    description: string;
    rating: string;
    category: string;
    hotline: string;
    image?: string;
};

const transportService: TransportService = {
    id: "thao-kim-ngan",
    name: "Thảo Kim Ngân Limousine",
    location: "Tây Ninh - Hồ Chí Minh - Miền Tây - Vũng Tàu",
    description:
        "Dịch vụ vận chuyển hành khách và hàng hóa, hỗ trợ đặt vé online, nhiều tuyến xe kết nối Tây Ninh với Hồ Chí Minh, Cần Thơ, Kiên Giang và Vũng Tàu.",
    rating: "4.8",
    category: "Xe khách - Limousine",
    hotline: "1900 8153",
};

const TransportPageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: radial-gradient(
            circle at 24px 126px,
            rgba(0, 91, 159, 0.13),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 238px, #f4f7fb 100%);
    color: #172033;
    padding: 112px 0 28px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 12px 98px;
`;

const TransportCard = styled.article`
    border-radius: 28px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 20px 42px rgba(30, 35, 50, 0.13);
`;

const TransportPhoto = styled.div<{ $image?: string }>`
    position: relative;
    height: 250px;
    background: ${({ $image }) =>
        $image
            ? `linear-gradient(
                    180deg,
                    rgba(23, 32, 51, 0.02),
                    rgba(23, 32, 51, 0.24)
                ),
                url(${$image}) center/cover`
            : `linear-gradient(135deg, #005b9f 0%, #008bd2 52%, #5cc8f2 100%)`};
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
    box-shadow: 0 16px 34px rgba(0, 54, 98, 0.2);
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
    background: rgba(23, 32, 51, 0.36);
    backdrop-filter: blur(12px);
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
`;

const TransportBody = styled.div`
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
    background: rgba(230, 247, 255, 0.95);
    color: #00558f;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;
`;

const RatingChip = styled(Chip)`
    background: rgba(255, 247, 218, 0.95);
    color: #9a6500;
`;

const TransportName = styled.h2`
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
    min-height: 84px;
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

const HotlineButton = styled.a`
    width: 100%;
    min-height: 48px;
    margin-top: 10px;
    border-radius: 17px;
    color: #ffffff;
    text-decoration: none;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.24);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 850;
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

const TransportPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const openTransportBooking = async () => {
        try {
            await openWebView(TRANSPORT_BOOKING_URL);
        } catch {
            window.location.href = TRANSPORT_BOOKING_URL;
        }
    };

    const scrollToTop = () => {
        document.getElementById("transport-page")?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <TransportPageWrapper id="transport-page">
            <AppHeader
                back
                title="Di chuyển"
                description="Đặt vé xe và tra cứu tuyến di chuyển"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <TransportCard>
                    <TransportPhoto $image={transportService.image}>
                        <TopBadge>
                            <Icon icon="zi-star-solid" size={16} />
                            Nhà xe nổi bật
                        </TopBadge>

                        {!transportService.image && (
                            <PhotoOverlay>
                                <PlaceholderIcon>
                                    <Icon icon="zi-location" size={44} />
                                </PlaceholderIcon>
                            </PhotoOverlay>
                        )}
                    </TransportPhoto>

                    <TransportBody>
                        <ChipRow>
                            <Chip>
                                <Icon icon="zi-location" size={16} />
                                Tây Ninh
                            </Chip>

                            <RatingChip>
                                <Icon icon="zi-star-solid" size={16} />
                                {transportService.rating}
                            </RatingChip>
                        </ChipRow>

                        <TransportName>{transportService.name}</TransportName>

                        <Location>
                            <Icon icon="zi-location" size={18} />
                            <span>{transportService.location}</span>
                        </Location>

                        <Description>
                            {transportService.description}
                        </Description>

                        <InfoGrid>
                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-calendar" size={18} />
                                </InfoIcon>
                                <InfoText>Đặt vé online</InfoText>
                            </InfoItem>

                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-location" size={18} />
                                </InfoIcon>
                                <InfoText>Nhiều tuyến xe</InfoText>
                            </InfoItem>

                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-call" size={18} />
                                </InfoIcon>
                                <InfoText>Hỗ trợ hotline</InfoText>
                            </InfoItem>
                        </InfoGrid>
                    </TransportBody>
                </TransportCard>

                <BookingBox>
                    <BookingTitle>Đặt vé Thảo Kim Ngân</BookingTitle>

                    <BookingText>
                        Mở website chính thức để xem tuyến xe, giờ khởi hành,
                        giá vé và đặt vé trực tuyến.
                    </BookingText>

                    <BookingButton onClick={openTransportBooking} type="button">
                        Mở website đặt vé
                        <Icon icon="zi-arrow-right" size={20} />
                    </BookingButton>

                    <HotlineButton href="tel:19008153">
                        <Icon icon="zi-call" size={18} />
                        Gọi hotline {transportService.hotline}
                    </HotlineButton>
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
        </TransportPageWrapper>
    );
};

export default TransportPage;
