import React, { FC, useMemo, useState } from "react";
import styled from "styled-components";
import { CheckCircle2, SendHorizontal } from "lucide-react";
import { Page, useNavigate, useSnackbar } from "zmp-ui";
import AppHeader from "@/components/layout/AppHeader";
import { useStore } from "@store";
import {
    createSatisfactionRating,
    SatisfactionRatingLevel,
} from "@/services/satisfactionRating";
import { ApiError } from "@/services/api-client";

const ratingOptions: Array<{
    value: SatisfactionRatingLevel;
    label: string;
    tone: string;
    mouth: "sad" | "flat" | "soft" | "smile" | "great";
}> = [
    { value: 1, label: "Rất không hài lòng", tone: "#dc2626", mouth: "sad" },
    { value: 2, label: "Không hài lòng", tone: "#f97316", mouth: "flat" },
    { value: 3, label: "Bình thường", tone: "#d99b10", mouth: "soft" },
    { value: 4, label: "Hài lòng", tone: "#0ea5e9", mouth: "smile" },
    { value: 5, label: "Rất hài lòng", tone: "#16a34a", mouth: "great" },
];

const services = [
    "Dịch vụ hành chính công",
    "Lấy số trực tuyến",
    "Hẹn làm việc",
    "Tiếp nhận phản ánh",
    "Khác",
];

const getMouth = (mouth: (typeof ratingOptions)[number]["mouth"]) => {
    if (mouth === "sad") {
        return "M34 58 Q48 48 62 58";
    }

    if (mouth === "flat") {
        return "M36 54 H60";
    }

    if (mouth === "soft") {
        return "M36 55 Q48 59 60 55";
    }

    if (mouth === "smile") {
        return "M34 52 Q48 64 62 52";
    }

    return "M32 50 Q48 68 64 50";
};

const SatisfactionFace: FC<{
    active?: boolean;
    tone: string;
    mouth: (typeof ratingOptions)[number]["mouth"];
}> = ({ active, tone, mouth }) => (
    <FaceSvg viewBox="0 0 96 96" aria-hidden="true" $active={active}>
        <circle cx="48" cy="48" r="34" fill={active ? tone : "#eef4fb"} />
        <circle cx="36" cy="42" r="4" fill={active ? "#fff" : "#5d6b7c"} />
        <circle cx="60" cy="42" r="4" fill={active ? "#fff" : "#5d6b7c"} />
        <path
            d={getMouth(mouth)}
            fill="none"
            stroke={active ? "#fff" : "#5d6b7c"}
            strokeWidth="5"
            strokeLinecap="round"
        />
    </FaceSvg>
);

