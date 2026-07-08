import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import { Box, Icon, Page, Spinner, useNavigate } from "zmp-ui";
import Thumb from "@assets/thumb.png";
import AppHeader from "@components/layout/AppHeader";
import AppBottomNav from "@/components/layout/AppBottomNav";
import { openWebView } from "@/services/zalo";
import {
    getOcop,
    getOcopReviews,
    type Ocop,
    type OcopReview,
} from "@/services/ocop";

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: #f3f7fb;
    color: #082b55;
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
    border: 1px solid #e3edf5;
    box-shadow: 0 14px 30px rgba(11, 73, 121, 0.09);
`;

const HeroImage = styled.div<{ $image: string }>`
    height: 218px;
    background: url(${({ $image }) => $image}) center/cover;
    position: relative;
`;

const HeroOverlay = styled.div`
    position: absolute;
    inset: auto 0 0;
    padding: 34px 16px 14px;
    background: linear-gradient(
        180deg,
        rgba(8, 43, 85, 0) 0%,
        rgba(8, 43, 85, 0.72) 100%
    );
    color: #ffffff;
`;

const BadgeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 7px 11px;
    border-radius: 999px;
    background: #fff5d9;
    color: #b46800;
    border: 1px solid #ffe5a5;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;
`;

const TypeBadge = styled(Badge)`
    background: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.28);
    color: #ffffff;
    backdrop-filter: blur(8px);
`;

const Title = styled.h1`
    margin: 0;
    font-size: calc(22px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 950;
    color: #ffffff;
`;

const Body = styled.div`
    padding: 16px;
    display: grid;
    gap: 14px;
`;

const Description = styled.p`
    margin: 0;
    color: #526f88;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.65;
`;

const PriceText = styled.div`
    color: #d97706;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 950;
`;

const ActionRow = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
    min-height: 46px;
    border: 1px solid ${({ $primary }) => ($primary ? "#0878bd" : "#d4e6f4")};
    border-radius: 16px;
    background: ${({ $primary }) =>
        $primary
            ? "linear-gradient(135deg, #075d9c 0%, #0788cf 100%)"
            : "#ffffff"};
    color: ${({ $primary }) => ($primary ? "#ffffff" : "#164b78")};
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    box-shadow: ${({ $primary }) =>
        $primary
            ? "0 10px 20px rgba(7, 120, 189, 0.22)"
            : "0 6px 16px rgba(17, 76, 120, 0.06)"};

    &:active {
        transform: scale(0.97);
    }

    &:disabled {
        opacity: 0.55;
    }
`;

const Section = styled.section`
    margin-top: 14px;
    padding: 16px;
    border-radius: 22px;
    background: #ffffff;
    border: 1px solid #e3edf5;
    box-shadow: 0 10px 24px rgba(11, 73, 121, 0.07);
`;

const SectionTitle = styled.h2`
    margin: 0 0 12px;
    color: #082b55;
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
    gap: 10px;
    align-items: flex-start;
    padding: 11px 12px;
    border-radius: 15px;
    background: #f5f9fc;
    border: 1px solid #e4eef6;
`;

const InfoIcon = styled.div`
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: #e8f4fc;
    color: #0878bd;
`;

const InfoContent = styled.div`
    min-width: 0;
`;

const InfoLabel = styled.div`
    color: #7890a6;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;
    margin-bottom: 3px;
`;

const InfoValue = styled.div`
    color: #123d63;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 850;
    word-break: break-word;
`;

const ReviewList = styled.div`
    display: grid;
    gap: 10px;
`;

const ReviewCard = styled.div`
    padding: 12px;
    border-radius: 16px;
    background: #f8fbfd;
    border: 1px solid #e4eef6;
`;

const ReviewHead = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
`;

const ReviewName = styled.div`
    color: #082b55;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 950;
`;

const ReviewStar = styled.div`
    color: #b46800;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 950;
    white-space: nowrap;
`;

const ReviewContent = styled.p`
    margin: 0;
    color: #526f88;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.55;
`;

const StateBox = styled.div`
    margin-top: 28px;
    padding: 32px 18px;
    border-radius: 20px;
    text-align: center;
    background: #ffffff;
    border: 1px solid #e3edf5;
    box-shadow: 0 10px 24px rgba(11, 73, 121, 0.07);
    color: #66829c;
    font-size: calc(15px * var(--app-font-scale));
`;

const LoadingBox = styled(StateBox)`
    display: grid;
    gap: 12px;
    place-items: center;
`;

function getProductTitle(product: Ocop) {
    return product.name ?? product.title ?? "Sản phẩm OCOP";
}

function getProductDescription(product: Ocop) {
    return (
        product.description ??
        "Sản phẩm OCOP địa phương, góp phần quảng bá đặc sản, sản phẩm hợp tác xã và giá trị kinh tế của địa phương."
    );
}

function getProductImage(product: Ocop) {
    if (product.imageUrl) {
        return product.imageUrl;
    }

    if (Array.isArray(product.images) && product.images[0]) {
        return product.images[0];
    }

    return Thumb;
}

function getProductBadge(product: Ocop) {
    const star = product.stars ?? product.rating;

    if (star) {
        return `OCOP ${star}★`;
    }

    return "OCOP";
}

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
            description?: unknown;
        };

        if (typeof data.name === "string") {
            return data.name;
        }

        if (typeof data.title === "string") {
            return data.title;
        }

        if (typeof data.label === "string") {
            return data.label;
        }

        if (typeof data.description === "string") {
            return data.description;
        }
    }

    return "";
}

