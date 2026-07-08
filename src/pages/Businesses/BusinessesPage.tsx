import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@components/layout/AppHeader";
import { getBusinesses, type Business } from "@/services/businesses";
import { openWebView } from "@/services/zalo";
import Background from "@assets/background.png";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";

const DEFAULT_BUSINESS_IMAGE = Background;

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: linear-gradient(180deg, #f6f7fb 0%, #eef2f7 100%);
    color: #172033;
    padding: 112px 0 96px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 16px;
`;

const HeroCard = styled.section`
    position: relative;
    overflow: hidden;
    border-radius: 26px;
    padding: 18px;
    margin-bottom: 14px;
    color: #ffffff;
    background: radial-gradient(
            circle at top right,
            rgba(255, 255, 255, 0.26),
            transparent 34%
        ),
        linear-gradient(135deg, #8f0715 0%, #bc1023 48%, #ef233c 100%);
    box-shadow: 0 18px 34px rgba(166, 9, 25, 0.24);
`;

const HeroBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 30px;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    color: rgba(255, 255, 255, 0.92);
    font-size: calc(12px * var(--app-font-scale, 1));
    font-weight: 850;
`;

const HeroTitle = styled.h1`
    margin: 14px 0 8px;
    font-size: calc(22px * var(--app-font-scale, 1));
    line-height: 1.22;
    font-weight: 950;
    letter-spacing: -0.35px;
`;

const HeroDesc = styled.p`
    margin: 0;
    color: rgba(255, 255, 255, 0.82);
    font-size: calc(14px * var(--app-font-scale, 1));
    line-height: 1.5;
    font-weight: 600;
`;

const HeroStats = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    margin-top: 16px;
`;

const StatItem = styled.div`
    min-height: 64px;
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
        rgba(246, 247, 251, 0.96),
        rgba(246, 247, 251, 0.82)
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
    color: #98a2b3;
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
    margin: 8px 2px 0;
    color: #64748b;
    font-size: calc(13px * var(--app-font-scale, 1));
    line-height: 1.35;
    font-weight: 700;
`;

const ResultCount = styled.span`
    color: #172033;
    font-weight: 950;
`;

const BusinessList = styled.div`
    display: grid;
    gap: 16px;
`;

const BusinessCard = styled.article`
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
    height: 152px;
    overflow: hidden;
    background: linear-gradient(135deg, #e2e8f0, #f8fafc);
`;

const BusinessImage = styled.img`
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
        rgba(15, 23, 42, 0.04) 0%,
        rgba(15, 23, 42, 0.55) 100%
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

const BusinessTop = styled.div`
    display: grid;
    grid-template-columns: 1fr 28px;
    align-items: start;
    gap: 10px;
`;

const BusinessName = styled.h2`
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
        if ($tone === "red") return "#be123c";
        if ($tone === "green") return "#15803d";
        return "#475569";
    }};
    background: ${({ $tone }) => {
        if ($tone === "red") return "#fff1f2";
        if ($tone === "green") return "#ecfdf3";
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

const Description = styled.p`
    margin: 12px 0 0;
    padding: 12px;
    border-radius: 18px;
    background: #f8fafc;
    border: 1px solid rgba(148, 163, 184, 0.14);
    color: #64748b;
    font-size: calc(14px * var(--app-font-scale, 1));
    line-height: 1.5;
    font-weight: 650;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
            description?: unknown;
        };

        if (typeof data.name === "string") return data.name.trim();
        if (typeof data.title === "string") return data.title.trim();
        if (typeof data.label === "string") return data.label.trim();
        if (typeof data.value === "string") return data.value.trim();
        if (typeof data.description === "string") {
            return data.description.trim();
        }
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

function getBusinessAddress(item: Business) {
    const parts = [
        getTextValue(item.address),
        getTextValue(item.ward),
        getTextValue(item.district),
        getTextValue(item.province),
    ].filter(Boolean);

    return parts.join(", ") || "Địa chỉ đang cập nhật";
}

function getBusinessDescription(item: Business) {
    return (
        getTextValue(item.description) ||
        getTextValue(item.industry) ||
        getTextValue(item.field) ||
        "Thông tin doanh nghiệp đang được cập nhật."
    );
}

function getBusinessImage(item: Business) {
    return (
        getTextValue(item.imageUrl) ||
        getTextValue(item.logoUrl) ||
        DEFAULT_BUSINESS_IMAGE
    );
}

function normalizeWebsite(value: string) {
    const website = value.trim();

    if (!website) {
        return "";
    }

    if (/^https?:\/\//i.test(website)) {
        return website;
    }

    return `https://${website}`;
}
type BusinessImageViewProps = {
    src: string;
    alt: string;
};

const BusinessImageView: React.FC<BusinessImageViewProps> = ({ src, alt }) => {
    const [imageSrc, setImageSrc] = useState(src);

    useEffect(() => {
        setImageSrc(src);
    }, [src]);

    return (
        <BusinessImage
            src={imageSrc}
            alt={alt}
            onError={() => setImageSrc(DEFAULT_BUSINESS_IMAGE)}
        />
    );
};
const BusinessesPage: React.FC = () => {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState("");
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getBusinesses({
                    page: 0,
                    size: 20,
                    keyword: keyword.trim(),
                });

                if (!active) {
                    return;
                }

                setBusinesses(result.data);
            } catch (err) {
                if (!active) {
                    return;
                }

                setBusinesses([]);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải danh sách doanh nghiệp.",
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

    const handleCall = (
        event: React.MouseEvent<HTMLButtonElement>,
        phone: string,
    ) => {
        event.stopPropagation();

        const cleanPhone = phone.replace(/[^\d+]/g, "");

        if (!cleanPhone) {
            return;
        }

        window.location.href = `tel:${cleanPhone}`;
    };

    const handleOpenWebsite = (
        event: React.MouseEvent<HTMLButtonElement>,
        website: string,
    ) => {
        event.stopPropagation();

        const normalizedWebsite = normalizeWebsite(website);

        if (!normalizedWebsite) {
            return;
        }

        openWebView(normalizedWebsite);
    };

    const handleImageError = (
        event: React.SyntheticEvent<HTMLImageElement>,
    ) => {
        const imageElement = event.currentTarget;

        if (imageElement.dataset.fallbackApplied === "true") {
            return;
        }

        imageElement.dataset.fallbackApplied = "true";
        imageElement.src = DEFAULT_BUSINESS_IMAGE;
    };

    const handleOpenDetail = (id: string) => {
        navigate(`/businesses/${id}`);
    };
    const renderBusinessList = () => {
        if (loading) {
            return (
                <LoadingBox>
                    <Spinner />
                    Đang tải danh sách doanh nghiệp...
                </LoadingBox>
            );
        }

        if (error) {
            return <StateBox>{error}</StateBox>;
        }

        if (businesses.length === 0) {
            return (
                <StateBox>
                    Chưa có doanh nghiệp phù hợp. Vui lòng thử từ khóa khác.
                </StateBox>
            );
        }

        return (
            <BusinessList>
                {businesses.map(item => {
                    const phone = getTextValue(item.phone);
                    const website = getTextValue(item.website);

                    return (
                        <BusinessCard
                            key={item.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleOpenDetail(item.id)}
                            onKeyDown={event => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    handleOpenDetail(item.id);
                                }
                            }}
                        >
                            <ImageWrap>
                                <BusinessImageView
                                    src={getBusinessImage(item)}
                                    alt={getBusinessName(item)}
                                />

                                <ImageOverlay />

                                <ImageBadgeRow>
                                    <ImageBadge>
                                        <Icon icon="zi-file" size={15} />
                                        {getBusinessCategory(item)}
                                    </ImageBadge>

                                    <ImageBadge>
                                        {getBusinessStatus(item)}
                                    </ImageBadge>
                                </ImageBadgeRow>
                            </ImageWrap>

                            <CardBody>
                                <BusinessTop>
                                    <BusinessName>
                                        {getBusinessName(item)}
                                    </BusinessName>

                                    <Chevron>
                                        <Icon
                                            icon="zi-chevron-right"
                                            size={18}
                                        />
                                    </Chevron>
                                </BusinessTop>

                                <BadgeRow>
                                    <Badge $tone="red">
                                        {getBusinessCategory(item)}
                                    </Badge>

                                    <Badge $tone="green">
                                        {getBusinessStatus(item)}
                                    </Badge>
                                </BadgeRow>

                                <InfoStack>
                                    <InfoItem>
                                        <Icon icon="zi-location" size={18} />
                                        <span>{getBusinessAddress(item)}</span>
                                    </InfoItem>

                                    <InfoItem>
                                        <Icon icon="zi-note" size={18} />
                                        <span>
                                            Lĩnh vực:{" "}
                                            {getBusinessCategory(item)}
                                        </span>
                                    </InfoItem>
                                </InfoStack>

                                <Description>
                                    {getBusinessDescription(item)}
                                </Description>

                                <ContactBar>
                                    <ContactButton
                                        $primary
                                        type="button"
                                        onClick={event =>
                                            handleCall(event, phone)
                                        }
                                        disabled={!phone}
                                    >
                                        <Icon icon="zi-call" size={18} />
                                        {phone || "Chưa có SĐT"}
                                    </ContactButton>

                                    <ContactButton
                                        type="button"
                                        disabled={!website}
                                        onClick={event =>
                                            handleOpenWebsite(event, website)
                                        }
                                    >
                                        <Icon icon="zi-link" size={18} />
                                        Website
                                    </ContactButton>
                                </ContactBar>
                            </CardBody>
                        </BusinessCard>
                    );
                })}
            </BusinessList>
        );
    };
    return (
        <PageWrapper id="businesses-page">
            <AppHeader
                back
                title="Doanh nghiệp"
                description="Tra cứu thông tin doanh nghiệp, ngành nghề và hoạt động kinh doanh"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <HeroCard>
                    <HeroBadge>
                        <Icon icon="zi-file" size={16} />
                        Cổng thông tin doanh nghiệp
                    </HeroBadge>

                    <HeroTitle>Danh bạ doanh nghiệp địa phương</HeroTitle>

                    <HeroDesc>
                        Cập nhật thông tin doanh nghiệp, lĩnh vực hoạt động, địa
                        chỉ và kênh liên hệ chính thức.
                    </HeroDesc>

                    <HeroStats>
                        <StatItem>
                            <StatValue>{businesses.length}</StatValue>
                            <StatLabel>Doanh nghiệp</StatLabel>
                        </StatItem>

                        <StatItem>
                            <StatValue>24/7</StatValue>
                            <StatLabel>Tra cứu nhanh</StatLabel>
                        </StatItem>

                        <StatItem>
                            <StatValue>Web</StatValue>
                            <StatLabel>Kênh liên hệ</StatLabel>
                        </StatItem>
                    </HeroStats>
                </HeroCard>

                <SearchPanel>
                    <SearchBox>
                        <Icon icon="zi-search" size={20} />

                        <SearchInput
                            placeholder="Tìm theo tên, ngành nghề, địa chỉ..."
                            type="search"
                            value={keyword}
                            onChange={event => setKeyword(event.target.value)}
                        />
                    </SearchBox>

                    <ResultBar>
                        <span>
                            Kết quả:{" "}
                            <ResultCount>{businesses.length}</ResultCount>
                        </span>

                        {keyword.trim() ? (
                            <span>“{keyword.trim()}”</span>
                        ) : (
                            <span>Mới cập nhật</span>
                        )}
                    </ResultBar>
                </SearchPanel>

                {renderBusinessList()}
            </Content>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default BusinessesPage;
