import AppHeader from "@components/layout/AppHeader";
import React, { useState } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import { openWebview } from "zmp-sdk/apis";
import AppBottomNav from "@/components/layout/AppBottomNav";

type RadioChannel = {
    id: string;
    name: string;
    description: string;
    url: string;
    label: string;
};

const VOV_RADIO_URL = "https://vov.vn/vov-plus/radio";

const channels: RadioChannel[] = [
    {
        id: "vov1",
        name: "VOV1",
        label: "THỜI SỰ",
        description: "Thời sự, chính trị, kinh tế và các vấn đề xã hội.",
        url: "https://vov1.vov.vn/",
    },
    {
        id: "vov2",
        name: "VOV2",
        label: "VĂN HÓA",
        description: "Văn hóa, đời sống xã hội và các chương trình cộng đồng.",
        url: "https://vov2.vov.vn/",
    },
    {
        id: "vov3",
        name: "VOV3",
        label: "ÂM NHẠC",
        description: "Âm nhạc, giải trí và các chương trình phát thanh trẻ.",
        url: "https://vov3.vov.vn/",
    },
    {
        id: "vov4",
        name: "VOV4",
        label: "DÂN TỘC",
        description: "Chương trình dành cho đồng bào các dân tộc Việt Nam.",
        url: "https://vov4.vov.vn/",
    },
    {
        id: "vov5",
        name: "VOV5",
        label: "ĐỐI NGOẠI",
        description: "Tin tức và chương trình phát thanh đối ngoại.",
        url: "https://vovworld.vn/",
    },
    {
        id: "vov6",
        name: "VOV6",
        label: "VĂN HỌC",
        description: "Các chương trình văn học, nghệ thuật và âm thanh.",
        url: "https://vov6.vov.vn/",
    },
    {
        id: "vov-gt",
        name: "VOV GT",
        label: "GIAO THÔNG",
        description: "Thông tin giao thông, đô thị và hành trình di chuyển.",
        url: "https://vovgiaothong.vn/",
    },
];

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 40px;
    color: #172033;
    background: linear-gradient(180deg, #f7f7f7 0%, #ffffff 100%);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 18px 16px 24px;
`;

const Hero = styled.section`
    position: relative;
    padding: 22px 18px;
    overflow: hidden;
    border-radius: 24px;
    color: #ffffff;
    background: linear-gradient(135deg, #8d0713 0%, #d31326 100%);
    box-shadow: 0 16px 34px rgba(182, 15, 31, 0.2);
`;

const HeroDecoration = styled.div`
    position: absolute;
    right: -24px;
    bottom: -36px;
    width: 150px;
    height: 150px;
    border: 22px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
`;

const HeroTitle = styled.h2`
    position: relative;
    margin: 18px 0 8px;
    font-size: calc(23px * var(--app-font-scale));
    font-weight: 950;
`;

const HeroDescription = styled.p`
    position: relative;
    max-width: 315px;
    margin: 0;
    color: rgba(255, 255, 255, 0.88);
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.6;
`;

const MainButton = styled.button`
    position: relative;
    width: 100%;
    margin-top: 18px;
    padding: 14px 16px;
    border: 0;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #a40818;
    background: #ffffff;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 900;
    cursor: pointer;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.7;
    }
`;

const SectionHeader = styled.div`
    margin: 25px 2px 14px;
`;

const SectionTitle = styled.h3`
    margin: 0;
    color: #20283a;
    font-size: calc(20px * var(--app-font-scale));
    font-weight: 950;
`;

const SectionDescription = styled.p`
    margin: 5px 0 0;
    color: #808899;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.5;
`;

const ChannelList = styled.div`
    display: grid;
    gap: 13px;
`;

const ChannelCard = styled.button`
    width: 100%;
    padding: 16px;
    border: 1px solid rgba(228, 232, 240, 0.9);
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    color: inherit;
    background: #ffffff;
    box-shadow: 0 12px 24px rgba(50, 63, 88, 0.07);
    text-align: left;
    cursor: pointer;
    transition: transform 0.16s ease, box-shadow 0.16s ease;

    &:active {
        transform: scale(0.985);
        box-shadow: 0 7px 18px rgba(50, 63, 88, 0.06);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.68;
    }
`;

const ChannelLogo = styled.div`
    width: 58px;
    height: 58px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 18px;
    color: #ffffff;
    background: linear-gradient(135deg, #a40717, #e11f32);
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 950;
    letter-spacing: -0.4px;
`;

const ChannelContent = styled.div`
    flex: 1;
    min-width: 0;
`;

const ChannelTopRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const ChannelName = styled.h4`
    margin: 0;
    color: #20283a;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 950;
`;

const ChannelLabel = styled.span`
    padding: 4px 7px;
    border-radius: 999px;
    color: #a40717;
    background: #ffeeec;
    font-size: calc(10px * var(--app-font-scale));
    font-weight: 900;
`;

const ChannelDescription = styled.p`
    margin: 6px 0 0;
    overflow: hidden;
    color: #747e90;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.45;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const PlayButton = styled.span`
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #b60919;
    background: #ffeeec;
`;

const Notice = styled.p`
    margin: 18px 4px 0;
    color: #8a93a2;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.55;
    text-align: center;
`;

const ErrorMessage = styled.p`
    margin: 14px 0 0;
    color: #b60919;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.5;
    text-align: center;
`;

const RadioPage: React.FC = () => {
    const navigate = useNavigate();
    const [openingUrl, setOpeningUrl] = useState("");
    const [error, setError] = useState("");

    const handleOpenWebview = async (url: string) => {
        try {
            setOpeningUrl(url);
            setError("");

            await openWebview({ url });
        } catch (err) {
            console.error("Không thể mở trang radio:", err);

            setError(
                "Không thể mở kênh radio. Vui lòng kiểm tra kết nối mạng và thử lại.",
            );
        } finally {
            setOpeningUrl("");
        }
    };

    return (
        <PageWrapper id="radio-page">
            <AppHeader
                back
                title="Radio trực tuyến"
                onBack={() => navigate(-1)}
            />
            <Content>
                <Hero>
                    <HeroDecoration />

                    <PlayButton>
                        <Icon icon="zi-play" size={18} />
                    </PlayButton>

                    <HeroTitle>Nghe Đài Tiếng nói Việt Nam</HeroTitle>

                    <HeroDescription>
                        Theo dõi radio, thời sự, âm nhạc và thông tin giao thông
                        trực tuyến từ hệ thống VOV.
                    </HeroDescription>

                    <MainButton
                        type="button"
                        disabled={Boolean(openingUrl)}
                        onClick={() => handleOpenWebview(VOV_RADIO_URL)}
                    >
                        {openingUrl === VOV_RADIO_URL
                            ? "Đang mở VOV Radio..."
                            : "Mở trang VOV Radio"}

                        {!openingUrl && (
                            <Icon icon="zi-chevron-right" size={19} />
                        )}
                    </MainButton>
                </Hero>

                <SectionHeader>
                    <SectionTitle>Chọn kênh radio</SectionTitle>
                    <SectionDescription>
                        Nhấn vào kênh để mở trang nghe trực tuyến.
                    </SectionDescription>
                </SectionHeader>

                <ChannelList>
                    {channels.map(channel => (
                        <ChannelCard
                            type="button"
                            key={channel.id}
                            disabled={Boolean(openingUrl)}
                            onClick={() => handleOpenWebview(channel.url)}
                        >
                            <ChannelLogo>{channel.name}</ChannelLogo>

                            <ChannelContent>
                                <ChannelTopRow>
                                    <ChannelName>{channel.name}</ChannelName>
                                    <ChannelLabel>{channel.label}</ChannelLabel>
                                </ChannelTopRow>

                                <ChannelDescription>
                                    {channel.description}
                                </ChannelDescription>
                            </ChannelContent>

                            <PlayButton>
                                <Icon icon="zi-play" size={18} />
                            </PlayButton>
                        </ChannelCard>
                    ))}
                </ChannelList>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Notice>
                    Nội dung được mở từ hệ thống chính thức của Đài Tiếng nói
                    Việt Nam.
                </Notice>
            </Content>
            <AppBottomNav />
        </PageWrapper>
    );
};

export default RadioPage;