function getProductType(product: Ocop) {
    return (
        getTextValue(product.ocopType) ||
        getTextValue(product.type) ||
        "Sản phẩm OCOP"
    );
}

function formatPrice(value?: number | string) {
    if (value === undefined || value === null || value === "") {
        return "";
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
        return String(value);
    }

    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    }).format(numberValue);
}

function getAddress(product: Ocop) {
    const parts = [
        product.address,
        product.ward,
        product.district,
        product.province,
    ].filter(Boolean);

    return parts.join(", ");
}

function getReviewName(review: OcopReview) {
    return review.fullName ?? "Người dùng";
}

function getReviewContent(review: OcopReview) {
    return review.content ?? review.comment ?? "Không có nội dung đánh giá.";
}

function getReviewStar(review: OcopReview) {
    const star = review.stars ?? review.rating;

    if (!star) {
        return "Đánh giá";
    }

    return `${star}★`;
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

const OCOPDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [product, setProduct] = useState<Ocop | null>(null);
    const [reviews, setReviews] = useState<OcopReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const price = useMemo(() => formatPrice(product?.price), [product?.price]);
    const address = useMemo(
        () => (product ? getAddress(product) : ""),
        [product],
    );

    useEffect(() => {
        let active = true;

        async function loadDetail() {
            if (!id) {
                setError("Không tìm thấy mã sản phẩm OCOP.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getOcop(id);
                console.log(data);
                if (!active) {
                    return;
                }

                setProduct(data);

                try {
                    const reviewData = await getOcopReviews(id);

                    if (active) {
                        setReviews(reviewData);
                    }
                } catch {
                    if (active) {
                        setReviews([]);
                    }
                }
            } catch (err) {
                if (!active) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải chi tiết sản phẩm OCOP.",
                );
                setProduct(null);
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

    const handleOpenLink = () => {
        if (!product?.link) {
            return;
        }

        openWebView(product.link);
    };

    const handleCall = () => {
        if (!product?.phone) {
            return;
        }

        window.location.href = `tel:${product.phone}`;
    };

    return (
        <PageWrapper>
            <AppHeader
                back
                title="Chi tiết OCOP"
                description="Thông tin sản phẩm, đơn vị sản xuất và đánh giá"
                onBack={() => navigate(-1)}
            />

            <Content>
                {loading ? (
                    <LoadingBox>
                        <Spinner />
                        Đang tải chi tiết sản phẩm...
                    </LoadingBox>
                ) : error ? (
                    <StateBox>{error}</StateBox>
                ) : product ? (
                    <>
                        <HeroCard>
                            <HeroImage $image={getProductImage(product)}>
                                <HeroOverlay>
                                    <BadgeRow>
                                        <Badge>
                                            {getProductBadge(product)}
                                        </Badge>

                                        {getProductType(product) ? (
                                            <TypeBadge>
                                                {getProductType(product)}
                                            </TypeBadge>
                                        ) : null}
                                    </BadgeRow>

                                    <Title>{getProductTitle(product)}</Title>
                                </HeroOverlay>
                            </HeroImage>

                            <Body>
                                {price ? <PriceText>{price}</PriceText> : null}

                                <Description>
                                    {getProductDescription(product)}
                                </Description>

                                <ActionRow>
                                    <ActionButton
                                        type="button"
                                        $primary
                                        onClick={handleCall}
                                        disabled={!product.phone}
                                    >
                                        <Icon icon="zi-call" size={17} />
                                        Liên hệ
                                    </ActionButton>

                                    <ActionButton
                                        type="button"
                                        onClick={handleOpenLink}
                                        disabled={!product.link}
                                    >
                                        <Icon icon="zi-link" size={17} />
                                        Xem thêm
                                    </ActionButton>
                                </ActionRow>
                            </Body>
                        </HeroCard>

                        <Section>
                            <SectionTitle>Thông tin sản phẩm</SectionTitle>

                            <InfoGrid>
                                <InfoRow
                                    icon="zi-user"
                                    label="Chủ thể / đơn vị"
                                    value={
                                        product.ownerName ?? product.producer
                                    }
                                />

                                <InfoRow
                                    icon="zi-location"
                                    label="Địa chỉ"
                                    value={address}
                                />

                                <InfoRow
                                    icon="zi-call"
                                    label="Số điện thoại"
                                    value={product.phone}
                                />

                                <InfoRow
                                    icon="zi-message"
                                    label="Email"
                                    value={product.email}
                                />

                                <InfoRow
                                    icon="zi-star"
                                    label="Xếp hạng"
                                    value={getProductBadge(product)}
                                />
                            </InfoGrid>
                        </Section>

                        <Section>
                            <SectionTitle>Đánh giá sản phẩm</SectionTitle>

                            {reviews.length > 0 ? (
                                <ReviewList>
                                    {reviews.map((review, index) => (
                                        <ReviewCard
                                            key={review.id ?? `${index}`}
                                        >
                                            <ReviewHead>
                                                <ReviewName>
                                                    {getReviewName(review)}
                                                </ReviewName>

                                                <ReviewStar>
                                                    {getReviewStar(review)}
                                                </ReviewStar>
                                            </ReviewHead>

                                            <ReviewContent>
                                                {getReviewContent(review)}
                                            </ReviewContent>
                                        </ReviewCard>
                                    ))}
                                </ReviewList>
                            ) : (
                                <Description>
                                    Chưa có đánh giá cho sản phẩm này.
                                </Description>
                            )}
                        </Section>
                    </>
                ) : (
                    <StateBox>Không tìm thấy sản phẩm OCOP.</StateBox>
                )}
            </Content>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default OCOPDetailPage;
