import AppHeader from "@components/layout/AppHeader";
import {
    getLegalDocumentById,
    type LegalDocument,
} from "@/services/legal-document";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";
import AppBottomNav from "@/components/layout/AppBottomNav";
import { openWebview } from "zmp-sdk";

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
    padding: 14px 16px 96px;
`;

const HeroCard = styled.section`
    border-radius: 26px;
    padding: 20px;
    color: #ffffff;
    background: linear-gradient(135deg, #004f8f, #0084c7);
    box-shadow: 0 18px 36px rgba(0, 79, 143, 0.26);
`;

const Badge = styled.div`
    width: fit-content;
    max-width: 100%;
    border-radius: 999px;
    padding: 7px 12px;
    background: rgba(255, 255, 255, 0.18);
    color: rgba(255, 255, 255, 0.92);
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Title = styled.h1`
    margin: 14px 0 0;
    font-size: calc(24px * var(--app-font-scale));
    line-height: 1.22;
    font-weight: 950;
`;

const CodeText = styled.p`
    margin: 12px 0 0;
    color: rgba(255, 255, 255, 0.86);
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 700;
`;

const InfoGrid = styled.div`
    display: grid;
    gap: 12px;
    margin-top: 16px;
`;

const InfoItem = styled.div`
    border-radius: 20px;
    background: #ffffff;
    padding: 15px 16px;
    display: grid;
    grid-template-columns: 42px 1fr;
    gap: 12px;
    align-items: center;
    box-shadow: 0 14px 28px rgba(30, 35, 50, 0.08);
`;

const InfoIcon = styled.div`
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    color: #0063a7;
    background: linear-gradient(135deg, #f7fcff, #e4f3ff);
`;

const InfoLabel = styled.div`
    color: #7a8492;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 700;
`;

const InfoValue = styled.div`
    margin-top: 3px;
    color: #172033;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 850;
`;

const Section = styled.section`
    margin-top: 16px;
    border-radius: 24px;
    background: #ffffff;
    padding: 18px;
    box-shadow: 0 14px 28px rgba(30, 35, 50, 0.08);
`;

const SectionTitle = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 950;
`;

const Paragraph = styled.p`
    margin: 12px 0 0;
    color: #475569;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.65;
    font-weight: 500;
    white-space: pre-line;
`;

const ActionButton = styled.button`
    width: 100%;
    height: 50px;
    margin-top: 16px;
    border: 0;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 900;
    box-shadow: 0 14px 26px rgba(0, 91, 159, 0.24);
`;

const StateBox = styled.div`
    min-height: 260px;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.82);
    display: grid;
    place-items: center;
    padding: 28px;
    text-align: center;
    color: #64748b;
    box-shadow: 0 14px 28px rgba(30, 35, 50, 0.08);
`;

const StateText = styled.p`
    margin: 12px 0 0;
    font-size: calc(16px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 700;
`;

const RetryButton = styled.button`
    margin-top: 14px;
    height: 42px;
    border: 0;
    border-radius: 999px;
    padding: 0 18px;
    color: #ffffff;
    background: linear-gradient(135deg, #005b9f, #008bd2);
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 850;
`;

function formatDate(value?: string) {
    if (!value) {
        return "Chưa cập nhật";
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

function getCategory(document?: LegalDocument) {
    if (!document) {
        return "Văn bản pháp luật";
    }

    return (
        document.documentCategory?.name ||
        document.documentCategory?.title ||
        document.category ||
        "Văn bản pháp luật"
    );
}

function getDocumentCode(document: LegalDocument) {
    return document.code || document.documentNumber || "Chưa cập nhật số hiệu";
}

function getIssuedDate(document: LegalDocument) {
    return document.issuedAt || document.issuedDate;
}

function getFileUrl(document: LegalDocument) {
    return document.fileUrl || document.link || "";
}

const LegalDocumentDetailPage: React.FunctionComponent = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [document, setDocument] = useState<LegalDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDocument = useCallback(async () => {
        if (!id) {
            setError("Không tìm thấy mã văn bản.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const data = await getLegalDocumentById(id);
            console.log(data);
            setDocument(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Không thể tải chi tiết văn bản.";

            setError(message);
            setDocument(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadDocument();
    }, [loadDocument]);

    const fileUrl = useMemo(() => {
        if (!document) {
            return "";
        }

        return getFileUrl(document);
    }, [document]);
    const openFile = async () => {
        if (!fileUrl) {
            return;
        }

        try {
            await openWebview({
                url: fileUrl,
                config: {
                    style: "normal",
                    leftButton: "back",
                },
            });
        } catch (error) {
            console.error("Không thể mở văn bản:", error);
        }
    };

    return (
        <PageWrapper id="legal-document-detail-page">
            <AppHeader
                back
                title="Chi tiết văn bản"
                description="Thông tin văn bản pháp luật"
                onBack={() =>
                    navigate("/legal-documents", { direction: "backward" })
                }
            />

            <Content>
                {loading && (
                    <StateBox>
                        <div>
                            <Spinner />
                            <StateText>Đang tải chi tiết văn bản...</StateText>
                        </div>
                    </StateBox>
                )}

                {!loading && error && (
                    <StateBox>
                        <div>
                            <Icon icon="zi-info-circle" size={36} />
                            <StateText>{error}</StateText>
                            <RetryButton type="button" onClick={loadDocument}>
                                Thử lại
                            </RetryButton>
                        </div>
                    </StateBox>
                )}

                {!loading && !error && document && (
                    <>
                        <HeroCard>
                            <Badge>{getCategory(document)}</Badge>

                            <Title>{document.title || "Chưa có tiêu đề"}</Title>

                            <CodeText>{getDocumentCode(document)}</CodeText>
                        </HeroCard>

                        <InfoGrid>
                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-calendar" size={23} />
                                </InfoIcon>
                                <div>
                                    <InfoLabel>Ngày ban hành</InfoLabel>
                                    <InfoValue>
                                        {formatDate(getIssuedDate(document))}
                                    </InfoValue>
                                </div>
                            </InfoItem>

                            <InfoItem>
                                <InfoIcon>
                                    <Icon icon="zi-file" size={23} />
                                </InfoIcon>
                                <div>
                                    <InfoLabel>Loại văn bản</InfoLabel>
                                    <InfoValue>
                                        {getCategory(document)}
                                    </InfoValue>
                                </div>
                            </InfoItem>
                        </InfoGrid>

                        {document.summary && (
                            <Section>
                                <SectionTitle>Tóm tắt</SectionTitle>
                                <Paragraph>{document.summary}</Paragraph>
                            </Section>
                        )}

                        {fileUrl && (
                            <ActionButton type="button" onClick={openFile}>
                                <Icon icon="zi-eye" size={22} />
                                Xem nội dung văn bản
                            </ActionButton>
                        )}
                    </>
                )}
            </Content>
            <AppBottomNav />
        </PageWrapper>
    );
};

export default LegalDocumentDetailPage;
