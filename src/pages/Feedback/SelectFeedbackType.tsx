import type { FeedbackType } from "@/types";
import React, { useMemo } from "react";
import styled from "styled-components";

type SelectFeedbackTypeProps = {
    value?: string;
    onChange: (id: string) => void;
    feedbackTypes: FeedbackType[];
    loading?: boolean;
    errorMessage?: string;
};

const SelectFeedbackType: React.FC<SelectFeedbackTypeProps> = ({
    value,
    onChange,
    feedbackTypes,
    loading = false,
    errorMessage = "",
}) => {
    const selectedFeedbackType = useMemo(
        () => feedbackTypes.find(item => String(item.id) === value),
        [feedbackTypes, value],
    );

    if (loading) {
        return (
            <LoadingCard aria-label="Đang tải danh mục phản ánh">
                <LoadingHeader>
                    <SkeletonIcon />

                    <div>
                        <SkeletonLine $width="132px" />
                        <SkeletonLine $width="210px" $small />
                    </div>
                </LoadingHeader>

                <SkeletonSelect />
            </LoadingCard>
        );
    }

    return (
        <Card>
            <Title htmlFor="feedback-type">Danh mục phản ánh</Title>

            <Description>
                Chọn nội dung phù hợp để phản ánh được chuyển đến đúng bộ phận
                xử lý.
            </Description>

            <SelectWrapper>
                <Select
                    id="feedback-type"
                    value={value ?? ""}
                    onChange={event => onChange(event.target.value)}
                    disabled={
                        Boolean(errorMessage) || feedbackTypes.length === 0
                    }
                    aria-describedby="feedback-type-message"
                >
                    <option value="">-- Chọn loại phản ánh --</option>

                    {feedbackTypes.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.title}
                        </option>
                    ))}
                </Select>

                <ChevronIcon
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="m19 9-7 7-7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </ChevronIcon>
            </SelectWrapper>

            {selectedFeedbackType && !errorMessage && (
                <SuccessMessage id="feedback-type-message">
                    Đã chọn: <strong>{selectedFeedbackType.title}</strong>
                </SuccessMessage>
            )}
            {!errorMessage && feedbackTypes.length === 0 && (
                <EmptyMessage id="feedback-type-message">
                    Chưa có danh mục phản ánh nào để lựa chọn.
                </EmptyMessage>
            )}
        </Card>
    );
};

export default SelectFeedbackType;

const Card = styled.div`
    width: 100%;
    padding: 13px;
    border: 1px solid #d7eaf5;
    border-radius: 14px;
    background: #f8fbfd;
`;

const Title = styled.label`
    display: block;
    color: #15344f;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 850;
    line-height: 20px;
`;

const Description = styled.p`
    margin: 3px 0 0;
    color: #6d8799;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 18px;
`;

const SelectWrapper = styled.div`
    position: relative;
    margin-top: 11px;
`;

const Select = styled.select`
    width: 100%;
    min-height: 48px;
    appearance: none;
    padding: 11px 42px 11px 13px;
    border: 1px solid #c7e1f8;
    border-radius: 12px;
    outline: none;
    background: #ffffff;
    color: #173551;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 22px;
    font-weight: 650;
    transition: border-color 180ms ease, box-shadow 180ms ease,
        background-color 180ms ease;

    &:focus {
        border-color: #0075b8;
        box-shadow: 0 0 0 4px rgba(0, 117, 184, 0.12);
    }

    &:disabled {
        cursor: not-allowed;
        background: #f1f6fa;
        color: #90a8b9;
    }
`;

const ChevronIcon = styled.svg`
    position: absolute;
    top: 50%;
    right: 14px;
    display: block;
    pointer-events: none;
    color: #4985ae;
    transform: translateY(-50%);
`;

const SuccessMessage = styled.div`
    margin-top: 10px;
    padding: 9px 10px;
    border-radius: 10px;
    background: #e6f7ff;
    color: #00558f;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 18px;
`;

const EmptyMessage = styled.p`
    margin: 10px 0 0;
    padding: 9px 10px;
    border-radius: 10px;
    background: #fffbeb;
    color: #b45309;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 18px;
`;

const LoadingCard = styled(Card)`
    min-height: 124px;
`;

const LoadingHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const SkeletonIcon = styled.div`
    width: 38px;
    height: 38px;
    flex-shrink: 0;
    border-radius: 11px;
    background: #e6eff5;
`;

const SkeletonLine = styled.div<{ $width: string; $small?: boolean }>`
    width: ${({ $width }) => $width};
    max-width: 100%;
    height: ${({ $small }) => ($small ? "10px" : "13px")};
    margin-top: ${({ $small }) => ($small ? "7px" : "0")};
    border-radius: 999px;
    background: #e6eff5;
`;

const SkeletonSelect = styled.div`
    height: 48px;
    margin-top: 13px;
    border-radius: 12px;
    background: #e6eff5;
`;
