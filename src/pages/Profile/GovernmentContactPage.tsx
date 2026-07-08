import AppHeader from "@components/layout/AppHeader";
import React, { FC } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";

type ContactAction = {
    label: string;
    value: string;
    href: string;
    icon: React.ComponentProps<typeof Icon>["icon"];
};

type ContactDetail = {
    label: string;
    value: string;
    icon: React.ComponentProps<typeof Icon>["icon"];
};

type ContactSection = {
    title: string;
    subtitle?: string;
    details: ContactDetail[];
    actions?: ContactAction[];
};

const SECTIONS: ContactSection[] = [
    {
        title: "Trung tâm Phục vụ Hành chính công tỉnh Tây Ninh",
        subtitle: "Hỗ trợ thủ tục hành chính",
        details: [
            {
                label: "Cơ sở 1",
                value: "Tầng 2, Khối nhà cơ quan 4, Khu trung tâm chính trị - hành chính tỉnh, số 2 đường Song Hành, phường Long An, TP Tây Ninh.",
                icon: "zi-location",
            },
            {
                label: "Cơ sở 2",
                value: "Số 83, đường Phạm Tung, phường Tân Ninh, TP Tây Ninh.",
                icon: "zi-location",
            },
            {
                label: "Thời gian",
                value: "Thứ 2 đến Thứ 6. Sáng: 7h00-11h30, Chiều: 13h30-17h00.",
                icon: "zi-clock-1",
            },
        ],
        actions: [
            {
                label: "Cơ sở 1",
                value: "(0272) 797579",
                href: "tel:0272797579",
                icon: "zi-call",
            },
            {
                label: "Cơ sở 2",
                value: "(0822) 540052",
                href: "tel:0822540052",
                icon: "zi-call",
            },
            {
                label: "Email",
                value: "hcc@tayninh.gov.vn",
                href: "mailto:hcc@tayninh.gov.vn",
                icon: "zi-chat",
            },
        ],
    },
    {
        title: "Văn phòng UBND tỉnh Tây Ninh",
        details: [
            {
                label: "Địa chỉ",
                value: "61 Nguyễn Huệ, phường Long An, TP Tây Ninh.",
                icon: "zi-location",
            },
        ],
        actions: [
            {
                label: "Điện thoại",
                value: "(02723) 838454",
                href: "tel:02723838454",
                icon: "zi-call",
            },
            {
                label: "Điện thoại",
                value: "(02723) 823810",
                href: "tel:02723823810",
                icon: "zi-call",
            },
            {
                label: "Email",
                value: "vpubnd@tayninh.gov.vn",
                href: "mailto:vpubnd@tayninh.gov.vn",
                icon: "zi-chat",
            },
        ],
    },
    {
        title: "Đường dây nóng cơ quan khác",
        details: [
            {
                label: "Công an tỉnh Tây Ninh",
                value: "Số 322, đường 30/4, phường Tân Ninh.",
                icon: "zi-location",
            },
            {
                label: "Cổng Thông tin điện tử tỉnh",
                value: "banbientap@tayninh.gov.vn",
                icon: "zi-chat",
            },
        ],
        actions: [
            {
                label: "Công an tỉnh",
                value: "0276.3822343",
                href: "tel:02763822343",
                icon: "zi-call",
            },
            {
                label: "Email Cổng TTĐT",
                value: "banbientap@tayninh.gov.vn",
                href: "mailto:banbientap@tayninh.gov.vn",
                icon: "zi-chat",
            },
        ],
    },
];

const ONLINE_CHANNELS: ContactAction[] = [
    {
        label: "Cổng thông tin điện tử",
        value: "tayninh.gov.vn",
        href: "https://tayninh.gov.vn",
        icon: "zi-link",
    },
    {
        label: "Cổng Dịch vụ công Quốc gia",
        value: "vpcp.dichvucong.gov.vn",
        href: "https://vpcp.dichvucong.gov.vn",
        icon: "zi-link",
    },
];

const ContactPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 16px 122px;
    background: #fbfbfc;
    color: #172033;
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const Content = styled.main`
    display: grid;
    gap: 16px;
`;

const IntroCard = styled.section`
    border: 1px solid rgba(0, 95, 168, 0.08);
    border-radius: 24px;
    padding: 18px;
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 14px;
    align-items: center;
    background: radial-gradient(
            circle at 86% 12%,
            rgba(0, 139, 210, 0.11),
            transparent 38%
        ),
        #ffffff;
    box-shadow: 0 12px 28px rgba(30, 35, 50, 0.09);
`;

const IntroIcon = styled.span`
    width: 52px;
    height: 52px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: #0063a7;
    background: #e6f7ff;
`;

const IntroTitle = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.18;
    font-weight: 950;
`;

const IntroText = styled.p`
    margin: 6px 0 0;
    color: #667085;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.38;
    font-weight: 650;
