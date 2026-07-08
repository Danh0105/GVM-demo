import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Icon, Page, useNavigate } from "zmp-ui";

import Thumb from "@assets/thumb.png";
import NewsFeatured from "@assets/news-featured.jpg";
import AppHeader from "@components/layout/AppHeader";
import {
    getArticle,
    recordArticleView,
    updateArticleLike,
    type Article,
} from "@/services/news";
import AppBottomNav from "@/components/layout/AppBottomNav";

function formatDate(date?: string) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

function getImageUrl(article?: Article | null) {
    return article?.thumb || NewsFeatured || Thumb;
}

function getCategory(article?: Article | null) {
    return article?.type?.title ?? "Tin tức";
}

function getGuestUserId() {
    const storageKey = "news_guest_user_id";

    const currentId = localStorage.getItem(storageKey);

    if (currentId) {
        return currentId;
    }

    const newId =
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(storageKey, newId);

    return newId;
}

const DetailPageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: linear-gradient(180deg, #eef7ff 0, #f7fbff 240px, #f5f7fb 100%);
    color: #172033;
    padding: calc(96px + var(--zaui-safe-area-inset-top, 0px)) 0
        calc(34px + var(--zaui-safe-area-inset-bottom, 0px));
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 0 12px calc(118px + var(--zaui-safe-area-inset-bottom, 0px));

    @media (max-width: 410px) {
        padding-right: 10px;
        padding-left: 10px;
    }
`;

const ArticleCard = styled.article`
    border-radius: 26px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 18px 36px rgba(30, 35, 50, 0.12);

    @media (max-width: 410px) {
        border-radius: 20px;
    }
`;

const Cover = styled.div<{ $image: string }>`
    height: clamp(206px, 58vw, 246px);
    background: linear-gradient(
            180deg,
            rgba(23, 32, 51, 0.02),
            rgba(23, 32, 51, 0.12)
        ),
        url(${({ $image }) => $image}) center/cover;
`;

const Body = styled.div`
    padding: 22px 18px 24px;

    @media (max-width: 410px) {
        padding: 18px 14px 20px;
    }
`;

const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    height: 34px;
    border-radius: 999px;
    padding: 0 14px;
    background: rgba(230, 247, 255, 0.92);
    color: #00558f;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;

    @media (max-width: 410px) {
        height: 30px;
        padding: 0 12px;
        font-size: calc(13px * var(--app-font-scale));
    }
`;

const ArticleTitle = styled.h2`
    margin: 16px 0 12px;
    color: #172033;
    font-size: calc(25px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 900;

    @media (max-width: 410px) {
        margin: 14px 0 10px;
        font-size: calc(22px * var(--app-font-scale));
    }
`;

const Meta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    color: #7a8494;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 750;
    margin-bottom: 18px;

    @media (max-width: 410px) {
        gap: 6px 10px;
        font-size: calc(13px * var(--app-font-scale));
        margin-bottom: 14px;
    }
`;

const Description = styled.p`
    margin: 0;
    color: #3f4a5d;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.58;
    font-weight: 650;
    white-space: pre-line;

    @media (max-width: 410px) {
        font-size: calc(16px * var(--app-font-scale));
        line-height: 1.55;
    }
`;

const ActionRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 22px;

    @media (max-width: 410px) {
        gap: 10px;
        margin-top: 18px;
    }
`;

const ActionButton = styled.button<{ $active?: boolean }>`
    height: 50px;
    border: 0;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: ${({ $active }) => ($active ? "#ffffff" : "#005b9f")};
    background: ${({ $active }) =>
        $active
            ? "linear-gradient(135deg, #005b9f, #008bd2)"
            : "rgba(230, 247, 255, 0.95)"};
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 900;

    @media (max-width: 410px) {
        height: 46px;
        border-radius: 14px;
        font-size: calc(14px * var(--app-font-scale));
    }
`;

const LinkButton = styled.a`
    height: 52px;
    border-radius: 16px;
    margin-top: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-decoration: none;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 900;

    @media (max-width: 410px) {
        height: 48px;
        border-radius: 14px;
        font-size: calc(15px * var(--app-font-scale));
    }
`;

const StateBox = styled.div`
    min-height: 280px;
    border-radius: 24px;
    background: #ffffff;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
    display: grid;
    place-items: center;
    padding: 24px;
    text-align: center;
    color: #697386;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 750;
`;

const NewsDetailPage: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (!id) return;

        const loadArticle = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const data = await getArticle(id);
                setArticle(data);

                try {
                    const viewedArticle = await recordArticleView(id);
                    setArticle(viewedArticle);
                } catch (viewError) {
                    console.error("Lỗi ghi nhận lượt xem:", viewError);
                }
            } catch (error) {
                console.error("Lỗi lấy chi tiết tin tức:", error);
                setErrorMessage("Không thể tải chi tiết tin tức.");
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [id]);

    const handleLike = async () => {
        if (!id) return;

        try {
            const userId = getGuestUserId();
            const nextLiked = !liked;

            const updatedArticle = await updateArticleLike(id, {
                userId,
                liked: nextLiked,
            });

            setLiked(nextLiked);
            setArticle(updatedArticle);
        } catch (error) {
            console.error("Lỗi cập nhật lượt thích:", error);
        }
    };

    return (
        <DetailPageWrapper>
            <AppHeader
                back
                title="Chi tiết tin tức"
                onBack={() => navigate("/news", { direction: "backward" })}
            />

            <Content>
                {loading && <StateBox>Đang tải chi tiết tin tức...</StateBox>}

                {!loading && errorMessage && (
                    <StateBox>{errorMessage}</StateBox>
                )}

                {!loading && !errorMessage && !article && (
                    <StateBox>Không tìm thấy tin tức.</StateBox>
                )}

                {!loading && !errorMessage && article && (
                    <ArticleCard>
                        <Cover $image={getImageUrl(article)} />

                        <Body>
                            <Chip>{getCategory(article)}</Chip>

                            <ArticleTitle>{article.title}</ArticleTitle>

                            <Meta>
                                <span>{article.author ?? "Ban biên tập"}</span>

                                {article.publishedAt && (
                                    <span>
                                        {formatDate(article.publishedAt)}
                                    </span>
                                )}

                                <span>{article.views ?? 0} lượt xem</span>
                                <span>{article.likes ?? 0} lượt thích</span>
                            </Meta>

                            <Description>
                                {article.desc ||
                                    "Nội dung tin tức đang được cập nhật."}
                            </Description>

                            <ActionRow>
                                <ActionButton type="button">
                                    <Icon icon="zi-eye" size={22} />
                                    {article.views ?? 0}
                                </ActionButton>

                                <ActionButton
                                    type="button"
                                    $active={liked}
                                    onClick={handleLike}
                                >
                                    <Icon icon="zi-heart" size={22} />
                                    {liked ? "Đã thích" : "Thích"}
                                </ActionButton>
                            </ActionRow>

                            {article.link && (
                                <LinkButton
                                    href={article.link}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Xem bài viết gốc
                                    <Icon icon="zi-chevron-right" size={22} />
                                </LinkButton>
                            )}
                        </Body>
                    </ArticleCard>
                )}
            </Content>
            <AppBottomNav />
        </DetailPageWrapper>
    );
};

export default NewsDetailPage;
