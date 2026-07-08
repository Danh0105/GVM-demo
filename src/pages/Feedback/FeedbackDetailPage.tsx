import ImageSwiper from "@components/feedback/ImageSwiper";
import AppHeader from "@components/layout/AppHeader";
import { getFeedback, type Feedback } from "@/services/feedback";
import { formatDateTime } from "@utils/date-time";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";
import AppBottomNav from "@/components/layout/AppBottomNav";

function safeFormatDateTime(value?: string | Date | null) {
    if (!value) {
        return "Chưa có ngày";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Chưa có ngày";
    }

    return formatDateTime(date);
}

type FeedbackDetail = Feedback & {
    type?: string;
    imageUrls?: string[];
    creationTime?: string;
    responseTime?: string;
    status?: string;
    statusText?: string;
};

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 0 0 92px;
    overflow-x: hidden;
    background: #f1f6fa;
    color: #10233b;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 14px;
`;

const ImageContainer = styled.div`
    margin-bottom: 12px;
    overflow: hidden;
    border: 1px solid #deebf3;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 7px 18px rgba(31, 77, 110, 0.07);
`;

const HeroCard = styled.section`
    position: relative;
    overflow: hidden;
    margin-bottom: 12px;
    padding: 17px;
    border-radius: 22px;
    color: #ffffff;
    background: linear-gradient(135deg, #b91c1c, #dc2626);
    box-shadow: 0 10px 24px rgba(185, 28, 28, 0.2);

    &::before {
        position: absolute;
        top: -42px;
        right: -38px;
        width: 128px;
        height: 128px;
        border-radius: 999px;
        content: "";
        background: rgba(255, 255, 255, 0.12);
    }

    &::after {
        position: absolute;
        right: 46px;
        bottom: -34px;
        width: 86px;
        height: 86px;
        border-radius: 999px;
        content: "";
        background: rgba(255, 214, 10, 0.2);
    }
`;

const HeroInner = styled.div`
    position: relative;
    z-index: 1;
`;

const HeroBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
    padding: 5px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1;
    font-weight: 850;
`;

const HeroTitle = styled.h1`
    margin: 0;
    font-size: calc(19px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 900;
`;

const HeroMeta = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    color: rgba(255, 255, 255, 0.88);
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 650;
`;

const Card = styled.section`
    margin-bottom: 12px;
    overflow: hidden;
    border: 1px solid #deebf3;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 7px 18px rgba(31, 77, 110, 0.07);
`;

const CardHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 15px;
    border-bottom: 1px solid #e6eff5;
`;

const HeaderTitle = styled.div`
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;
    color: #15344f;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 900;
`;

const HeaderIcon = styled.div`
    width: 34px;
    height: 34px;
    display: grid;
    flex: none;
    place-items: center;
    border-radius: 999px;
    color: #b91c1c;
    background: #fff2f2;
`;

const TimeBadge = styled.div`
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 4px;
    max-width: 145px;
    padding: 5px 8px;
    border-radius: 999px;
    color: #7891a4;
    background: #f5f9fc;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 700;
`;

const CardBody = styled.div`
    padding: 15px;
`;

const BadgeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 11px;
`;

const CategoryBadge = styled.span`
    display: inline-flex;
    align-items: center;
    min-height: 27px;
    padding: 4px 10px;
    border: 1px solid #c7e1f8;
    border-radius: 999px;
    color: #0067b1;
    background: #eaf4ff;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1;
    font-weight: 900;
`;

const StatusBadge = styled.span<{ $answered: boolean }>`
    display: inline-flex;
    align-items: center;
    min-height: 27px;
    padding: 4px 10px;
    border: 1px solid ${({ $answered }) => ($answered ? "#bfe9ce" : "#f8df9d")};
    border-radius: 999px;
    color: ${({ $answered }) => ($answered ? "#138849" : "#a86405")};
    background: ${({ $answered }) => ($answered ? "#e8f8ef" : "#fff7df")};
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1;
    font-weight: 900;
`;

const FeedbackTitle = styled.h2`
    margin: 0 0 10px;
    color: #15344f;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 900;
`;

const FeedbackContent = styled.div`
    padding: 13px;
    border: 1px solid #e5edf4;
    border-radius: 16px;
    color: #61798d;
    background: #f8fbfd;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.58;
    white-space: pre-wrap;
`;

const InfoGrid = styled.div`
    display: grid;
    gap: 9px;
    margin-top: 13px;
`;

const InfoItem = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 11px;
    border: 1px solid #e5edf4;
    border-radius: 16px;
    background: #ffffff;
`;

const InfoIcon = styled.div`
    width: 30px;
    height: 30px;
    display: grid;
    flex: none;
    place-items: center;
    border-radius: 999px;
    color: #52758c;
    background: #f0f6fa;
`;

const InfoLabel = styled.div`
    color: #15344f;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 850;
`;

const InfoValue = styled.div`
    margin-top: 2px;
    color: #61798d;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;
    word-break: break-word;
`;

const ResponseBox = styled.div<{ $answered: boolean }>`
    padding: 14px;
    border: 1px solid ${({ $answered }) => ($answered ? "#bfe9ce" : "#f8df9d")};
    border-radius: 17px;
    color: ${({ $answered }) => ($answered ? "#166534" : "#92400e")};
    background: ${({ $answered }) => ($answered ? "#f0fdf4" : "#fffbeb")};
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.6;
    font-weight: 600;
    white-space: pre-line;
`;

const StateBox = styled.div`
    padding: 30px 18px;
    border: 1px solid #deebf3;
    border-radius: 20px;
    color: #6e8799;
    background: #ffffff;
    box-shadow: 0 7px 18px rgba(31, 77, 110, 0.07);
    text-align: center;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.55;
`;

const StateIcon = styled.div`
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    margin: 0 auto 10px;
    border-radius: 999px;
    color: #6e8799;
    background: #f0f6fa;
`;

const ErrorBox = styled(StateBox)`
    color: #b42318;
    border-color: #fecaca;
    background: #fff7f7;
`;

const RetryButton = styled.button`
    margin-top: 14px;
    min-height: 40px;
    padding: 0 18px;
    border: 0;
    border-radius: 12px;
    color: #ffffff;
    background: #b91c1c;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
    box-shadow: 0 8px 18px rgba(185, 28, 28, 0.18);

    &:active {
        transform: scale(0.96);
    }
`;

function getFeedbackCategory(feedback?: FeedbackDetail) {
    return (
        feedback?.feedbackType?.title ||
        feedback?.feedbackType?.name ||
        feedback?.type ||
        "Phản ánh người dân"
    );
}

function getCreatedAt(feedback?: FeedbackDetail) {
    return feedback?.createdAt || feedback?.creationTime || "";
}

function getResponseAt(feedback?: FeedbackDetail) {
    return feedback?.updatedAt || feedback?.responseTime || "";
}

function getImageUrls(feedback?: FeedbackDetail) {
    return feedback?.images || feedback?.imageUrls || [];
}

function getSenderName(feedback?: FeedbackDetail) {
    return feedback?.senderName || "Chưa cung cấp";
}

function getSenderPhone(feedback?: FeedbackDetail) {
    return feedback?.phone || "";
}

function getSenderAddress(feedback?: FeedbackDetail) {
    return feedback?.address || "Chưa cung cấp";
}

const FeedbackDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [feedback, setFeedback] = useState<FeedbackDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadFeedback = useCallback(async () => {
        if (!id) {
            navigate("/feedback", { animate: false, replace: true });
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await getFeedback(id);

            setFeedback(data as FeedbackDetail);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Không thể tải chi tiết phản ánh.";

            setError(message);
            setFeedback(null);
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        void loadFeedback();
    }, [loadFeedback]);

    const imageUrls = useMemo(() => getImageUrls(feedback), [feedback]);
    const hasResponse = Boolean(feedback?.response);

    return (
        <PageWrapper id="feedback-detail">
            <AppHeader
                back
                fixed={false}
                title="Chi tiết phản ánh"
                description="Theo dõi nội dung và kết quả xử lý phản ánh"
                onBack={() => navigate("/feedback", { direction: "backward" })}
            />

            <Content>
                {loading && (
                    <StateBox>
                        <StateIcon>
                            <Spinner />
                        </StateIcon>
                        Đang tải chi tiết phản ánh...
                    </StateBox>
                )}

                {!loading && error && (
                    <ErrorBox>
                        <StateIcon>
                            <Icon icon="zi-info-circle" size={28} />
                        </StateIcon>
                        {error}
                        <br />
                        Vui lòng kiểm tra API phản ánh hoặc thử lại.
                        <br />
                        <RetryButton type="button" onClick={loadFeedback}>
                            Thử lại
                        </RetryButton>
                    </ErrorBox>
                )}

                {!loading && !error && feedback && (
                    <>
                        <HeroCard>
                            <HeroInner>
                                <HeroBadge>
                                    <Icon icon="zi-chat" size={14} />
                                    Phản ánh kiến nghị
                                </HeroBadge>

                                <HeroTitle>
                                    {feedback.title || "Chưa có tiêu đề"}
                                </HeroTitle>

                                <HeroMeta>
                                    <Icon icon="zi-clock-1" size={14} />
                                    {safeFormatDateTime(getCreatedAt(feedback))}
                                </HeroMeta>
                            </HeroInner>
                        </HeroCard>

                        {imageUrls.length > 0 && (
                            <ImageContainer>
                                <ImageSwiper imageUrls={imageUrls} />
                            </ImageContainer>
                        )}

                        <Card>
                            <CardHeader>
                                <HeaderTitle>
                                    <HeaderIcon>
                                        <Icon icon="zi-info-circle" size={17} />
                                    </HeaderIcon>
                                    Nội dung phản ánh
                                </HeaderTitle>

                                <TimeBadge>
                                    <Icon icon="zi-clock-1" size={12} />
                                    {safeFormatDateTime(getCreatedAt(feedback))}
                                </TimeBadge>
                            </CardHeader>

                            <CardBody>
                                <BadgeRow>
                                    <CategoryBadge>
                                        {getFeedbackCategory(feedback)}
                                    </CategoryBadge>

                                    <StatusBadge $answered={hasResponse}>
                                        {hasResponse
                                            ? "Đã phản hồi"
                                            : "Đang tiếp nhận"}
                                    </StatusBadge>
                                </BadgeRow>

                                <FeedbackTitle>
                                    {feedback.title || "Chưa có tiêu đề"}
                                </FeedbackTitle>

                                <FeedbackContent>
                                    {feedback.content ||
                                        "Chưa có nội dung phản ánh."}
                                </FeedbackContent>

                                <InfoGrid>
                                    <InfoItem>
                                        <InfoIcon>
                                            <Icon icon="zi-user" size={15} />
                                        </InfoIcon>

                                        <div>
                                            <InfoLabel>Người gửi</InfoLabel>
                                            <InfoValue>
                                                {getSenderName(feedback)}
                                            </InfoValue>
                                        </div>
                                    </InfoItem>

                                    {getSenderPhone(feedback) && (
                                        <InfoItem>
                                            <InfoIcon>
                                                <Icon
                                                    icon="zi-call"
                                                    size={15}
                                                />
                                            </InfoIcon>

                                            <div>
                                                <InfoLabel>
                                                    Số điện thoại
                                                </InfoLabel>
                                                <InfoValue>
                                                    {getSenderPhone(feedback)}
                                                </InfoValue>
                                            </div>
                                        </InfoItem>
                                    )}

                                    <InfoItem>
                                        <InfoIcon>
                                            <Icon
                                                icon="zi-location"
                                                size={15}
                                            />
                                        </InfoIcon>

                                        <div>
                                            <InfoLabel>Địa chỉ</InfoLabel>
                                            <InfoValue>
                                                {getSenderAddress(feedback)}
                                            </InfoValue>
                                        </div>
                                    </InfoItem>
                                </InfoGrid>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardHeader>
                                <HeaderTitle>
                                    <HeaderIcon>
                                        <Icon icon="zi-comment" size={17} />
                                    </HeaderIcon>
                                    Trả lời phản ánh
                                </HeaderTitle>

                                <TimeBadge>
                                    <Icon icon="zi-clock-1" size={12} />
                                    {hasResponse
                                        ? safeFormatDateTime(
                                              getResponseAt(feedback),
                                          )
                                        : "Chưa phản hồi"}
                                </TimeBadge>
                            </CardHeader>

                            <CardBody>
                                <ResponseBox $answered={hasResponse}>
                                    {feedback.response ||
                                        "Phản ánh đang được tiếp nhận và xử lý. Vui lòng theo dõi phản hồi sau."}
                                </ResponseBox>
                            </CardBody>
                        </Card>
                    </>
                )}
            </Content>
                  <AppBottomNav />
        </PageWrapper>
    );
};

export default FeedbackDetailPage;
