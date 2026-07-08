import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@components/layout/AppHeader";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";
import {
    createJobApplication,
    getJobById,
    recordJobView,
    type CreateJobApplicationPayload,
    type Job,
} from "@/services/jobs";

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
    border-radius: 24px;
    background: linear-gradient(135deg, #a40516 0%, #d91527 52%, #f04438 100%);
    color: #ffffff;
    padding: 22px 18px;
    box-shadow: 0 16px 30px rgba(168, 5, 22, 0.24);
`;

const BadgeRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
`;

const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 30px;
    padding: 6px 11px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.22);
    color: #ffffff;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 850;
    backdrop-filter: blur(8px);
`;

const Title = styled.h1`
    margin: 0;
    font-size: calc(24px * var(--app-font-scale));
    line-height: 1.24;
    font-weight: 950;
`;

const Company = styled.div`
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.86);
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 800;
`;

const SalaryBox = styled.div`
    margin-top: 18px;
    padding: 14px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.18);
`;

const SalaryLabel = styled.div`
    color: rgba(255, 255, 255, 0.76);
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 800;
    margin-bottom: 4px;
`;

const SalaryValue = styled.div`
    color: #ffffff;
    font-size: calc(20px * var(--app-font-scale));
    font-weight: 950;
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

const Description = styled.p`
    margin: 0;
    color: #526173;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.65;
    white-space: pre-line;
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

const BottomActions = styled.div`
    position: fixed;
    left: 50%;
    bottom: 0;
    z-index: 30;
    width: min(430px, 100vw);
    transform: translateX(-50%);
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.94);
    border-top: 1px solid rgba(143, 153, 168, 0.18);
    backdrop-filter: blur(14px);
    display: grid;
    grid-template-columns: 54px 1fr;
    gap: 10px;
`;

const IconAction = styled.button`
    height: 52px;
    border: 1px solid #ffe0e3;
    border-radius: 17px;
    background: #fff5f6;
    color: #b20a1b;
    display: grid;
    place-items: center;

    &:active {
        transform: scale(0.97);
    }
`;

const PrimaryButton = styled.button`
    height: 52px;
    border: 0;
    border-radius: 17px;
    background: linear-gradient(135deg, #a40516, #f0182c);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 950;
    box-shadow: 0 12px 24px rgba(168, 5, 22, 0.24);

    &:active {
        transform: scale(0.97);
    }
`;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgba(15, 23, 42, 0.48);
    display: flex;
    align-items: flex-end;
    justify-content: center;
`;

const FormPanel = styled.form`
    width: min(430px, 100vw);
    max-height: 88vh;
    overflow-y: auto;
    border-radius: 26px 26px 0 0;
    background: #ffffff;
    padding: 18px 16px calc(18px + env(safe-area-inset-bottom));
    box-shadow: 0 -16px 30px rgba(15, 23, 42, 0.18);
`;

const FormHead = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
`;

const FormTitle = styled.h3`
    margin: 0;
    color: #182132;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 950;
`;

const CloseButton = styled.button`
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 14px;
    display: grid;
    place-items: center;
    color: #64748b;
    background: #f1f5f9;
`;

const Field = styled.label`
    display: grid;
    gap: 7px;
    margin-top: 12px;
    color: #334155;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 850;
`;

const Input = styled.input`
    width: 100%;
    height: 48px;
    border: 1px solid #e2e8f0;
    border-radius: 15px;
    padding: 0 13px;
    outline: 0;
    color: #0f172a;
    background: #ffffff;
    font-size: calc(14px * var(--app-font-scale));

    &:focus {
        border-color: #d91527;
        box-shadow: 0 0 0 3px rgba(217, 21, 39, 0.1);
    }
`;

const Textarea = styled.textarea`
    width: 100%;
    min-height: 96px;
    border: 1px solid #e2e8f0;
    border-radius: 15px;
    padding: 12px 13px;
    outline: 0;
    resize: vertical;
    color: #0f172a;
    background: #ffffff;
    font-size: calc(14px * var(--app-font-scale));
    font-family: inherit;

    &:focus {
        border-color: #d91527;
        box-shadow: 0 0 0 3px rgba(217, 21, 39, 0.1);
    }
`;

const SubmitButton = styled.button`
    width: 100%;
    height: 50px;
    margin-top: 16px;
    border: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, #a40516, #f0182c);
    color: #ffffff;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 950;

    &:disabled {
        opacity: 0.6;
    }
`;

const FormMessage = styled.div<{ $error?: boolean }>`
    margin-top: 12px;
    color: ${({ $error }) => ($error ? "#b91c1c" : "#128967")};
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 800;
    line-height: 1.45;
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
            companyName?: unknown;
            value?: unknown;
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

        if (typeof data.companyName === "string") {
            return data.companyName;
        }

        if (typeof data.value === "string") {
            return data.value;
        }
    }

    return "";
}

