import type { Article } from "@/services/news";

const BAOMOI_TAY_NINH_URL = "https://baomoi.com/tay-ninh-tag3238.epi";
const BAOMOI_ORIGIN = "https://baomoi.com";
const ALL_ORIGINS_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(
    BAOMOI_TAY_NINH_URL,
)}`;
const JINA_READER_URL = `https://r.jina.ai/http://r.jina.ai/http://${BAOMOI_TAY_NINH_URL}`;

type BaoMoiPublisher = {
    name?: string;
    shortName?: string;
};

type BaoMoiArticle = {
    id?: number | string;
    contentId?: number | string;
    title?: string;
    description?: string;
    date?: number;
    url?: string;
    redirectUrl?: string;
    thumb?: string;
    thumbL?: string;
    publisher?: BaoMoiPublisher;
};

type BaoMoiNextData = {
    props?: {
        pageProps?: unknown;
    };
};

function asObject(value: unknown): Record<string, unknown> | null {
    if (typeof value === "object" && value !== null) {
        return value as Record<string, unknown>;
    }

    return null;
}

function collectArticleLists(value: unknown): BaoMoiArticle[][] {
    const objectValue = asObject(value);

    if (!objectValue) {
        return [];
    }

    return Object.values(objectValue).reduce<BaoMoiArticle[][]>(
        (lists, child) => {
            if (Array.isArray(child)) {
                const articleItems = child.filter(item => {
                    const article = asObject(item);

                    return Boolean(article?.title && article?.url);
                }) as BaoMoiArticle[];

                if (articleItems.length > 0) {
                    lists.push(articleItems);
                }

                return lists;
            }

            lists.push(...collectArticleLists(child));

            return lists;
        },
        [],
    );
}

function absolutizeBaoMoiUrl(url?: string) {
    if (!url) return BAOMOI_TAY_NINH_URL;

    const cleanUrl = url.split("#")[0];

    if (cleanUrl.startsWith("http")) {
        return cleanUrl;
    }

    return `${BAOMOI_ORIGIN}${cleanUrl.startsWith("/") ? "" : "/"}${cleanUrl}`;
}

function mapBaoMoiArticle(article: BaoMoiArticle): Article | null {
    const id = article.contentId ?? article.id;
    const title = article.title?.trim();

    if (!id || !title) {
        return null;
    }

    const publishedAt = article.date
        ? new Date(article.date * 1000).toISOString()
        : new Date().toISOString();

    return {
        id: `web-baomoi-${id}`,
        title,
        author:
            article.publisher?.shortName ??
            article.publisher?.name ??
            "Báo Mới",
        desc: article.description ?? null,
        link: absolutizeBaoMoiUrl(article.redirectUrl ?? article.url),
        thumb: article.thumbL ?? article.thumb ?? null,
        typeId: "web-baomoi",
        type: {
            id: "web-baomoi",
            title: "Tin web",
        },
        likes: 0,
        views: 0,
        publishedAt,
    };
}

function parseNextDataArticles(html: string): Article[] {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    const nextDataText =
        document.getElementById("__NEXT_DATA__")?.textContent ?? "";

    if (!nextDataText) {
        return [];
    }

    const nextData = JSON.parse(nextDataText) as BaoMoiNextData;
    const articleLists = collectArticleLists(nextData.props?.pageProps);
    const longestArticleList = articleLists.sort(
        (current, next) => next.length - current.length,
    )[0];

    return (longestArticleList ?? [])
        .map(mapBaoMoiArticle)
        .filter(Boolean) as Article[];
}

function parseMarkdownArticles(markdown: string): Article[] {
    const articlePattern =
        /\]\((https:\/\/baomoi\.com\/[^)\s]+)\s+"([^"]+)"\)\s*\n+([\s\S]*?)(?=\n\[!\[Image|\n\n[A-ZÀ-Ỹ].{8,}\n|$)/g;
    const articles: Article[] = [];
    let match = articlePattern.exec(markdown);

    while (match && articles.length < 20) {
        const [, url, title, description] = match;
        const id = url.match(/-c(\d+)\.epi/)?.[1] ?? String(articles.length);

        articles.push({
            id: `web-baomoi-${id}`,
            title: title.trim(),
            author: "Báo Mới",
            desc: description.replace(/\s+/g, " ").trim() || null,
            link: url,
            thumb: null,
            typeId: "web-baomoi",
            type: {
                id: "web-baomoi",
                title: "Tin web",
            },
            likes: 0,
            views: 0,
            publishedAt: new Date().toISOString(),
        });

        match = articlePattern.exec(markdown);
    }

    return articles;
}

async function fetchText(url: string) {
    const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`Không thể tải tin web: ${response.status}`);
    }

    return response.text();
}

export async function getBaoMoiTayNinhArticles(): Promise<Article[]> {
    try {
        const markdown = await fetchText(JINA_READER_URL);
        const articles = parseMarkdownArticles(markdown);

        if (articles.length > 0) return articles;
    } catch (error) {
        console.warn("Không thể lấy bản đọc Báo Mới:", error);
    }

    try {
        const html = await fetchText(ALL_ORIGINS_URL);

        return parseNextDataArticles(html);
    } catch (error) {
        console.warn("Không thể lấy HTML Báo Mới:", error);

        return [];
    }
}