const SatisfactionRatingPage: FC = () => {
    const navigate = useNavigate();
    const { openSnackbar } = useSnackbar();
    const [user, token] = useStore(state => [state.user, state.token]);
    const [rating, setRating] = useState<SatisfactionRatingLevel>(5);
    const [serviceName, setServiceName] = useState(services[0]);
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const selectedRating = useMemo(
        () => ratingOptions.find(item => item.value === rating) || ratingOptions[4],
        [rating],
    );

    const submitRating = async () => {
        if (submitting) {
            return;
        }

        try {
            setSubmitting(true);
            await createSatisfactionRating(
                {
                    rating,
                    serviceName,
                    departmentName: "Phường Gò Dầu - Tỉnh Tây Ninh",
                    content: content.trim() || undefined,
                },
                user,
                Boolean(token),
            );
            setSubmitted(true);
            openSnackbar({
                type: "success",
                text: "Cảm ơn bạn đã gửi đánh giá.",
            });
        } catch (error) {
            openSnackbar({
                type: "error",
                text:
                    error instanceof ApiError || error instanceof Error
                        ? error.message
                        : "Không thể gửi đánh giá, vui lòng thử lại sau.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <StyledPage>
            <AppHeader
                back
                title="Đánh giá hài lòng"
                description="Phường Gò Dầu - Tỉnh Tây Ninh"
                onBack={() => navigate("/", { direction: "backward" })}
            />

            {submitted ? (
                <SuccessPanel>
                    <SuccessIcon>
                        <CheckCircle2 size={42} />
                    </SuccessIcon>
                    <SuccessTitle>Đã ghi nhận đánh giá</SuccessTitle>
                    <SuccessText>
                        Ý kiến của bạn giúp phường cải thiện chất lượng phục vụ
                        tốt hơn mỗi ngày.
                    </SuccessText>
                    <PrimaryButton type="button" onClick={() => navigate("/")}>
                        Về trang chủ
                    </PrimaryButton>
                </SuccessPanel>
            ) : (
                <Content>
                    <IntroCard>
                        <IntroLabel>Mức độ hài lòng</IntroLabel>
                        <IntroTitle>{selectedRating.label}</IntroTitle>
                        <IntroText>
                            Chọn cảm nhận của bạn về quá trình sử dụng dịch vụ.
                        </IntroText>
                    </IntroCard>

                    <RatingGrid role="radiogroup" aria-label="Mức độ hài lòng">
                        {ratingOptions.map(item => (
                            <RatingButton
                                key={item.value}
                                type="button"
                                role="radio"
                                aria-checked={rating === item.value}
                                $active={rating === item.value}
                                $tone={item.tone}
                                onClick={() => setRating(item.value)}
                            >
                                <SatisfactionFace
                                    active={rating === item.value}
                                    tone={item.tone}
                                    mouth={item.mouth}
                                />
                                <RatingLabel>{item.value}</RatingLabel>
                            </RatingButton>
                        ))}
                    </RatingGrid>

                    <FormCard>
                        <Field>
                            <Label htmlFor="serviceName">Dịch vụ</Label>
                            <Select
                                id="serviceName"
                                value={serviceName}
                                onChange={event => setServiceName(event.target.value)}
                            >
                                {services.map(item => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <UserCard>
                            <Avatar src={user?.avatar} aria-hidden="true" />
                            <UserInfo>
                                <UserName>
                                    {user?.fullName || user?.name || "Người dùng Zalo"}
                                </UserName>
                                <UserMeta>
                                    Thông tin người gửi lấy từ tài khoản Zalo
                                </UserMeta>
                            </UserInfo>
                        </UserCard>

                        <Field>
                            <Label htmlFor="content">Góp ý thêm</Label>
                            <Textarea
                                id="content"
                                value={content}
                                rows={5}
                                maxLength={500}
                                placeholder="Nhập nội dung góp ý nếu có"
                                onChange={event => setContent(event.target.value)}
                            />
                            <Counter>{content.length}/500</Counter>
                        </Field>
                    </FormCard>

                    <SubmitBar>
                        <PrimaryButton
                            type="button"
                            disabled={submitting}
                            onClick={submitRating}
                        >
                            <SendHorizontal size={20} />
                            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </PrimaryButton>
                    </SubmitBar>
                </Content>
            )}
        </StyledPage>
    );
};

export default SatisfactionRatingPage;

const StyledPage = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 116px;
    color: #172033;
    background: linear-gradient(180deg, #eef7ff 0, #f8fbff 260px, #f5f7fb 100%);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

const Content = styled.main`
    padding: 0 16px;
`;

const IntroCard = styled.section`
    padding: 18px;
    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 14px 34px rgba(31, 58, 84, 0.08);
`;

const IntroLabel = styled.div`
    color: #0068ad;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 900;
`;

const IntroTitle = styled.h2`
    margin: 8px 0 0;
    color: #172033;
    font-size: calc(22px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 950;
`;

const IntroText = styled.p`
    margin: 8px 0 0;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 700;
`;

const RatingGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    margin: 14px 0;
`;

const RatingButton = styled.button<{ $active?: boolean; $tone: string }>`
    min-width: 0;
    min-height: 74px;
    padding: 6px 4px;
    border: 1px solid ${({ $active, $tone }) => ($active ? $tone : "#dce8f3")};
    border-radius: 18px;
    background: ${({ $active }) => ($active ? "#ffffff" : "rgba(255,255,255,.78)")};
    box-shadow: ${({ $active, $tone }) =>
        $active ? `0 12px 22px ${$tone}33` : "0 8px 18px rgba(31,58,84,.06)"};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
`;

const FaceSvg = styled.svg<{ $active?: boolean }>`
    width: 44px;
    height: 44px;
    filter: ${({ $active }) =>
        $active ? "drop-shadow(0 8px 12px rgba(31, 58, 84, 0.14))" : "none"};
`;

const RatingLabel = styled.span`
    color: #344054;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 950;
`;

const FormCard = styled.section`
    padding: 16px;
    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 14px 34px rgba(31, 58, 84, 0.08);
`;

const Field = styled.label`
    display: block;

    & + & {
        margin-top: 16px;
    }
`;

const Label = styled.span`
    display: block;
    margin-bottom: 8px;
    color: #172033;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 950;
`;

const Select = styled.select`
    width: 100%;
    min-height: 48px;
    padding: 0 14px;
    border: 1px solid #dce8f3;
    border-radius: 15px;
    color: #172033;
    background: #ffffff;
    font-size: calc(15px * var(--app-font-scale));
    font-weight: 800;
`;

const Textarea = styled.textarea`
    width: 100%;
    box-sizing: border-box;
    padding: 14px;
    border: 1px solid #dce8f3;
    border-radius: 15px;
    color: #172033;
    background: #ffffff;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.45;
    resize: none;
`;

const Counter = styled.div`
    margin-top: 6px;
    color: #8a97a8;
    font-size: calc(11px * var(--app-font-scale));
    text-align: right;
    font-weight: 800;
`;

const UserCard = styled.div`
    margin: 16px 0;
    padding: 12px;
    border-radius: 16px;
    background: #f5fbff;
    display: flex;
    align-items: center;
    gap: 10px;
`;

const Avatar = styled.img`
    width: 42px;
    height: 42px;
    border-radius: 50%;
    object-fit: cover;
    background: #dbeafe;
`;

const UserInfo = styled.div`
    min-width: 0;
`;

const UserName = styled.div`
    color: #172033;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 950;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const UserMeta = styled.div`
    margin-top: 3px;
    color: #667085;
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 750;
`;

const SubmitBar = styled.div`
    position: fixed;
    left: 50%;
    bottom: 0;
    width: min(100vw, 430px);
    box-sizing: border-box;
    transform: translateX(-50%);
    padding: 12px 16px calc(12px + var(--zaui-safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 -12px 26px rgba(31, 58, 84, 0.1);
`;

const PrimaryButton = styled.button`
    width: 100%;
    min-height: 52px;
    border: 0;
    border-radius: 16px;
    color: #ffffff;
    background: linear-gradient(180deg, #0077c8 0%, #005f9f 100%);
    box-shadow: 0 12px 24px rgba(0, 104, 173, 0.24);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    font-size: calc(16px * var(--app-font-scale));
    font-weight: 950;

    &:disabled {
        opacity: 0.68;
    }
`;

const SuccessPanel = styled.section`
    margin: 0 16px;
    padding: 30px 18px;
    border-radius: 24px;
    background: #ffffff;
    box-shadow: 0 14px 34px rgba(31, 58, 84, 0.08);
    text-align: center;
`;

const SuccessIcon = styled.div`
    width: 76px;
    height: 76px;
    margin: 0 auto 14px;
    border-radius: 24px;
    color: #16a34a;
    background: #dcfce7;
    display: grid;
    place-items: center;
`;

const SuccessTitle = styled.h2`
    margin: 0;
    color: #172033;
    font-size: calc(20px * var(--app-font-scale));
    font-weight: 950;
`;

const SuccessText = styled.p`
    margin: 10px 0 18px;
    color: #667085;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.5;
    font-weight: 700;
`;