`;

const SectionCard = styled.section`
    border: 1px solid #e7e9ee;
    border-radius: 22px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(18, 28, 45, 0.07);
`;

const SectionHeader = styled.div`
    padding: 18px 18px 12px;
`;

const SectionTitle = styled.h3`
    margin: 0;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 950;
`;

const SectionSubtitle = styled.p`
    margin: 6px 0 0;
    color: #667085;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 750;
`;

const DetailList = styled.div`
    display: grid;
`;

const DetailRow = styled.div`
    min-height: 68px;
    padding: 14px 18px;
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 12px;
    align-items: start;
    border-top: 1px solid #eef0f3;
`;

const DetailIcon = styled.span`
    width: 40px;
    height: 40px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #667085;
    background: #f4f5f7;
`;

const DetailLabel = styled.div`
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 800;
`;

const DetailValue = styled.div`
    margin-top: 4px;
    color: #172033;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.42;
    font-weight: 700;
`;

const ActionGrid = styled.div`
    padding: 14px 18px 18px;
    display: grid;
    gap: 10px;
    border-top: 1px solid #eef0f3;
`;

const ActionLink = styled.a`
    min-height: 48px;
    border-radius: 16px;
    padding: 8px 12px;
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 10px;
    align-items: center;
    color: #0f5f95;
    background: #eef9ff;
    text-decoration: none;
`;

const ActionIcon = styled.span`
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: #0075b8;
`;

const ActionLabel = styled.div`
    color: #667085;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 800;
`;

const ActionValue = styled.div`
    margin-top: 2px;
    color: #0b4e7a;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.24;
    font-weight: 950;
    overflow-wrap: anywhere;
`;

const GovernmentContactPage: FC = () => {
    const navigate = useNavigate();

    return (
        <ContactPage id="government-contact-page">
            <AppHeader
                back
                title="Liên hệ chính quyền"
                description="Hotline, email và kênh hỗ trợ trực tuyến"
                onBack={() => navigate("/profile", { direction: "backward" })}
            />

            <Content>
                <IntroCard>
                    <IntroIcon>
                        <Icon icon="zi-call" size={28} />
                    </IntroIcon>
                    <div>
                        <IntroTitle>Thông tin hỗ trợ chính thức</IntroTitle>
                        <IntroText>
                            Liên hệ Trung tâm Phục vụ Hành chính công, Văn phòng
                            UBND tỉnh và các kênh trực tuyến của Tây Ninh.
                        </IntroText>
                    </div>
                </IntroCard>

                {SECTIONS.map(section => (
                    <SectionCard key={section.title}>
                        <SectionHeader>
                            <SectionTitle>{section.title}</SectionTitle>
                            {section.subtitle && (
                                <SectionSubtitle>
                                    {section.subtitle}
                                </SectionSubtitle>
                            )}
                        </SectionHeader>

                        <DetailList>
                            {section.details.map(detail => (
                                <DetailRow
                                    key={`${section.title}-${detail.label}`}
                                >
                                    <DetailIcon>
                                        <Icon icon={detail.icon} size={22} />
                                    </DetailIcon>
                                    <div>
                                        <DetailLabel>
                                            {detail.label}
                                        </DetailLabel>
                                        <DetailValue>
                                            {detail.value}
                                        </DetailValue>
                                    </div>
                                </DetailRow>
                            ))}
                        </DetailList>

                        {section.actions && (
                            <ActionGrid>
                                {section.actions.map(action => (
                                    <ActionLink
                                        key={`${section.title}-${action.value}`}
                                        href={action.href}
                                    >
                                        <ActionIcon>
                                            <Icon
                                                icon={action.icon}
                                                size={20}
                                            />
                                        </ActionIcon>
                                        <div>
                                            <ActionLabel>
                                                {action.label}
                                            </ActionLabel>
                                            <ActionValue>
                                                {action.value}
                                            </ActionValue>
                                        </div>
                                    </ActionLink>
                                ))}
                            </ActionGrid>
                        )}
                    </SectionCard>
                ))}

                <SectionCard>
                    <SectionHeader>
                        <SectionTitle>Các kênh trực tuyến</SectionTitle>
                        <SectionSubtitle>
                            Truy cập cổng thông tin và cổng dịch vụ công.
                        </SectionSubtitle>
                    </SectionHeader>
                    <ActionGrid>
                        {ONLINE_CHANNELS.map(channel => (
                            <ActionLink
                                key={channel.href}
                                href={channel.href}
                                rel="noreferrer"
                                target="_blank"
                            >
                                <ActionIcon>
                                    <Icon icon={channel.icon} size={20} />
                                </ActionIcon>
                                <div>
                                    <ActionLabel>{channel.label}</ActionLabel>
                                    <ActionValue>{channel.value}</ActionValue>
                                </div>
                            </ActionLink>
                        ))}
                    </ActionGrid>
                </SectionCard>
            </Content>
        </ContactPage>
    );
};

export default GovernmentContactPage;
