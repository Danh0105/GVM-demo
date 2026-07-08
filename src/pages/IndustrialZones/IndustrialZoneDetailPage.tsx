import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@components/layout/AppHeader";
import Background from "@assets/background.png";
import { openWebView } from "@/services/zalo";
import {
    getIndustrialPark,
    type IndustrialPark,
} from "@/services/industrial-parks";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: #f7f8fa;
    color: #141d2d;
    padding: 112px 0 112px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 16px 24px;
`;

const HeroCard = styled.section`
    overflow: hidden;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(143, 153, 168, 0.1);
    box-shadow: 0 14px 28px rgba(18, 28, 45, 0.1);
`;

const HeroImage = styled.div<{ $image: string }>`
    height: 218px;
    background: url(${({ $image }) => $image}) center/cover;
    position: relative;
`;

const HeroOverlay = styled.div`
    position: absolute;
    inset: auto 0 0;
    padding: 44px 16px 16px;
    background: linear-gradient(
        180deg,
        rgba(20, 29, 45, 0) 0%,
        rgba(20, 29, 45, 0.78) 100%
    );
    color: #ffffff;
`;

const BadgeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
`;

const Badge = styled.span<{ $tone?: "red" | "green" | "white" }>`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    padding: 6px 11px;
    border-radius: 999px;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;

    color: ${({ $tone }) => {
        if ($tone === "green") return "#15944d";
        if ($tone === "red") return "#df1125";
        return "#ffffff";
    }};

    background: ${({ $tone }) => {
        if ($tone === "green") return "#eaf8ef";
        if ($tone === "red") return "#fde9ec";
        return "rgba(255, 255, 255, 0.18)";
    }};

    border: 1px solid
        ${({ $tone }) => {
            if ($tone === "green") return "#c9efd7";
            if ($tone === "red") return "#facbd2";
            return "rgba(255, 255, 255, 0.28)";
        }};

    backdrop-filter: blur(8px);
`;

const Title = styled.h1`
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
    border: 1px solid ${({ $primary }) => ($primary ? "#a40516" : "#ffe0e3")};
    border-radius: 16px;
    background: ${({ $primary }) =>
        $primary ? "linear-gradient(135deg, #a40516, #f0182c)" : "#fff5f6"};
    color: ${({ $primary }) => ($primary ? "#ffffff" : "#b20a1b")};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 950;
    box-shadow: ${({ $primary }) =>
        $primary ? "0 12px 22px rgba(168, 5, 22, 0.22)" : "none"};

    &:active {
        transform: scale(0.97);
    }

    &:disabled {
        opacity: 0.55;
    }
`;

const Section = styled.section`
    margin-top: 14px;
    padding: 17px;
    border-radius: 22px;
    background: #ffffff;
    border: 1px solid rgba(143, 153, 168, 0.1);
    box-shadow: 0 12px 25px rgba(18, 28, 45, 0.08);
`;

const SectionTitle = styled.h2`
    margin: 0 0 12px;
    color: #182132;
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
    color: #b20a1b;
    background: #fff0f2;
`;

const InfoContent = styled.div`
    min-width: 0;
`;

const InfoLabel = styled.div`
    color: #94a3b8;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;
    margin-bottom: 3px;
`;

const InfoValue = styled.div`
    color: #182132;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 850;
    word-break: break-word;
`;

const ProgressHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #64748b;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
`;

const ProgressTrack = styled.div`
    height: 9px;
    border-radius: 999px;
    background: #eef0f3;
    overflow: hidden;
    margin-top: 9px;
`;

const ProgressFill = styled.div<{ $value: number }>`
    width: ${({ $value }) => `${$value}%`};
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #e50920, #f0182c);
`;

const StateBox = styled.div`
    margin-top: 26px;
    padding: 30px 18px;
    border-radius: 22px;
    background: #ffffff;
    border: 1px solid rgba(143, 153, 168, 0.12);
    box-shadow: 0 12px 25px rgba(18, 28, 45, 0.08);
    text-align: center;
    color: #64748b;
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

function getZoneName(zone: IndustrialPark) {
    return getTextValue(zone.name) || "Khu công nghiệp";
}

function getZoneDescription(zone: IndustrialPark) {
    return (
        getTextValue(zone.description) ||
        "Thông tin giới thiệu khu công nghiệp đang được cập nhật."
    );
}

function getZoneStatus(zone: IndustrialPark) {
    return getTextValue(zone.status) || "Đang cập nhật";
}

function getZoneImage(zone: IndustrialPark) {
    return (
        getTextValue(zone.imageUrl) || getTextValue(zone.logoUrl) || Background
    );
}

