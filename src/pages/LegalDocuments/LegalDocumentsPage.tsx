import AppHeader from "@components/layout/AppHeader";
import {
    getLegalDocuments,
    type LegalDocument,
} from "@/services/legal-document";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";
import AppBottomNav from "@/components/layout/AppBottomNav";

const PageWrapper = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    background: radial-gradient(
            circle at 36px 132px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 224px, #f5f7fb 100%);
    color: #172033;
    padding: 112px 0 32px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
        sans-serif;
`;

const Content = styled.main`
    padding: 14px 16px 120px;
`;

const SearchBox = styled.label`
    height: 56px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(30, 35, 50, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 18px;
    color: #98a2b3;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
`;

const SearchInput = styled.input`
    width: 100%;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    font-weight: 500;

    &::placeholder {
        color: #8e96a3;
    }
`;

const DocumentList = styled.div`
    display: grid;
    gap: 14px;
    margin-top: 18px;
`;

const DocumentCard = styled.article`
    min-height: 106px;
    border: 0;
    border-radius: 22px;
    background: #ffffff;
    display: grid;
    grid-template-columns: 58px 1fr 24px;
    gap: 16px;
    align-items: center;
    padding: 16px;
    width: 100%;
    text-align: left;
    box-shadow: 0 16px 32px rgba(30, 35, 50, 0.1);
`;

const DocumentButton = styled.button`
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
`;

const DocumentIcon = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    color: #0063a7;
    background: radial-gradient(
            circle at 35% 25%,
            rgba(255, 255, 255, 0.9),
            transparent 22%
        ),
        linear-gradient(135deg, #f7fcff, #e4f3ff);
`;

const DocumentBody = styled.div`
    min-width: 0;
`;

const DocumentTitle = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 930;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const DocumentMeta = styled.p`
    margin: 8px 0 0;
    color: #737c89;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Arrow = styled.div`
    color: #a3abb5;
    display: grid;
    place-items: center;
`;

const StateBox = styled.div`
    margin-top: 18px;
    min-height: 160px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.78);
    display: grid;
    place-items: center;
    padding: 24px;
    text-align: center;
    color: #64748b;
    box-shadow: 0 14px 28px rgba(30, 35, 50, 0.08);
`;

const StateText = styled.p`
    margin: 10px 0 0;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 600;
`;

const RetryButton = styled.button`
    margin-top: 14px;
    height: 40px;
    border: 0;
    border-radius: 999px;
    padding: 0 18px;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 800;
`;

const FloatingActions = styled.div`
    position: fixed;
    right: max(16px, calc((100vw - 430px) / 2 + 16px));
    bottom: 28px;
    z-index: 12;
    display: flex;
    flex-direction: column;
    gap: 12px;
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
`;

function formatDate(value?: string) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function getDocumentCategory(document: LegalDocument) {
    return (
        document.documentCategory?.name ||
        document.documentCategory?.title ||
        document.category ||
        "Văn bản pháp luật"
    );
}

function getDocumentCode(document: LegalDocument) {
    return document.code || document.documentNumber || "";
}

function getDocumentDate(document: LegalDocument) {
    return formatDate(
        document.issuedAt || document.issuedDate || document.effectiveDate,
    );
}

function getDocumentMeta(document: LegalDocument) {
    const parts = [
        getDocumentCategory(document),
        getDocumentCode(document),
        getDocumentDate(document),
    ].filter(Boolean);

    return parts.join(" · ");
}

const LegalDocumentsPage: React.FunctionComponent = () => {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<LegalDocument[]>([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getLegalDocuments({
                page: 0,
                size: 30,
                keyword: keyword.trim(),
            });
            setDocuments(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Không thể tải danh sách văn bản.";

            setError(message);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [keyword]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            void loadDocuments();
        }, 350);

        return () => {
            window.clearTimeout(timer);
        };
    }, [loadDocuments]);

    const hasDocuments = useMemo(() => documents.length > 0, [documents]);

    return (
        <PageWrapper id="legal-documents-page">
            <AppHeader
                back
                title="Văn bản pháp luật"
                description="Tra cứu, theo dõi văn bản và chính sách mới"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <SearchBox>
                    <Icon icon="zi-search" size={28} />
                    <SearchInput
                        placeholder="Tìm văn bản..."
                        value={keyword}
                        onChange={event => setKeyword(event.target.value)}
                    />
                </SearchBox>

                {loading && (
                    <StateBox>
                        <div>
                            <Spinner />
                            <StateText>Đang tải danh sách văn bản...</StateText>
                        </div>
                    </StateBox>
                )}

                {!loading && error && (
                    <StateBox>
                        <div>
                            <Icon icon="zi-info-circle" size={34} />
                            <StateText>{error}</StateText>
                            <RetryButton type="button" onClick={loadDocuments}>
                                Thử lại
                            </RetryButton>
                        </div>
                    </StateBox>
                )}

                {!loading && !error && !hasDocuments && (
                    <StateBox>
                        <div>
                            <Icon icon="zi-file" size={34} />
                            <StateText>Chưa có văn bản nào.</StateText>
                        </div>
                    </StateBox>
                )}

                {!loading && !error && hasDocuments && (
                    <DocumentList>
                        {documents.map(document => (
                            <DocumentButton
                                key={document.id}
                                type="button"
                                onClick={() =>
                                    navigate(`/legal-documents/${document.id}`)
                                }
                            >
                                <DocumentCard>
                                    <DocumentIcon>
                                        <Icon icon="zi-file" size={28} />
                                    </DocumentIcon>

                                    <DocumentBody>
                                        <DocumentTitle>
                                            {document.title ||
                                                "Chưa có tiêu đề"}
                                        </DocumentTitle>
                                        <DocumentMeta>
                                            {getDocumentMeta(document)}
                                        </DocumentMeta>
                                    </DocumentBody>

                                    <Arrow>
                                        <Icon
                                            icon="zi-chevron-right"
                                            size={26}
                                        />
                                    </Arrow>
                                </DocumentCard>
                            </DocumentButton>
                        ))}
                    </DocumentList>
                )}
            </Content>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default LegalDocumentsPage;
