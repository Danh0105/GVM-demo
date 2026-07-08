import AppHeader from "@components/layout/AppHeader";
import React, { useState } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import { openWebview } from "zmp-sdk/apis";
import AppBottomNav from "@/components/layout/AppBottomNav";

type TelevisionChannel = {
    id: string;
    name: string;
    label: string;
    description: string;
    url: string;
};

const VTVGO_URL = "https://vtvgo.vn/";

const televisionChannels: TelevisionChannel[] = [
    {
        id: "vtv1",
        name: "VTV1",
        label: "THỜI SỰ",
        description:
            "Theo dõi tin tức, thời sự và các chương trình chính luận.",
        url: "https://vtvgo.vn/xem-truc-tuyen-kenh-VTV1-1.html",
    },
    {
        id: "vtv2",
        name: "VTV2",
        label: "GIÁO DỤC",
        description: "Chương trình khoa học, giáo dục, sức khỏe và đời sống.",
        url: "https://vtvgo.vn/channel/vtv2-1%2C2.html",
    },
    {
        id: "vtv3",
        name: "VTV3",
        label: "GIẢI TRÍ",
        description:
            "Phim truyền hình, gameshow, thể thao và chương trình giải trí.",
        url: "https://vtvgo.vn/channel/vtv3-1%2C3.html",
    },
    {
        id: "vtv5",
        name: "VTV5",
        label: "DÂN TỘC",
        description:
            "Tin tức, văn hóa và chương trình dành cho đồng bào dân tộc.",
        url: "https://vtvgo.vn/xem-truc-tuyen-kenh-vtv5-5.html",
    },
];

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 40px;
    color: #172033;
    background: radial-gradient(
            circle at 24px 140px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 260px, #f5f7fb 100%);
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
    background: linear-gradient(135deg, #00325f 0%, #004b86 52%, #008bd2 100%);
    box-shadow: 0 16px 34px rgba(0, 75, 134, 0.2);
`;

const HeroDecoration = styled.div`
    position: absolute;
    right: -38px;
    bottom: -44px;
    width: 170px;
    height: 170px;
    border: 24px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
`;

const TelevisionIcon = styled.div`
    width: 62px;
    height: 62px;
    display: grid;
    place-items: center;
    border: 2px solid rgba(255, 255, 255, 0.18);
    border-radius: 19px;
    background: rgba(255, 255, 255, 0.14);
`;

const HeroTitle = styled.h2`
    position: relative;
    margin: 18px 0 8px;
    font-size: calc(23px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 950;
`;

const HeroDescription = styled.p`
    position: relative;
    max-width: 320px;
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
    color: #005b9f;
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
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 18px;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(16px * var(--app-font-scale));
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
    color: #00558f;
    background: #e6f7ff;
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
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #005b9f;
    background: #e6f7ff;
`;

const ErrorMessage = styled.p`
    margin: 15px 4px 0;
    color: #005b9f;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.5;
    text-align: center;
`;

const Notice = styled.p`
    margin: 18px 4px 0;
    color: #8a93a2;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.55;
    text-align: center;
`;

const TelevisionPage: React.FC = () => {
    const navigate = useNavigate();
    const [openingUrl, setOpeningUrl] = useState("");
    const [error, setError] = useState("");

    const handleOpenWebview = async (url: string) => {
        try {
            setOpeningUrl(url);
            setError("");

            await openWebview({ url });
        } catch (err) {
            console.error("Không thể mở VTVgo trong WebView:", err);

            // Hỗ trợ kiểm tra khi chạy thử trên trình duyệt.
            const newWindow = window.open(url, "_blank");

            if (!newWindow) {
                setError(
                    "Không thể mở trang truyền hình. Vui lòng kiểm tra kết nối mạng và thử lại.",
                );
            }
        } finally {
            setOpeningUrl("");
        }
    };

    return (
        <PageWrapper id="television-page">
            <AppHeader
                back
                title="Truyền hình trực tuyến"
                description="Xem các kênh truyền hình, tin tức và chương trình địa phương"
                onBack={() => navigate(-1)}
            />
            <Content>
                <Hero>
                    <HeroDecoration />

                    <TelevisionIcon>
                        <Icon icon="zi-play" size={30} />
                    </TelevisionIcon>

                    <HeroTitle>Xem truyền hình cùng VTVgo</HeroTitle>

                    <HeroDescription>
                        Theo dõi các chương trình thời sự, giáo dục, giải trí và
                        thể thao trực tuyến trên hệ thống VTVgo.
                    </HeroDescription>

                    <MainButton
                        type="button"
                        disabled={Boolean(openingUrl)}
                        onClick={() => handleOpenWebview(VTVGO_URL)}
                    >
                        {openingUrl === VTVGO_URL
                            ? "Đang mở VTVgo..."
                            : "Mở trang VTVgo"}

                        {!openingUrl && (
                            <Icon icon="zi-chevron-right" size={19} />
                        )}
                    </MainButton>
                </Hero>

                <SectionHeader>
                    <SectionTitle>Chọn kênh nổi bật</SectionTitle>

                    <SectionDescription>
                        Nhấn vào kênh để mở truyền hình trực tuyến.
                    </SectionDescription>
                </SectionHeader>

                <ChannelList>
                    {televisionChannels.map(channel => (
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
                    Nội dung được mở từ nền tảng truyền hình trực tuyến VTVgo.
                </Notice>
            </Content>
            <AppBottomNav />
        </PageWrapper>
    );
};

export default TelevisionPage;
