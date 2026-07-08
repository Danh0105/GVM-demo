import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@components/layout/AppHeader";
import {
    getIndustrialParks,
    type IndustrialPark,
} from "@/services/industrial-parks";
import Background from "@assets/background.png";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";
import { openWebView } from "@/services/zalo";

const DEFAULT_ZONE_IMAGE = Background;

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: linear-gradient(180deg, #f5f7fb 0%, #eef2f7 100%);
    color: #162033;
    padding: 112px 0 112px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 16px;
`;

const IntroCard = styled.section`
    position: relative;
    overflow: hidden;
    border-radius: 26px;
    padding: 18px;
    margin-bottom: 14px;
    color: #ffffff;
    background: radial-gradient(
            circle at top right,
            rgba(255, 255, 255, 0.24),
            transparent 34%
        ),
        linear-gradient(135deg, #8f0715 0%, #c90f24 48%, #e32837 100%);
    box-shadow: 0 18px 34px rgba(166, 9, 25, 0.24);
`;

const IntroEyebrow = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 30px;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    color: rgba(255, 255, 255, 0.92);
    font-size: calc(12px * var(--app-font-scale, 1));
    font-weight: 800;
`;

const IntroTitle = styled.h1`
    margin: 14px 0 8px;
    font-size: calc(22px * var(--app-font-scale, 1));
    line-height: 1.22;
    font-weight: 950;
    letter-spacing: -0.35px;
`;

const IntroDesc = styled.p`
    margin: 0;
    max-width: 330px;
    color: rgba(255, 255, 255, 0.82);
    font-size: calc(14px * var(--app-font-scale, 1));
    line-height: 1.5;
    font-weight: 600;
`;

const IntroStats = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 9px;
    margin-top: 16px;
`;

const StatItem = styled.div`
    min-height: 66px;
    border-radius: 18px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(8px);
`;

const StatValue = styled.div`
    font-size: calc(17px * var(--app-font-scale, 1));
    line-height: 1.15;
    font-weight: 950;
`;

const StatLabel = styled.div`
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.78);
    font-size: calc(11px * var(--app-font-scale, 1));
    line-height: 1.25;
    font-weight: 700;
`;

const SearchPanel = styled.section`
    position: sticky;
    top: 96px;
    z-index: 10;
    padding: 10px 0 12px;
    background: linear-gradient(
        180deg,
        rgba(245, 247, 251, 0.96),
        rgba(245, 247, 251, 0.8)
    );
    backdrop-filter: blur(12px);
`;

const SearchBox = styled.label`
    height: 54px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.22);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 15px;
    color: #9aa4b2;
`;

const SearchInput = styled.input`
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: #172033;
    font-size: calc(15px * var(--app-font-scale, 1));
    font-weight: 700;

    &::placeholder {
        color: #94a3b8;
        font-weight: 600;
    }
`;

const ResultBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 4px 2px 0;
    color: #64748b;
    font-size: calc(13px * var(--app-font-scale, 1));
    line-height: 1.35;
    font-weight: 700;
`;

const ResultCount = styled.span`
    color: #172033;
    font-weight: 900;
`;

const ZoneList = styled.div`
    display: grid;
    gap: 16px;
`;

const ZoneCard = styled.article`
    overflow: hidden;
    border-radius: 26px;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.16);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease;

    &:active {
        transform: scale(0.985);
        box-shadow: 0 10px 22px rgba(15, 23, 42, 0.12);
    }
`;

const ImageWrap = styled.div`
    position: relative;
    height: 154px;
    overflow: hidden;
    background: linear-gradient(135deg, #e2e8f0, #f8fafc);
`;

const ZoneImage = styled.img`
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
`;

const ImageOverlay = styled.div`
    position: absolute;
    inset: 0;
    background: linear-gradient(
        180deg,
        rgba(15, 23, 42, 0.06) 0%,
        rgba(15, 23, 42, 0.5) 100%
    );
`;

const ImageBadgeRow = styled.div`
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
`;

const ImageBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 32px;
    border-radius: 999px;
    padding: 7px 11px;
    background: rgba(255, 255, 255, 0.94);
    color: #b40c1d;
    font-size: calc(12px * var(--app-font-scale, 1));
    line-height: 1;
    font-weight: 950;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
