import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Icon, Page, useNavigate } from "zmp-ui";

import Thumb from "@assets/thumb.png";
import NewsFeatured from "@assets/news-featured.jpg";
import NewsElderly from "@assets/news-elderly.jpg";
import NewsMeeting from "@assets/news-meeting.jpg";
import AppHeader from "@components/layout/AppHeader";
import {
    getArticles,
    getArticleTypes,
    type Article as ApiArticle,
    type ArticleType,
} from "@/services/news";
import { getBaoMoiTayNinhArticles } from "@/services/webNews";
import { openWebView } from "@/services/zalo";
import AppBottomNav from "@/components/layout/AppBottomNav";

type Category = {
    id?: string;
    label: string;
};

const fallbackImages = [NewsFeatured, NewsElderly, NewsMeeting, Thumb];

function getImageUrl(article: ApiArticle, index = 0) {
    if (article.thumb) {
        return article.thumb;
    }

    return fallbackImages[index % fallbackImages.length];
}

function getArticleCategory(article: ApiArticle) {
    return article.type?.title ?? article.type?.name ?? "Tin tức";
}

function formatDate(date?: string) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("vi-VN");
}

function isWebArticle(article: ApiArticle) {
    return article.id.startsWith("web-");
}

function interleaveArticles(
    backendArticles: ApiArticle[],
    webArticles: ApiArticle[],
) {
    const mixedArticles: ApiArticle[] = [];
    const maxLength = Math.max(backendArticles.length, webArticles.length);

    for (let index = 0; index < maxLength; index += 1) {
        if (backendArticles[index]) {
            mixedArticles.push(backendArticles[index]);
        }

        if (webArticles[index]) {
            mixedArticles.push(webArticles[index]);
        }
    }

    return mixedArticles;
}

const NewsPageWrapper = styled(Page)`
    --news-shell-width: min(100vw, 430px);
    --news-header-offset: calc(70px + var(--zaui-safe-area-inset-top, 0px));
    --news-category-height: 66px;
    --news-scrollbar-gutter: 10px;

    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: radial-gradient(
            circle at 24px 126px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 238px, #f5f7fb 100%);
    color: #172033;
    padding: calc(
            var(--news-header-offset) + var(--news-category-height)
        )
        0 calc(28px + var(--zaui-safe-area-inset-bottom, 0px));
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;

    @media (max-width: 410px) {
        --news-category-height: 58px;
    }
`;

const CategoryBar = styled.div`
    position: fixed;
    top: var(--news-header-offset);
    right: max(
        var(--news-scrollbar-gutter),
        calc((100vw - 430px) / 2)
    );
    left: max(0px, calc((100vw - 430px) / 2));
    z-index: 11;
    height: var(--news-category-height);
    background: rgba(255, 255, 255, 0.86);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0, 95, 168, 0.1);

    display: flex;
    flex-wrap: nowrap;
    gap: 10px;

    overflow-x: scroll;
    overflow-y: hidden;

    padding: 10px 12px 12px;

    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
    overscroll-behavior-x: contain;

    &::-webkit-scrollbar {
        display: none;
    }

    @media (max-width: 410px) {
        gap: 8px;
        padding: 8px 10px 10px;
    }
`;

const CategoryPill = styled.button<{ $active?: boolean }>`
    border: 0;
    border-radius: 16px;
    padding: 0 18px;

    flex: 0 0 auto;
    min-width: max-content;
    white-space: nowrap;

    color: ${({ $active }) => ($active ? "#ffffff" : "#4a5568")};
    background: ${({ $active }) =>
        $active
            ? "linear-gradient(135deg, #005b9f, #008bd2)"
            : "rgba(255, 255, 255, 0.92)"};

    box-shadow: ${({ $active }) =>
        $active
            ? "0 12px 24px rgba(0, 91, 159, 0.24)"
            : "0 8px 20px rgba(30, 35, 50, 0.08)"};

    font-size: calc(17px * var(--app-font-scale));
    font-weight: 900;

    @media (max-width: 410px) {
        border-radius: 14px;
        padding: 0 14px;
        font-size: calc(15px * var(--app-font-scale));
    }
`;

const Content = styled.main`
    padding: 0 12px calc(118px + var(--zaui-safe-area-inset-bottom, 0px));

    @media (max-width: 410px) {
        padding-right: 10px;
        padding-left: 10px;
    }
`;

const FeaturedCard = styled.article`
    border-radius: 24px;
    background: #ffffff;
    overflow: hidden;
    box-shadow: 0 18px 36px rgba(30, 35, 50, 0.12);
    cursor: pointer;

    @media (max-width: 410px) {
        border-radius: 20px;
    }
`;

