import React from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";
import { openWebView } from "@/services/zalo";
import AppHeader from "@components/layout/AppHeader";
import AppBottomNav from "@/components/layout/AppBottomNav";

const NATIONAL_PORTAL_URL = "https://dichvucong.gov.vn";

type QuickAction = {
    title: string;
    description: string;
    icon: React.ComponentProps<typeof Icon>["icon"];
    url: string;
};

const quickActions: QuickAction[] = [
    {
        title: "Nộp hồ sơ trực tuyến",
        description: "Thực hiện thủ tục hành chính trên Cổng DVC Quốc gia",
        icon: "zi-file",
        url: "https://dichvucong.bocongan.gov.vn/bocongan/bothutuc?muc_do=MUC_DO_3,MUC_DO_4",
    },
    {
        title: "Tra cứu hồ sơ",
        description: "Kiểm tra tiến độ xử lý và kết quả giải quyết hồ sơ",
        icon: "zi-search",
        url: "https://dichvucong.gov.vn/tra-cuu-ho-so",
    },
    {
        title: "Thanh toán trực tuyến",
        description: "Kết nối thanh toán phí, lệ phí và nghĩa vụ tài chính",
        icon: "zi-more-grid",
        url: "https://dichvucong.gov.vn/thanh-toan-truc-tuyen",
    },
    {
        title: "Phản ánh kiến nghị",
        description: "Gửi phản ánh về thủ tục, dịch vụ và quá trình xử lý",
        icon: "zi-chat",
        url: "https://dichvucong.gov.vn/nop-phan-anh-kien-nghi",
    },
];