function getJobTitle(job: Job) {
    return getTextValue(job.title) || "Tin tuyển dụng";
}

function getCompanyName(job: Job) {
    return (
        getTextValue(job.companyName) ||
        getTextValue(job.company) ||
        "Đơn vị tuyển dụng"
    );
}

function getJobLocation(job: Job) {
    return (
        getTextValue(job.location) ||
        getTextValue(job.area) ||
        "Địa điểm đang cập nhật"
    );
}

function getJobSalary(job: Job) {
    return getTextValue(job.salary) || "Có thương lượng";
}

function getJobType(job: Job) {
    return (
        getTextValue(job.workType) ||
        getTextValue(job.employmentType) ||
        "Đang cập nhật"
    );
}

function getJobDescription(job: Job) {
    return (
        getTextValue(job.description) ||
        "Thông tin mô tả công việc đang được cập nhật."
    );
}

function getJobRequirement(job: Job) {
    return (
        getTextValue(job.requirement) ||
        getTextValue(job.requirements) ||
        "Yêu cầu công việc đang được cập nhật."
    );
}

function getJobBenefit(job: Job) {
    return (
        getTextValue(job.benefit) ||
        getTextValue(job.benefits) ||
        "Quyền lợi đang được cập nhật."
    );
}

function formatDate(value?: string) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("vi-VN").format(date);
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

const JobDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [showApplyForm, setShowApplyForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formMessage, setFormMessage] = useState("");
    const [formError, setFormError] = useState("");

    const [form, setForm] = useState<CreateJobApplicationPayload>({
        fullName: "",
        phone: "",
        email: "",
        note: "",
    });

    const deadlineText = useMemo(() => formatDate(job?.deadline), [job]);

    useEffect(() => {
        let active = true;

        async function loadJobDetail() {
            if (!id) {
                setError("Không tìm thấy mã tin tuyển dụng.");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getJobById(id);

                if (!active) {
                    return;
                }

                setJob(data);

                try {
                    await recordJobView(id, {});
                } catch {
                    // Không chặn hiển thị chi tiết nếu API ghi lượt xem lỗi.
                }
            } catch (err) {
                if (!active) {
                    return;
                }

                setJob(null);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải chi tiết việc làm.",
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadJobDetail();

        return () => {
            active = false;
        };
    }, [id]);

    const handleChange =
        (key: keyof CreateJobApplicationPayload) =>
        (
            event:
                | React.ChangeEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLTextAreaElement>,
        ) => {
            setForm(prev => ({
                ...prev,
                [key]: event.target.value,
            }));
        };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!id) {
            setFormError("Không tìm thấy mã tin tuyển dụng.");
            return;
        }

        if (!form.fullName || !form.phone) {
            setFormError("Vui lòng nhập họ tên và số điện thoại.");
            return;
        }

        try {
            setSubmitting(true);
            setFormError("");
            setFormMessage("");

            await createJobApplication(id, form);

            setFormMessage("Gửi thông tin ứng tuyển thành công.");
            setForm({
                fullName: "",
                phone: "",
                email: "",
                note: "",
            });
        } catch (err) {
            setFormError(
                err instanceof Error
                    ? err.message
                    : "Không thể gửi thông tin ứng tuyển.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCall = () => {
        const phone = getTextValue(job?.phone);

        if (!phone) {
            setShowApplyForm(true);
            return;
        }

        window.location.href = `tel:${phone}`;
    };

    return (
        <PageWrapper>
            <AppHeader
                back
                title="Chi tiết việc làm"
                description="Thông tin tuyển dụng và ứng tuyển"
                onBack={() => navigate(-1)}
            />

            <Content>
                {loading ? (
                    <LoadingBox>
                        <Spinner />
                        Đang tải chi tiết việc làm...
                    </LoadingBox>
                ) : error ? (
                    <StateBox>{error}</StateBox>
                ) : job ? (
                    <>
                        <HeroCard>
                            <BadgeRow>
                                <Badge>
                                    <Icon icon="zi-clock-1" size={14} />
                                    {getJobType(job)}
                                </Badge>

                                {job.status ? (
                                    <Badge>
                                        <Icon
                                            icon="zi-check-circle"
                                            size={14}
                                        />
                                        {getTextValue(job.status)}
                                    </Badge>
                                ) : null}
                            </BadgeRow>

                            <Title>{getJobTitle(job)}</Title>

                            <Company>{getCompanyName(job)}</Company>

                            <SalaryBox>
                                <SalaryLabel>Mức lương</SalaryLabel>
                                <SalaryValue>{getJobSalary(job)}</SalaryValue>
                            </SalaryBox>
                        </HeroCard>

                        <Section>
                            <SectionTitle>Thông tin chung</SectionTitle>

                            <InfoGrid>
                                <InfoRow
                                    icon="zi-location"
                                    label="Địa điểm"
                                    value={getJobLocation(job)}
                                />

                                <InfoRow
                                    icon="zi-calendar"
                                    label="Hạn nộp hồ sơ"
                                    value={deadlineText || "Đang cập nhật"}
                                />

                                <InfoRow
                                    icon="zi-user"
                                    label="Đơn vị tuyển dụng"
                                    value={getCompanyName(job)}
                                />

                                <InfoRow
                                    icon="zi-eye"
                                    label="Lượt xem"
                                    value={job.views}
                                />

                                <InfoRow
                                    icon="zi-heart"
                                    label="Lượt quan tâm"
                                    value={job.likes}
                                />
                            </InfoGrid>
                        </Section>

                        <Section>
                            <SectionTitle>Mô tả công việc</SectionTitle>
                            <Description>{getJobDescription(job)}</Description>
                        </Section>

                        <Section>
                            <SectionTitle>Yêu cầu ứng viên</SectionTitle>
                            <Description>{getJobRequirement(job)}</Description>
                        </Section>

                        <Section>
                            <SectionTitle>Quyền lợi</SectionTitle>
                            <Description>{getJobBenefit(job)}</Description>
                        </Section>
                    </>
                ) : (
                    <StateBox>Không tìm thấy tin tuyển dụng.</StateBox>
                )}
            </Content>

            {job ? (
                <BottomActions>
                    <IconAction type="button" onClick={handleCall}>
                        <Icon icon="zi-call" size={24} />
                    </IconAction>

                    <PrimaryButton
                        type="button"
                        onClick={() => setShowApplyForm(true)}
                    >
                        <Icon icon="zi-send" size={18} />
                        Ứng tuyển ngay
                    </PrimaryButton>
                </BottomActions>
            ) : null}

            {showApplyForm ? (
                <Overlay>
                    <FormPanel onSubmit={handleSubmit}>
                        <FormHead>
                            <FormTitle>Thông tin ứng tuyển</FormTitle>

                            <CloseButton
                                type="button"
                                onClick={() => setShowApplyForm(false)}
                            >
                                <Icon icon="zi-close" size={20} />
                            </CloseButton>
                        </FormHead>

                        <Field>
                            Họ và tên
                            <Input
                                placeholder="Nhập họ và tên"
                                value={getTextValue(form.fullName)}
                                onChange={handleChange("fullName")}
                            />
                        </Field>

                        <Field>
                            Số điện thoại
                            <Input
                                placeholder="Nhập số điện thoại"
                                value={getTextValue(form.phone)}
                                onChange={handleChange("phone")}
                            />
                        </Field>

                        <Field>
                            Email
                            <Input
                                placeholder="Nhập email nếu có"
                                value={getTextValue(form.email)}
                                onChange={handleChange("email")}
                            />
                        </Field>

                        <Field>
                            Ghi chú
                            <Textarea
                                placeholder="Nhập kinh nghiệm, mong muốn hoặc lời nhắn"
                                value={getTextValue(form.note)}
                                onChange={handleChange("note")}
                            />
                        </Field>

                        {formError ? (
                            <FormMessage $error>{formError}</FormMessage>
                        ) : null}

                        {formMessage ? (
                            <FormMessage>{formMessage}</FormMessage>
                        ) : null}

                        <SubmitButton type="submit" disabled={submitting}>
                            {submitting ? "Đang gửi..." : "Gửi ứng tuyển"}
                        </SubmitButton>
                    </FormPanel>
                </Overlay>
            ) : null}

            <AppBottomNav />
        </PageWrapper>
    );
};

export default JobDetailPage;
