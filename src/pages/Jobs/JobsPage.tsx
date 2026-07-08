import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@components/layout/AppHeader";
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { Icon, Page, Spinner, useNavigate } from "zmp-ui";
import { getJobs, type Job } from "@/services/jobs";

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
    padding: 0 16px;
`;

const SearchBox = styled.label`
    height: 58px;
    border-radius: 18px;
    background: #ffffff;
    border: 1px solid rgba(143, 153, 168, 0.16);
    box-shadow: 0 8px 18px rgba(18, 28, 45, 0.08);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    color: #99a0aa;
`;

const SearchInput = styled.input`
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: #172033;
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 600;

    &::placeholder {
        color: #8d949e;
    }
`;

const JobList = styled.div`
    display: grid;
    gap: 14px;
    margin-top: 26px;
`;

const JobCard = styled.button`
    width: 100%;
    border: 1px solid rgba(143, 153, 168, 0.08);
    border-radius: 22px;
    background: #ffffff;
    padding: 20px 17px 19px;
    box-shadow: 0 12px 25px rgba(18, 28, 45, 0.1);
    text-align: left;
    cursor: pointer;

    &:active {
        transform: scale(0.985);
    }
`;

const JobTitle = styled.h2`
    margin: 0 0 12px;
    color: #182132;
    font-size: calc(19px * var(--app-font-scale));
    line-height: 1.32;
    font-weight: 950;
`;

const CompanyName = styled.div`
    margin-bottom: 14px;
    color: #475569;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 800;
`;

const LocationRow = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: #868d97;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 650;
`;

const DetailRow = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: 12px;
    flex-wrap: wrap;
`;

const Salary = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #128967;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 900;
`;

const WorkType = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #9aa0a8;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 700;
`;

const MoneyMark = styled.span`
    color: #13a279;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 950;
`;

const SuitcaseIcon = styled.span`
    position: relative;
    width: 18px;
    height: 15px;
    border: 2px solid #a3a8b0;
    border-radius: 4px;
    flex: none;

    &::before {
        content: "";
        position: absolute;
        left: 4px;
        right: 4px;
        top: -6px;
        height: 6px;
        border: 2px solid #a3a8b0;
        border-bottom: 0;
        border-radius: 5px 5px 0 0;
    }
`;

const MetaRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 15px;
    padding-top: 14px;
    border-top: 1px solid #eef2f7;
`;

const MetaText = styled.span`
    color: #94a3b8;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 750;
`;

const ViewDetail = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #0b74b8;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;
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
    background: linear-gradient(135deg, #a40516, #f0182c);
    box-shadow: 0 14px 26px rgba(168, 5, 22, 0.28);

    &:active {
        transform: scale(0.96);
    }
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

const JobsPage: React.FC = () => {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const totalText = useMemo(() => {
        if (jobs.length <= 0) {
            return "";
        }

        return `${jobs.length} việc làm`;
    }, [jobs.length]);

    useEffect(() => {
        let active = true;
        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);
                setError("");

                const result = await getJobs({
                    page: 0,
                    size: 20,
                    keyword: keyword.trim(),
                });

                if (!active) {
                    return;
                }

                setJobs(result.data);
            } catch (err) {
                if (!active) {
                    return;
                }

                setJobs([]);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Không thể tải danh sách việc làm.",
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
        const page = document.getElementById("jobs-page");

        page?.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <PageWrapper id="jobs-page">
            <AppHeader
                back
                title="Việc làm"
                description="Cập nhật thông tin tuyển dụng và cơ hội việc làm tại địa phương"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            <Content>
                <SearchBox>
                    <Icon icon="zi-search" size={20} />

                    <SearchInput
                        placeholder="Tìm việc theo tiêu đề hoặc địa điểm..."
                        value={keyword}
                        onChange={event => setKeyword(event.target.value)}
                    />
                </SearchBox>

                {loading ? (
                    <LoadingBox>
                        <Spinner />
                        Đang tải danh sách việc làm...
                    </LoadingBox>
                ) : error ? (
                    <StateBox>{error}</StateBox>
                ) : jobs.length > 0 ? (
                    <JobList>
                        {jobs.map(job => (
                            <JobCard
                                key={job.id}
                                type="button"
                                onClick={() => navigate(`/jobs/${job.id}`)}
                            >
                                <JobTitle>{getJobTitle(job)}</JobTitle>

                                <CompanyName>{getCompanyName(job)}</CompanyName>

                                <LocationRow>
                                    <Icon icon="zi-location" size={18} />
                                    <span>{getJobLocation(job)}</span>
                                </LocationRow>

                                <DetailRow>
                                    <Salary>
                                        <MoneyMark>$</MoneyMark>
                                        {getJobSalary(job)}
                                    </Salary>

                                    <WorkType>
                                        <SuitcaseIcon aria-hidden="true" />
                                        {getJobType(job)}
                                    </WorkType>
                                </DetailRow>

                                <MetaRow>
                                    <MetaText>
                                        {job.deadline
                                            ? `Hạn nộp: ${formatDate(
                                                  job.deadline,
                                              )}`
                                            : totalText}
                                    </MetaText>

                                    <ViewDetail>
                                        Xem chi tiết
                                        <Icon
                                            icon="zi-chevron-right"
                                            size={15}
                                        />
                                    </ViewDetail>
                                </MetaRow>
                            </JobCard>
                        ))}
                    </JobList>
                ) : (
                    <StateBox>
                        Chưa có việc làm phù hợp. Vui lòng thử từ khóa khác.
                    </StateBox>
                )}
            </Content>

            <FloatingActions>
                <FloatingButton
                    aria-label="Lên đầu trang"
                    type="button"
                    onClick={handleScrollTop}
                >
                    <Icon icon="zi-arrow-up" size={26} />
                </FloatingButton>

                <FloatingButton
                    aria-label="Trao đổi"
                    type="button"
                    onClick={() => navigate("/feedback/create")}
                >
                    <Icon icon="zi-chat" size={29} />
                </FloatingButton>
            </FloatingActions>

            <AppBottomNav />
        </PageWrapper>
    );
};

export default JobsPage;
