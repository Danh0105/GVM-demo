import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@components/layout/AppHeader";
import Background from "@assets/background.png";
import { getBusiness, type Business } from "@/services/businesses";
import { openWebView } from "@/services/zalo";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: #f7f5f2;
    color: #172033;
    padding: 112px 0 96px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 14px 24px;
`;

const HeroCard = styled.section`
    overflow: hidden;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 14px 30px rgba(30, 35, 50, 0.08);
`;

const HeroImage = styled.div<{ $image: string }>`
    height: 210px;
    background: url(${({ $image }) => $image}) center/cover;
    position: relative;
`;

const HeroOverlay = styled.div`
    position: absolute;
    inset: auto 0 0;
    padding: 44px 16px 16px;
    color: #ffffff;
    background: linear-gradient(
        180deg,
        rgba(18, 24, 40, 0) 0%,
        rgba(18, 24, 40, 0.78) 100%
    );
`;

const BadgeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
`;

const Badge = styled.span<{ $tone: "red" | "green" | "white" }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 7px 11px;
    border-radius: 999px;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;

    color: ${({ $tone }) => {
        if ($tone === "red") return "#bb1b24";
        if ($tone === "green") return "#146c32";
        return "#ffffff";
    }};

    background: ${({ $tone }) => {
        if ($tone === "red") return "rgba(255, 226, 228, 0.95)";
        if ($tone === "green") return "rgba(220, 248, 220, 0.95)";
        return "rgba(255, 255, 255, 0.18)";
    }};

    border: 1px solid
        ${({ $tone }) => {
            if ($tone === "red") return "#ffd1d6";
            if ($tone === "green") return "#c7efcf";
            return "rgba(255, 255, 255, 0.28)";
        }};

    backdrop-filter: blur(8px);
`;

const HeroTitle = styled.h1`
    margin: 0;
    color: #ffffff;
    font-size: calc(23px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 950;
`;

const HeroBody = styled.div`
    padding: 16px;
    display: grid;
    gap: 13px;
`;

const Description = styled.p`
    margin: 0;
    color: #526173;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.65;
    white-space: pre-line;
`;

const ActionRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
    min-height: 48px;
    border: 1px solid ${({ $primary }) => ($primary ? "#bb1b24" : "#ffe0e3")};
    border-radius: 16px;
    background: ${({ $primary }) =>
        $primary ? "linear-gradient(135deg, #a40516, #f0182c)" : "#fff5f6"};
    color: ${({ $primary }) => ($primary ? "#ffffff" : "#bb1b24")};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 950;

    &:active {
        transform: scale(0.97);
    }

    &:disabled {
        opacity: 0.5;
    }
`;

const Section = styled.section`
    margin-top: 14px;
    padding: 17px;
    border-radius: 22px;
    background: #ffffff;
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 14px 30px rgba(30, 35, 50, 0.07);
`;

const SectionTitle = styled.h2`
    margin: 0 0 12px;
    color: #121828;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 950;
`;

const InfoGrid = styled.div`
    display: grid;
    gap: 10px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
    border-radius: 16px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
`;

const InfoIcon = styled.div`
    width: 36px;
    height: 36px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    color: #bb1b24;
    background: #fff0f2;
`;

const InfoContent = styled.div`
    min-width: 0;
`;

const InfoLabel = styled.div`
    color: #98a2b3;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;
    margin-bottom: 3px;
`;

const InfoValue = styled.div`
    color: #172033;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 850;
    word-break: break-word;
`;

const StateBox = styled.div`
    margin-top: 26px;
    padding: 30px 18px;
    border-radius: 22px;
    background: #ffffff;
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 14px 30px rgba(30, 35, 50, 0.07);
    text-align: center;
    color: #667085;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.5;
`;

const LoadingBox = styled(StateBox)`
    display: grid;
    gap: 12px;
    place-items: center;
`;

function getTextValue(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (typeof value === "object" && value !== null) {
        const data = value as {
            name?: unknown;
            title?: unknown;
            label?: unknown;
            value?: unknown;
            description?: unknown;
        };

        if (typeof data.name === "string") return data.name;
        if (typeof data.title === "string") return data.title;
        if (typeof data.label === "string") return data.label;
        if (typeof data.value === "string") return data.value;
        if (typeof data.description === "string") return data.description;
    }

    return "";
}

function getBusinessName(item: Business) {
    return getTextValue(item.name) || "Doanh nghiệp";
}

function getBusinessStatus(item: Business) {
    return getTextValue(item.status) || "Đang cập nhật";
}

function getBusinessCategory(item: Business) {
    return (
        getTextValue(item.field) ||
        getTextValue(item.industry) ||
        "Doanh nghiệp"
    );
}

function getBusinessDescription(item: Business) {
    return (
        getTextValue(item.description) ||
        getTextValue(item.industry) ||
        getTextValue(item.field) ||
        "Thông tin doanh nghiệp đang được cập nhật."
    );
}

function getBusinessAddress(item: Business) {
    const parts = [
        getTextValue(item.address),
        getTextValue(item.ward),
        getTextValue(item.district),
        getTextValue(item.province),
    ].filter(Boolean);

    return parts.join(", ") || "Địa chỉ đang cập nhật";
}

function getBusinessImage(item: Business) {
    return (
        getTextValue(item.imageUrl) || getTextValue(item.logoUrl) || Background
    );
}

function normalizeWebsite(value: string) {
    if (!value) {
        return "";
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    return `https://${value}`;
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value?: string | number | null;
}) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    return (
        <InfoItem>
            <InfoIcon>
                <Icon icon={icon} size={18} />
            </InfoIcon>

            <InfoContent>
                <InfoLabel>{label}</InfoLabel>
                <InfoValue>{value}</InfoValue>
            </InfoContent>
        </InfoItem>
    );
}

const BusinessDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadDetail() {
            if (!id) {
                setError("Không tìm thấy mã doanh nghiệp.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getBusiness(id);

                if (!active) {
                    return;
                }

                setBusiness(data);
            } catch (err) {
                if (!active) {
                    return;
                }

                setBusiness(null);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải chi tiết doanh nghiệp.",
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadDetail();

        return () => {
            active = false;
        };
    }, [id]);

    const handleCall = () => {
        const phone = getTextValue(business?.phone);

        if (!phone) {
            return;
        }

        window.location.href = `tel:${phone}`;
    };

    const handleOpenWebsite = () => {
        const website = normalizeWebsite(getTextValue(business?.website));

        if (!website) {
            return;
        }

        openWebView(website);
    };
    const renderContent = () => {
        if (loading) {
            return (
                <LoadingBox>
                    <Spinner />
                    Đang tải chi tiết doanh nghiệp...
                </LoadingBox>
            );
        }

        if (error) {
            return <StateBox>{error}</StateBox>;
        }

        if (!business) {
            return <StateBox>Không tìm thấy doanh nghiệp.</StateBox>;
        }

        return (
            <>
                <HeroCard>
                    <HeroImage $image={getBusinessImage(business)}>
                        <HeroOverlay>
                            <BadgeRow>
                                <Badge $tone="white">
                                    {getBusinessCategory(business)}
                                </Badge>

                                <Badge $tone="green">
                                    {getBusinessStatus(business)}
                                </Badge>
                            </BadgeRow>

                            <HeroTitle>{getBusinessName(business)}</HeroTitle>
                        </HeroOverlay>
                    </HeroImage>

                    <HeroBody>
                        <Description>
                            {getBusinessDescription(business)}
                        </Description>

                        <ActionRow>
                            <ActionButton
                                type="button"
                                $primary
                                onClick={handleCall}
                                disabled={!getTextValue(business.phone)}
                            >
                                <Icon icon="zi-call" size={18} />
                                Gọi liên hệ
                            </ActionButton>

                            <ActionButton
                                type="button"
                                onClick={handleOpenWebsite}
                                disabled={!getTextValue(business.website)}
                            >
                                <Icon icon="zi-link" size={18} />
                                Website
                            </ActionButton>
                        </ActionRow>
                    </HeroBody>
                </HeroCard>

                <Section>
                    <SectionTitle>Thông tin doanh nghiệp</SectionTitle>

                    <InfoGrid>
                        <InfoRow
                            icon="zi-location"
                            label="Địa chỉ"
                            value={getBusinessAddress(business)}
                        />

                        <InfoRow
                            icon="zi-note"
                            label="Ngành nghề / lĩnh vực"
                            value={getBusinessCategory(business)}
                        />

                        <InfoRow
                            icon="zi-user"
                            label="Người đại diện"
                            value={getTextValue(business.representative)}
                        />

                        <InfoRow
                            icon="zi-file"
                            label="Mã số thuế"
                            value={getTextValue(business.taxCode)}
                        />

                        <InfoRow
                            icon="zi-call"
                            label="Số điện thoại"
                            value={getTextValue(business.phone)}
                        />

                        <InfoRow
                            icon="zi-message"
                            label="Email"
                            value={getTextValue(business.email)}
                        />

                        <InfoRow
                            icon="zi-link"
                            label="Website"
                            value={getTextValue(business.website)}
                        />

                        <InfoRow
                            icon="zi-check-circle"
                            label="Trạng thái"
                            value={getBusinessStatus(business)}
                        />
                    </InfoGrid>
                </Section>

                <Section>
                    <SectionTitle>Giới thiệu</SectionTitle>
                    <Description>
                        {getBusinessDescription(business)}
                    </Description>
                </Section>
            </>
        );
    };
    return (
        <PageWrapper>
            <AppHeader
                back
                title="Chi tiết doanh nghiệp"
                description="Thông tin doanh nghiệp, ngành nghề và liên hệ"
                onBack={() => navigate(-1)}
            />

            <Content>{renderContent()}</Content>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default BusinessDetailPage;