`;

const CardBody = styled.div`
    padding: 15px 15px 16px;
`;

const ZoneHead = styled.div`
    display: grid;
    grid-template-columns: 1fr 28px;
    align-items: start;
    gap: 10px;
`;

const ZoneName = styled.h2`
    margin: 0;
    color: #111827;
    font-size: calc(18px * var(--app-font-scale, 1));
    line-height: 1.32;
    font-weight: 950;
    letter-spacing: -0.25px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const Chevron = styled.div`
    width: 28px;
    height: 28px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #b40c1d;
    background: #fff1f2;
`;

const BadgeRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin: 12px 0;
`;

const Badge = styled.span<{ $tone: "red" | "green" | "slate" }>`
    display: inline-flex;
    align-items: center;
    min-height: 30px;
    border-radius: 999px;
    padding: 6px 10px;
    color: ${({ $tone }) => {
        if ($tone === "red") {
            return "#be123c";
        }

        if ($tone === "green") {
            return "#15803d";
        }

        return "#475569";
    }};
    background: ${({ $tone }) => {
        if ($tone === "red") {
            return "#fff1f2";
        }

        if ($tone === "green") {
            return "#ecfdf3";
        }

        return "#f1f5f9";
    }};
    font-size: calc(12px * var(--app-font-scale, 1));
    line-height: 1;
    font-weight: 900;
    white-space: nowrap;
`;

const InfoStack = styled.div`
    display: grid;
    gap: 10px;