const FeaturedImage = styled.div<{ $image: string }>`
    height: clamp(196px, 55vw, 234px);
    background: linear-gradient(
            180deg,
            rgba(23, 32, 51, 0.02),
            rgba(23, 32, 51, 0.08)
        ),
        url(${({ $image }) => $image}) center/cover;
`;

const FeaturedBody = styled.div`
    padding: 20px 18px 22px;

    @media (max-width: 410px) {
        padding: 16px 14px 18px;
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

const FeaturedTitle = styled.h2`
    margin: 14px 0 12px;
    font-size: calc(24px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 900;
    color: #172033;

    @media (max-width: 410px) {
        margin: 12px 0 10px;
        font-size: calc(21px * var(--app-font-scale));
    }
`;

const Excerpt = styled.p`
    margin: 0;
    color: #707987;
    font-size: calc(17px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    @media (max-width: 410px) {
        font-size: calc(16px * var(--app-font-scale));
    }
`;

const Meta = styled.p`
    margin: 10px 0 0;
    color: #87909f;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 750;

    @media (max-width: 410px) {
        font-size: calc(13px * var(--app-font-scale));
    }
`;

const ArticleList = styled.div`
    display: grid;
    gap: 14px;
    margin-top: 16px;
`;

const ArticleCard = styled.article`
    display: grid;
    grid-template-columns: minmax(120px, 36%) 1fr;
    gap: 14px;
    min-height: 156px;
    border-radius: 22px;
    background: #ffffff;
    padding: 14px;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
    cursor: pointer;

    @media (max-width: 410px) {
        grid-template-columns: 112px 1fr;
        gap: 10px;
        min-height: 132px;
        border-radius: 18px;
        padding: 10px;
    }
`;

const ArticleImage = styled.div<{ $image: string }>`
    min-height: 128px;
    border-radius: 17px;
    background: linear-gradient(
            180deg,
            rgba(23, 32, 51, 0.02),
            rgba(23, 32, 51, 0.08)
        ),
        url(${({ $image }) => $image}) center/cover;

    @media (max-width: 410px) {
        min-height: 112px;
        border-radius: 14px;
    }
`;

const ArticleBody = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const ArticleTitle = styled.h3`
    margin: 10px 0 10px;
    color: #172033;
    font-size: calc(19px * var(--app-font-scale));
    line-height: 1.28;
    font-weight: 900;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;

    @media (max-width: 410px) {
        margin: 8px 0 6px;
        font-size: calc(16px * var(--app-font-scale));
        line-height: 1.24;
    }
`;

const ArticleExcerpt = styled(Excerpt)`
    font-size: calc(15px * var(--app-font-scale));

    @media (max-width: 410px) {
        -webkit-line-clamp: 1;
        font-size: calc(14px * var(--app-font-scale));
    }
`;

const StateBox = styled.div`
    min-height: 220px;
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

const FloatingActions = styled.div`
    position: fixed;
    right: max(16px, calc((100vw - 430px) / 2 + 16px));
    bottom: calc(86px + var(--zaui-safe-area-inset-bottom, 0px));
    z-index: 12;
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media (max-width: 410px) {
        right: 12px;
    }
`;

const FloatingButton = styled.button`
    width: 58px;
    height: 58px;
    border: 0;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    box-shadow: 0 14px 26px rgba(0, 91, 159, 0.28);

    @media (max-width: 410px) {
        width: 50px;
        height: 50px;
    }
`;

const NewsPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const [selectedTypeId, setSelectedTypeId] = useState<string>("");
    const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
    const [articles, setArticles] = useState<ApiArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const categories: Category[] = useMemo(
        () => [
            {
                id: "",
                label: "Tất cả",
            },
            ...articleTypes
                .filter(type => !type.group || type.group === "article")
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map(type => ({
                    id: type.id,
                    label: type.title ?? type.name ?? "Tin tức",
                })),
        ],
        [articleTypes],
    );

    const featuredArticle = articles[0];
    const normalArticles = articles.slice(1);

    useEffect(() => {
        const loadArticleTypes = async () => {
            try {
                const data = await getArticleTypes();

                console.log("Danh sách loại tin:", data);

                setArticleTypes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Lỗi lấy danh sách loại tin:", error);
                setArticleTypes([]);
            }
        };

        loadArticleTypes();
    }, []);

    useEffect(() => {
        const loadArticles = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const backendArticles = await getArticles({
                    page: 0,
                    size: 10,
                    typeId: selectedTypeId || undefined,
                }).catch(error => {
                    console.error("Lỗi lấy tin từ BE:", error);

                    return [];
                });
                console.log(backendArticles);
                // Chỉ lấy tin web ở tab "Tất cả"
                const webArticles = selectedTypeId
                    ? []
                    : await getBaoMoiTayNinhArticles().catch(error => {
                          console.error("Lỗi lấy tin từ web:", error);

                          return [];
                      });

                const mixedArticles = selectedTypeId
                    ? backendArticles
                    : interleaveArticles(backendArticles, webArticles);

                setArticles(mixedArticles);
            } catch (error) {
                console.error("Lỗi lấy tin tức:", error);
                setArticles([]);
                setErrorMessage("Không thể tải danh sách tin tức.");
            } finally {
                setLoading(false);
            }
        };

        loadArticles();
    }, [selectedTypeId]);

    const openArticle = async (article: ApiArticle) => {
        if (isWebArticle(article) && article.link) {
            try {
                await openWebView(article.link);
            } catch (error) {
                console.error("Lỗi mở bài viết web:", error);
            }

            return;
        }

        navigate(`/news/${article.id}`, {
            direction: "forward",
        });
    };

    const scrollToTop = () => {
        const page = document.getElementById("news-page");

        page?.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <NewsPageWrapper id="news-page">
            <AppHeader
                back
                title="Tin tức"
                description="Cập nhật tin tức, thông báo và hoạt động địa phương"
                onBack={() => navigate("/", { direction: "backward" })}
            />
            <CategoryBar>
                {categories.map(category => (
                    <CategoryPill
                        key={category.id ?? category.label}
                        $active={selectedTypeId === (category.id ?? "")}
                        onClick={event => {
                            const nextTypeId = category.id ?? "";

                            setSelectedTypeId(nextTypeId);

                            event.currentTarget.scrollIntoView({
                                behavior: "smooth",
                                inline: "center",
                                block: "nearest",
                            });

                            document.getElementById("news-page")?.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                    >
                        {category.label}
                    </CategoryPill>
                ))}
            </CategoryBar>

            <Content>
                {loading && <StateBox>Đang tải tin tức...</StateBox>}

                {!loading && errorMessage && (
                    <StateBox>{errorMessage}</StateBox>
                )}

                {!loading && !errorMessage && articles.length === 0 && (
                    <StateBox>Chưa có tin tức nào.</StateBox>
                )}

                {!loading && !errorMessage && featuredArticle && (
                    <>
                        <FeaturedCard
                            onClick={() => openArticle(featuredArticle)}
                        >
                            <FeaturedImage
                                $image={getImageUrl(featuredArticle, 0)}
                            />

                            <FeaturedBody>
                                <Chip>
                                    {getArticleCategory(featuredArticle)}
                                </Chip>

                                <FeaturedTitle>
                                    {featuredArticle.title}
                                </FeaturedTitle>

                                <Excerpt>{featuredArticle.desc ?? ""}</Excerpt>

                                <Meta>
                                    {featuredArticle.author ?? "Ban biên tập"}
                                    {featuredArticle.publishedAt
                                        ? ` · ${formatDate(
                                              featuredArticle.publishedAt,
                                          )}`
                                        : ""}
                                </Meta>
                            </FeaturedBody>
                        </FeaturedCard>

                        <ArticleList>
                            {normalArticles.map((article, index) => (
                                <ArticleCard
                                    key={article.id}
                                    onClick={() => openArticle(article)}
                                >
                                    <ArticleImage
                                        $image={getImageUrl(article, index + 1)}
                                    />

                                    <ArticleBody>
                                        <Chip>
                                            {getArticleCategory(article)}
                                        </Chip>

                                        <ArticleTitle>
                                            {article.title}
                                        </ArticleTitle>

                                        <ArticleExcerpt>
                                            {article.desc ?? ""}
                                        </ArticleExcerpt>

                                        <Meta>
                                            {article.author ?? "Ban biên tập"}
                                            {article.publishedAt
                                                ? ` · ${formatDate(
                                                      article.publishedAt,
                                                  )}`
                                                : ""}
                                        </Meta>
                                    </ArticleBody>
                                </ArticleCard>
                            ))}
                        </ArticleList>
                    </>
                )}
            </Content>

            <FloatingActions>
                <FloatingButton
                    aria-label="Lên đầu trang"
                    onClick={scrollToTop}
                >
                    <Icon icon="zi-arrow-up" size={28} />
                </FloatingButton>
            </FloatingActions>
            <AppBottomNav />
        </NewsPageWrapper>
    );
};

export default NewsPage;