function getZoneAddress(zone: IndustrialPark) {
    const parts = [
        getTextValue(zone.address),
        getTextValue(zone.ward),
        getTextValue(zone.district),
        getTextValue(zone.province),
    ].filter(Boolean);

    return parts.join(", ") || "Địa chỉ đang cập nhật";
}

function getZoneArea(zone: IndustrialPark) {
    const area = getTextValue(zone.area);

    if (!area) {
        return "Đang cập nhật";
    }

    return area.toLowerCase().includes("ha") ? area : `${area} ha`;
}

function getZoneOccupancy(zone: IndustrialPark) {
    const value = Number(zone.occupancyRate);

    if (Number.isNaN(value)) {
        return 0;
    }

    return Math.min(Math.max(value, 0), 100);
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

const IndustrialZoneDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [zone, setZone] = useState<IndustrialPark | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const occupancy = useMemo(
        () => (zone ? getZoneOccupancy(zone) : 0),
        [zone],
    );

    useEffect(() => {
        let active = true;

        async function loadDetail() {
            if (!id) {
                setError("Không tìm thấy mã khu công nghiệp.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getIndustrialPark(id);

                if (!active) {
                    return;
                }

                setZone(data);
            } catch (err) {
                if (!active) {
                    return;
                }

                setZone(null);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải chi tiết khu công nghiệp.",
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
        const phone = getTextValue(zone?.phone);

        if (!phone) {
            return;
        }

        window.location.href = `tel:${phone}`;
    };

    const handleOpenWebsite = () => {
        const website = normalizeWebsite(getTextValue(zone?.website));

        if (!website) {
            return;
        }

        openWebView(website);
    };

    return (
        <PageWrapper>
            <AppHeader
                back
                title="Chi tiết KCN"
                description="Thông tin khu công nghiệp, chủ đầu tư và liên hệ"
                onBack={() => navigate(-1)}
            />

            <Content>
                {loading ? (
                    <LoadingBox>
                        <Spinner />
                        Đang tải chi tiết khu công nghiệp...
                    </LoadingBox>
                ) : error ? (
                    <StateBox>{error}</StateBox>
                ) : zone ? (
                    <>
                        <HeroCard>
                            <HeroImage $image={getZoneImage(zone)}>
                                <HeroOverlay>
                                    <BadgeRow>
                                        <Badge $tone="white">
                                            Khu công nghiệp
                                        </Badge>

                                        <Badge $tone="green">
                                            {getZoneStatus(zone)}
                                        </Badge>
                                    </BadgeRow>

                                    <Title>{getZoneName(zone)}</Title>
                                </HeroOverlay>
                            </HeroImage>

                            <HeroBody>
                                <Description>
                                    {getZoneDescription(zone)}
                                </Description>

                                <ActionRow>
                                    <ActionButton
                                        type="button"
                                        $primary
                                        onClick={handleCall}
                                        disabled={!getTextValue(zone.phone)}
                                    >
                                        <Icon icon="zi-call" size={18} />
                                        Gọi liên hệ
                                    </ActionButton>

                                    <ActionButton
                                        type="button"
                                        onClick={handleOpenWebsite}
                                        disabled={!getTextValue(zone.website)}
                                    >
                                        <Icon icon="zi-link" size={18} />
                                        Website
                                    </ActionButton>
                                </ActionRow>
                            </HeroBody>
                        </HeroCard>

                        <Section>
                            <SectionTitle>Thông tin chung</SectionTitle>

                            <InfoGrid>
                                <InfoRow
                                    icon="zi-location"
                                    label="Địa chỉ"
                                    value={getZoneAddress(zone)}
                                />

                                <InfoRow
                                    icon="zi-home"
                                    label="Chủ đầu tư"
                                    value={getTextValue(zone.investor)}
                                />

                                <InfoRow
                                    icon="zi-note"
                                    label="Diện tích"
                                    value={getZoneArea(zone)}
                                />

                                <InfoRow
                                    icon="zi-call"
                                    label="Số điện thoại"
                                    value={getTextValue(zone.phone)}
                                />

                                <InfoRow
                                    icon="zi-message"
                                    label="Email"
                                    value={getTextValue(zone.email)}
                                />

                                <InfoRow
                                    icon="zi-link"
                                    label="Website"
                                    value={getTextValue(zone.website)}
                                />
                            </InfoGrid>
                        </Section>

                        <Section>
                            <SectionTitle>Tỉ lệ lấp đầy</SectionTitle>

                            <ProgressHeader>
                                <span>Mức độ khai thác</span>
                                <span>{occupancy}%</span>
                            </ProgressHeader>

                            <ProgressTrack>
                                <ProgressFill $value={occupancy} />
                            </ProgressTrack>
                        </Section>
                    </>
                ) : (
                    <StateBox>Không tìm thấy khu công nghiệp.</StateBox>
                )}
            </Content>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default IndustrialZoneDetailPage;