`;

const InfoItem = styled.div`
    display: grid;
    grid-template-columns: 22px 1fr;
    align-items: start;
    gap: 8px;
    color: #64748b;
    font-size: calc(14px * var(--app-font-scale, 1));
    line-height: 1.42;
    font-weight: 650;

    svg,
    i {
        color: #b40c1d;
    }

    span {
        min-width: 0;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;

const StrongText = styled.strong`
    color: #1e293b;
    font-weight: 950;
`;

const ProgressBox = styled.div`
    margin-top: 14px;
    padding: 12px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid rgba(148, 163, 184, 0.14);
`;

const ProgressHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: #64748b;
    font-size: calc(13px * var(--app-font-scale, 1));
    line-height: 1.2;
    font-weight: 800;
`;

const ProgressValue = styled.span`
    color: #b40c1d;
    font-weight: 950;
`;

const ProgressTrack = styled.div`
    height: 8px;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
    margin-top: 9px;
`;

const ProgressFill = styled.div<{ $value: number }>`
    width: ${({ $value }) => `${$value}%`};
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #b40c1d, #ef233c);
`;

const ContactBar = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 14px;
`;

const ContactButton = styled.button<{ $primary?: boolean }>`
    min-width: 0;
    min-height: 42px;
    border: 0;
    border-radius: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 10px;
    background: ${({ $primary }) => ($primary ? "#b40c1d" : "#f1f5f9")};
    color: ${({ $primary }) => ($primary ? "#ffffff" : "#334155")};
    font-size: calc(13px * var(--app-font-scale, 1));
    font-weight: 900;

    &:disabled {
        color: #94a3b8;
        background: #f1f5f9;
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
    }
`;

const StateBox = styled.div`
    margin-top: 12px;
    padding: 30px 18px;
    border-radius: 24px;
    background: #ffffff;
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
    text-align: center;
    color: #64748b;
    font-size: calc(15px * var(--app-font-scale, 1));
    line-height: 1.5;
    font-weight: 650;
`;

const LoadingBox = styled(StateBox)`
    display: grid;
    gap: 12px;
    place-items: center;
`;

const FloatingActions = styled.div`
    position: fixed;
    right: max(16px, calc((100vw - 430px) / 2 + 16px));
    bottom: 96px;
    z-index: 22;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const FloatingButton = styled.button`
    width: 54px;
    height: 54px;
    border: 0;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: linear-gradient(135deg, #8f0715, #ef233c);
    box-shadow: 0 14px 26px rgba(166, 9, 25, 0.3);

    &:active {
        transform: scale(0.96);
    }
`;

function getTextValue(value: unknown): string {
    if (typeof value === "string") {
        return value.trim();
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
        };

        if (typeof data.name === "string") {
            return data.name.trim();
        }

        if (typeof data.title === "string") {
            return data.title.trim();
        }

        if (typeof data.label === "string") {
            return data.label.trim();
        }

        if (typeof data.value === "string") {
            return data.value.trim();
        }
    }

    return "";
}

function getZoneName(zone: IndustrialPark) {
    return getTextValue(zone.name) || "Khu công nghiệp";
}

function getZoneStatus(zone: IndustrialPark) {
    return getTextValue(zone.status) || "Đang cập nhật";
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

function getZoneInvestor(zone: IndustrialPark) {
    return getTextValue(zone.investor) || "Chủ đầu tư đang cập nhật";
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

function getZoneImage(zone: IndustrialPark) {
    return (
        getTextValue(zone.imageUrl) ||
        getTextValue(zone.logoUrl) ||
        DEFAULT_ZONE_IMAGE
    );
}

function normalizeWebsiteUrl(value: string) {
    if (!value) {
        return "";
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    return `https://${value}`;
}

const IndustrialZonesPage: React.FC = () => {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState("");
    const [zones, setZones] = useState<IndustrialPark[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getIndustrialParks({
                    page: 0,
                    size: 20,
                    keyword: keyword.trim(),
                });

                if (!active) {
                    return;
                }

                setZones(result.data);
            } catch (err) {
                if (!active) {
                    return;
                }

                setZones([]);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải danh sách khu công nghiệp.",
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }, 350);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [keyword]);

    const handleScrollTop = () => {
        const page = document.getElementById("industrial-zones-page");

        page?.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleOpenWebsite = (
        event: React.MouseEvent<HTMLButtonElement>,
        website?: string,
    ) => {
        event.stopPropagation();

        const url = normalizeWebsiteUrl(getTextValue(website));

        if (!url) {
            return;
        }

        openWebView(url);
    };

    const handleCall = (
        event: React.MouseEvent<HTMLButtonElement>,
        phone?: string,
    ) => {
        event.stopPropagation();

        const cleanPhone = getTextValue(phone).replace(/[^\d+]/g, "");

        if (!cleanPhone) {
            return;
        }

        window.location.href = `tel:${cleanPhone}`;
    };

    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement>,
    ) => {
        event.currentTarget.src = DEFAULT_ZONE_IMAGE;
    };

    return (
        <PageWrapper id="industrial-zones-page">
            <AppHeader
                back
                title="Khu công nghiệp"
                description="Tra cứu thông tin khu công nghiệp, doanh nghiệp và cơ hội đầu tư"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <IntroCard>
                    <IntroEyebrow>
                        <Icon icon="zi-location" size={16} />
                        Cổng thông tin đầu tư
                    </IntroEyebrow>

                    <IntroTitle>
                        Danh sách khu công nghiệp trên địa bàn
                    </IntroTitle>

                    <IntroDesc>
                        Cập nhật vị trí, quy mô, chủ đầu tư, tỷ lệ lấp đầy và
                        thông tin liên hệ.
                    </IntroDesc>

                    <IntroStats>
                        <StatItem>
                            <StatValue>{zones.length}</StatValue>
                            <StatLabel>Khu công nghiệp</StatLabel>
                        </StatItem>

                        <StatItem>
                            <StatValue>24/7</StatValue>
                            <StatLabel>Tra cứu thông tin</StatLabel>
                        </StatItem>
                    </IntroStats>
                </IntroCard>

                <SearchPanel>
                    <SearchBox>
                        <Icon icon="zi-search" size={20} />

                        <SearchInput
                            placeholder="Tìm theo tên, địa chỉ, chủ đầu tư..."
                            type="search"
                            value={keyword}
                            onChange={event => setKeyword(event.target.value)}
                        />
                    </SearchBox>

                    <ResultBar>
                        <span>
                            Kết quả: <ResultCount>{zones.length}</ResultCount>
                        </span>

                        {keyword.trim() ? (
                            <span>“{keyword.trim()}”</span>
                        ) : (
                            <span>Mới cập nhật</span>
                        )}
                    </ResultBar>
                </SearchPanel>

                {loading ? (
                    <LoadingBox>
                        <Spinner />
                        Đang tải danh sách khu công nghiệp...
                    </LoadingBox>
                ) : error ? (
                    <StateBox>{error}</StateBox>
                ) : zones.length > 0 ? (
                    <ZoneList>
                        {zones.map(zone => {
                            const occupancy = getZoneOccupancy(zone);
                            const phone = getTextValue(zone.phone);
                            const website = getTextValue(zone.website);

                            return (
                                <ZoneCard
                                    key={zone.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                        navigate(`/industrial-zones/${zone.id}`)
                                    }
                                >
                                    <ImageWrap>
                                        <ZoneImage
                                            src={getZoneImage(zone)}
                                            alt={getZoneName(zone)}
                                            onError={handleImageError}
                                        />

                                        <ImageOverlay />

                                        <ImageBadgeRow>
                                            <ImageBadge>
                                                <Icon
                                                    icon="zi-work"
                                                    size={15}
                                                />
                                                Khu công nghiệp
                                            </ImageBadge>

                                            <ImageBadge>
                                                {occupancy}% lấp đầy
                                            </ImageBadge>
                                        </ImageBadgeRow>
                                    </ImageWrap>

                                    <CardBody>
                                        <ZoneHead>
                                            <ZoneName>
                                                {getZoneName(zone)}
                                            </ZoneName>

                                            <Chevron>
                                                <Icon
                                                    icon="zi-chevron-right"
                                                    size={18}
                                                />
                                            </Chevron>
                                        </ZoneHead>

                                        <BadgeRow>
                                            <Badge $tone="red">
                                                Quy hoạch công nghiệp
                                            </Badge>

                                            <Badge $tone="green">
                                                {getZoneStatus(zone)}
                                            </Badge>
                                        </BadgeRow>

                                        <InfoStack>
                                            <InfoItem>
                                                <Icon
                                                    icon="zi-location"
                                                    size={18}
                                                />
                                                <span>
                                                    {getZoneAddress(zone)}
                                                </span>
                                            </InfoItem>

                                            <InfoItem>
                                                <Icon
                                                    icon="zi-user"
                                                    size={18}
                                                />
                                                <span>
                                                    Chủ đầu tư:{" "}
                                                    <StrongText>
                                                        {getZoneInvestor(zone)}
                                                    </StrongText>
                                                </span>
                                            </InfoItem>

                                            <InfoItem>
                                                <Icon
                                                    icon="zi-note"
                                                    size={18}
                                                />
                                                <span>
                                                    Diện tích:{" "}
                                                    <StrongText>
                                                        {getZoneArea(zone)}
                                                    </StrongText>
                                                </span>
                                            </InfoItem>
                                        </InfoStack>

                                        <ProgressBox>
                                            <ProgressHeader>
                                                <span>Tỉ lệ lấp đầy</span>
                                                <ProgressValue>
                                                    {occupancy}%
                                                </ProgressValue>
                                            </ProgressHeader>

                                            <ProgressTrack>
                                                <ProgressFill
                                                    $value={occupancy}
                                                />
                                            </ProgressTrack>
                                        </ProgressBox>

                                        <ContactBar>
                                            <ContactButton
                                                $primary
                                                type="button"
                                                onClick={event =>
                                                    handleCall(event, phone)
                                                }
                                                disabled={!phone}
                                            >
                                                <Icon
                                                    icon="zi-call"
                                                    size={18}
                                                />
                                                {phone || "Chưa có SĐT"}
                                            </ContactButton>

                                            <ContactButton
                                                type="button"
                                                onClick={event =>
                                                    handleOpenWebsite(
                                                        event,
                                                        website,
                                                    )
                                                }
                                                disabled={!website}
                                            >
                                                <Icon
                                                    icon="zi-link"
                                                    size={18}
                                                />
                                                Website
                                            </ContactButton>
                                        </ContactBar>
                                    </CardBody>
                                </ZoneCard>
                            );
                        })}
                    </ZoneList>
                ) : (
                    <StateBox>
                        Chưa có khu công nghiệp phù hợp. Vui lòng thử từ khóa
                        khác.
                    </StateBox>
                )}
            </Content>

            <FloatingActions>
                <FloatingButton
                    aria-label="Lên đầu trang"
                    type="button"
                    onClick={handleScrollTop}
                >
                    <Icon icon="zi-arrow-up" size={28} />
                </FloatingButton>
            </FloatingActions>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default IndustrialZonesPage;