const featuredServices = [
    "Đăng ký thường trú, tạm trú",
    "Cấp đổi căn cước công dân",
    "Đăng ký kinh doanh hộ cá thể",
    "Cấp giấy xác nhận tình trạng hôn nhân",
];

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: radial-gradient(
            circle at 30px 132px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 250px, #f5f7fb 100%);
    color: #172033;
    padding: 112px 0 32px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 14px 12px 112px;
`;

const HeroCard = styled.section`
    border-radius: 26px;
    padding: 22px 20px;
    color: #ffffff;
    background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.16),
            transparent 34%
        ),
        linear-gradient(135deg, #00325f 0%, #004b86 52%, #008bd2 100%);
    box-shadow: 0 20px 38px rgba(0, 75, 134, 0.2);
`;

const HeroEyebrow = styled.div`
    width: fit-content;
    border-radius: 999px;
    padding: 7px 12px;
    background: rgba(255, 255, 255, 0.16);
    color: #d9f2ff;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 850;
`;

const HeroTitle = styled.h2`
    margin: 16px 0 10px;
    font-size: calc(27px * var(--app-font-scale));
    line-height: 1.14;
    font-weight: 980;
`;

const HeroText = styled.p`
    margin: 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.45;
`;

const PrimaryButton = styled.button`
    width: 100%;
    height: 54px;
    margin-top: 18px;
    border: 0;
    border-radius: 17px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #005b9f;
    background: #e6f7ff;
    font-size: calc(17px * var(--app-font-scale));
    font-weight: 900;
    box-shadow: 0 12px 22px rgba(41, 4, 9, 0.2);
`;

const SearchBox = styled.label`
    height: 56px;
    margin-top: 14px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(30, 35, 50, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 18px;
    color: #98a2b3;
`;

const SearchInput = styled.input`
    width: 100%;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: #172033;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 500;

    &::placeholder {
        color: #8e96a3;
    }
`;

const SectionTitle = styled.h2`
    margin: 24px 4px 14px;
    color: #172033;
    font-size: calc(23px * var(--app-font-scale));
    line-height: 1.15;
    font-weight: 950;
`;

const ActionGrid = styled.div`
    display: grid;
    gap: 12px;
`;

const ActionCard = styled.button`
    min-height: 112px;
    border: 0;
    border-radius: 22px;
    background: #ffffff;
    display: grid;
    grid-template-columns: 54px 1fr 22px;
    gap: 14px;
    align-items: center;
    padding: 16px;
    text-align: left;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
`;

const ActionIcon = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: #0063a7;
    background: radial-gradient(
            circle at 35% 25%,
            rgba(255, 255, 255, 0.9),
            transparent 22%
        ),
        linear-gradient(135deg, #f7fcff, #e4f3ff);
`;

const ActionTitle = styled.h3`
    margin: 0;
    color: #172033;
    font-size: calc(19px * var(--app-font-scale));
    line-height: 1.28;
    font-weight: 930;
`;

const ActionDescription = styled.p`
    margin: 7px 0 0;
    color: #737c89;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.35;
`;

const Arrow = styled.div`
    color: #a3abb5;
    display: grid;
    place-items: center;
`;

const ServiceList = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
`;

const ServiceCard = styled.button`
    min-height: 104px;
    border: 0;
    border-radius: 20px;
    padding: 16px;
    color: #172033;
    background: #ffffff;
    text-align: left;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 860;
    box-shadow: 0 14px 28px rgba(30, 35, 50, 0.09);
`;

const NoteCard = styled.section`
    margin-top: 18px;
    border-radius: 22px;
    padding: 18px;
    background: #f0f9ff;
    color: #00558f;
    border: 1px solid rgba(0, 95, 168, 0.14);
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.45;
`;

const PublicServicesPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const openNationalPortal = async () => {
        try {
            await openWebView(NATIONAL_PORTAL_URL);
        } catch (err) {
            window.location.href = NATIONAL_PORTAL_URL;
        }
    };
    const openUrl = async (url: string) => {
        try {
            await openWebView(url);
        } catch {
            window.location.href = url;
        }
    };
    return (
        <PageWrapper id="public-services-page">
            <AppHeader
                back
                title="Dịch vụ công"
                description="Tra cứu và thực hiện thủ tục hành chính trực tuyến"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <HeroCard>
                    <HeroEyebrow>CỔNG DỊCH VỤ CÔNG QUỐC GIA</HeroEyebrow>
                    <HeroTitle>
                        Một điểm truy cập cho dịch vụ công trực tuyến
                    </HeroTitle>
                    <HeroText>
                        Kết nối người dân với Cổng DVC Quốc gia để nộp hồ sơ,
                        tra cứu tiến độ, thanh toán và gửi phản ánh kiến nghị.
                    </HeroText>
                    <PrimaryButton onClick={openNationalPortal}>
                        Mở cổng dichvucong.gov.vn
                        <Icon icon="zi-arrow-right" size={22} />
                    </PrimaryButton>
                </HeroCard>

                <SearchBox>
                    <Icon icon="zi-search" size={26} />
                    <SearchInput placeholder="Tìm thủ tục, hồ sơ, dịch vụ..." />
                </SearchBox>

                <SectionTitle>Thao tác nhanh</SectionTitle>
                <ActionGrid>
                    {quickActions.map(action => (
                        <ActionCard
                            key={action.title}
                            onClick={() => openUrl(action.url)}
                        >
                            <ActionIcon>
                                <Icon icon={action.icon} size={27} />
                            </ActionIcon>

                            <div>
                                <ActionTitle>{action.title}</ActionTitle>
                                <ActionDescription>
                                    {action.description}
                                </ActionDescription>
                            </div>

                            <Arrow>
                                <Icon icon="zi-chevron-right" size={24} />
                            </Arrow>
                        </ActionCard>
                    ))}
                </ActionGrid>

                <SectionTitle>Dịch vụ thường dùng</SectionTitle>
                <ServiceList>
                    {featuredServices.map(service => (
                        <ServiceCard key={service} onClick={openNationalPortal}>
                            {service}
                        </ServiceCard>
                    ))}
                </ServiceList>

                <NoteCard>
                    Khi mở cổng quốc gia, người dân đăng nhập bằng tài khoản
                    định danh điện tử hoặc tài khoản đã đăng ký trên Cổng DVC
                    Quốc gia để thực hiện thủ tục.
                </NoteCard>
            </Content>
            <AppBottomNav />
        </PageWrapper>
    );
};

export default PublicServicesPage;
