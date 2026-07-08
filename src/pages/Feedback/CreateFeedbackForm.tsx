import { Button, ImageUpload, Input, TextArea } from "@/components";
import { RATE_LIMIT_CODE } from "@/constants";
import { MAX_FEEDBACK_IMAGES } from "@constants/common";
import { AppError } from "@dts";
import { CreateFeedbackParams } from "@/services/services";
import { useStore } from "@store";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { Icon } from "zmp-ui";
import { ImageType } from "zmp-ui/image-viewer";
import {
    createFeedback,
    getFeedbackTypes as fetchFeedbackTypes,
} from "@/services/feedback";
import type { FeedbackType } from "@/types";
import SelectFeedbackType from "./SelectFeedbackType";

const MAX_FEEDBACK_IMAGE_SIZE = 5 * 1024 * 1024;

export interface IUploadImageResponse {
    domain: string;
    images: string[];
}

type CreateFeedbackFormValues = {
    title: string;
    content: string;
    senderFullName?: string;
    senderPhone?: string;
    senderEmail?: string;
    receivingUnitName?: string;
    occurredAt?: string;
    province?: string;
    ward?: string;
    addressDetail?: string;
    provideSenderAddress?: boolean;
    isAnonymous?: boolean;
    isPublic?: boolean;
    isResultPublic?: boolean;
};

const Container = styled.div`
    display: grid;
    gap: 14px;
`;

const Form = styled.form`
    display: grid;
    gap: 14px;
`;

const FormSection = styled.section`
    padding: 14px;
    border: 1px solid #deebf3;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 8px 20px rgba(31, 77, 110, 0.06);
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 14px;
`;

const SectionIcon = styled.div`
    width: 36px;
    height: 36px;
    flex: none;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #0070b5;
    background: #e6f7ff;
`;

const SectionText = styled.div`
    min-width: 0;
`;

const SectionTitle = styled.h3`
    margin: 0;
    color: #15344f;
    font-size: calc(15px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 900;
`;

const SectionDescription = styled.p`
    margin: 3px 0 0;
    color: #6d8799;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 600;
`;

const FieldGrid = styled.div`
    display: grid;
    gap: 13px;
`;

const TwoColumnGrid = styled(FieldGrid)`
    @media (min-width: 390px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
`;

const ToggleList = styled.div`
    display: grid;
    gap: 10px;
    margin-top: 13px;
`;

const ToggleLabel = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 11px;
    border: 1px solid #d7eaf5;
    border-radius: 14px;
    color: #405a70;
    background: #f8fbfd;
    font-size: calc(13px * var(--app-font-scale));
    line-height: 1.45;
    font-weight: 650;
`;

const ToggleInput = styled.input`
    width: 16px;
    height: 16px;
    flex: none;
    margin-top: 2px;
    accent-color: #0075b8;
`;

const ToggleText = styled.span`
    display: grid;
    gap: 2px;
`;

const ToggleHint = styled.span`
    color: #7891a4;
    font-size: calc(12px * var(--app-font-scale));
    font-weight: 500;
`;

const FieldHint = styled.p`
    margin: 0;
    color: #7891a4;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 1.45;
`;

const ActionRow = styled.div`
    position: sticky;
    bottom: -22px;
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 10px;
    margin: 2px -16px -22px;
    padding: 12px 16px calc(14px + var(--zaui-safe-area-inset-bottom, 0px));
    border-top: 1px solid rgba(215, 231, 242, 0.9);
    background: rgba(248, 251, 253, 0.96);
    backdrop-filter: blur(10px);
`;

const CancelButton = styled.button`
    min-height: 46px;
    border: 1px solid #d7e7f2;
    border-radius: 12px;
    color: #55748b;
    background: #ffffff;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 800;
    transition: 0.2s ease;

    &:active {
        transform: scale(0.97);
        background: #eef7fc;
    }
`;

const SendButton = styled(Button)`
    width: 100%;
`;

export interface CreateFeedbackFormProps {
    successCallback?: (status?: boolean) => void;
    onCancel?: () => void;
}

const CreateFeedbackForm: React.FC<CreateFeedbackFormProps> = ({
    successCallback,
    onCancel,
}) => {
    const [loading, setLoading] = useState(false);
    const [feedbackTypes, setFeedbackTypes] = useState<FeedbackType[]>([]);
    const [loadingFeedbackTypes, setLoadingFeedbackTypes] = useState(false);
    const [feedbackTypeError, setFeedbackTypeError] = useState("");
    const loadFeedbackTypes = useCallback(async () => {
        setLoadingFeedbackTypes(true);
        setFeedbackTypeError("");

        try {
            const data = await fetchFeedbackTypes();

            const nextFeedbackTypes = (data || []).map(item => ({
                ...item,
                id: String(item.id),
            }));

            setFeedbackTypes(nextFeedbackTypes);

            setFeedbackTypeId(prevValue => {
                if (prevValue) {
                    return prevValue;
                }

                return nextFeedbackTypes[0]?.id;
            });
        } catch (error) {
            console.error("Lỗi lấy loại phản ánh:", error);

            setFeedbackTypes([]);
            setFeedbackTypeError("Không thể tải danh mục phản ánh.");
        } finally {
            setLoadingFeedbackTypes(false);
        }
    }, []);

    useEffect(() => {
        loadFeedbackTypes();
    }, [loadFeedbackTypes]);
    const setError = useStore(state => state.setError);

    const [imageUrls, setImageUrls] = useState<
        (ImageType & { name: string })[]
    >([]);

    const [feedbackTypeId, setFeedbackTypeId] = useState<string>();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CreateFeedbackFormValues>({
        mode: "onChange",
        defaultValues: {
            isPublic: true,
            isResultPublic: true,
        },
    });

    const isAnonymous = watch("isAnonymous");

    const getFieldName = (field: string) => {
        switch (field) {
            case "title":
                return "Tiêu đề";

            case "content":
                return "Nội dung";

            case "senderPhone":
                return "Số điện thoại";

            case "senderEmail":
                return "Email";

            default:
                return "";
        }
    };

    const getErrorMessage = (
        field: "title" | "content" | "senderPhone" | "senderEmail",
    ) => {
        if (!errors[field]) {
            return "";
        }

        return (
            String(errors[field]?.message || "") ||
            `${getFieldName(field)} không được để trống`
        );
    };

    const onSubmit = async (data: CreateFeedbackFormValues) => {
        if (!feedbackTypeId) {
            setError({
                message: "Vui lòng chọn danh mục phản ánh",
            });

            return;
        }

        const addressParts = [data.addressDetail, data.ward, data.province]
            .map(item => item?.trim())
            .filter(Boolean);

        const payload: CreateFeedbackParams = {
            title: data.title.trim(),
            content: data.content.trim(),

            feedbackTypeId,

            imageUrls: imageUrls.map(image => image.name),

            senderFullName: data.isAnonymous
                ? undefined
                : data.senderFullName?.trim() || undefined,

            senderPhone: data.isAnonymous
                ? undefined
                : data.senderPhone?.trim() || undefined,

            senderEmail: data.isAnonymous
                ? undefined
                : data.senderEmail?.trim() || undefined,

            receivingUnitName: data.receivingUnitName?.trim() || undefined,

            occurredAt: data.occurredAt || undefined,

            provideSenderAddress: Boolean(data.provideSenderAddress),

            province: data.province?.trim() || undefined,
            ward: data.ward?.trim() || undefined,

            addressDetail: data.addressDetail?.trim() || undefined,
            senderAddress: addressParts.join(", ") || undefined,

            isAnonymous: Boolean(data.isAnonymous),
            isPublic: Boolean(data.isPublic),
            isResultPublic: Boolean(data.isResultPublic),
        };

        setLoading(true);

        try {
            await createFeedback(payload);

            successCallback?.(true);
        } catch (error) {
            const { message, code } = (error || {}) as AppError;

            setError({
                code,
                message:
                    code === RATE_LIMIT_CODE.code
                        ? message
                        : "Có lỗi xảy ra, vui lòng thử lại sau!",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormSection>
                    <SectionHeader>
                        <SectionIcon>
                            <Icon icon="zi-note" size={20} />
                        </SectionIcon>

                        <SectionText>
                            <SectionTitle>Nội dung phản ánh</SectionTitle>
                            <SectionDescription>
                                Nhập thông tin chính để đơn vị phụ trách tiếp
                                nhận và xử lý.
                            </SectionDescription>
                        </SectionText>
                    </SectionHeader>

                    <FieldGrid>
                        <SelectFeedbackType
                            value={feedbackTypeId}
                            onChange={setFeedbackTypeId}
                            feedbackTypes={feedbackTypes}
                            loading={loadingFeedbackTypes}
                            errorMessage={feedbackTypeError}
                            onRetry={loadFeedbackTypes}
                        />

                        <Input
                            placeholder="Nhập tiêu đề ngắn gọn"
                            label="Tiêu đề phản ánh*"
                            errorText={getErrorMessage("title")}
                            {...register("title", {
                                required: "Vui lòng nhập tiêu đề phản ánh",
                                validate: value =>
                                    value.trim().length > 0 ||
                                    "Vui lòng nhập tiêu đề phản ánh",
                            })}
                            status={errors.title ? "error" : "default"}
                        />

                        <TextArea
                            placeholder="Mô tả nội dung, thời gian, địa điểm và thông tin liên quan"
                            label="Nội dung chi tiết*"
                            errorText={getErrorMessage("content")}
                            {...register("content", {
                                required: "Vui lòng nhập nội dung phản ánh",
                                validate: value =>
                                    value.trim().length > 0 ||
                                    "Vui lòng nhập nội dung phản ánh",
                            })}
                            status={errors.content ? "error" : "default"}
                        />

                        <Input
                            placeholder="Ví dụ: UBND phường, Phòng Tài nguyên..."
                            label="Đơn vị tiếp nhận"
                            {...register("receivingUnitName")}
                        />

                        <Input
                            type="datetime-local"
                            label="Thời gian xảy ra"
                            {...register("occurredAt")}
                        />
                    </FieldGrid>
                </FormSection>

                <FormSection>
                    <SectionHeader>
                        <SectionIcon>
                            <Icon icon="zi-user" size={20} />
                        </SectionIcon>

                        <SectionText>
                            <SectionTitle>Thông tin người gửi</SectionTitle>
                            <SectionDescription>
                                Bổ sung liên hệ để cơ quan xử lý có thể phản hồi
                                khi cần.
                            </SectionDescription>
                        </SectionText>
                    </SectionHeader>

                    <ToggleList>
                        <ToggleLabel>
                            <ToggleInput
                                type="checkbox"
                                {...register("isAnonymous")}
                            />

                            <ToggleText>
                                <span>Gửi phản ánh ẩn danh</span>
                                <ToggleHint>
                                    Khi bật, họ tên, số điện thoại và email sẽ
                                    không được gửi.
                                </ToggleHint>
                            </ToggleText>
                        </ToggleLabel>
                    </ToggleList>

                    <FieldGrid>
                        <Input
                            disabled={isAnonymous}
                            placeholder="Nhập họ và tên"
                            label="Họ và tên"
                            {...register("senderFullName")}
                        />

                        <Input
                            disabled={isAnonymous}
                            placeholder="Nhập số điện thoại"
                            label="Số điện thoại"
                            errorText={getErrorMessage("senderPhone")}
                            {...register("senderPhone", {
                                pattern: {
                                    value: /^[0-9+\-\s]{8,15}$/,
                                    message:
                                        "Số điện thoại chưa đúng định dạng",
                                },
                            })}
                            status={errors.senderPhone ? "error" : "default"}
                        />

                        <Input
                            disabled={isAnonymous}
                            placeholder="Nhập email"
                            label="Email"
                            errorText={getErrorMessage("senderEmail")}
                            {...register("senderEmail", {
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Email chưa đúng định dạng",
                                },
                            })}
                            status={errors.senderEmail ? "error" : "default"}
                        />
                    </FieldGrid>
                </FormSection>

                <FormSection>
                    <SectionHeader>
                        <SectionIcon>
                            <Icon icon="zi-location" size={20} />
                        </SectionIcon>

                        <SectionText>
                            <SectionTitle>Địa điểm phản ánh</SectionTitle>
                            <SectionDescription>
                                Ghi rõ khu vực hoặc vị trí xảy ra sự việc.
                            </SectionDescription>
                        </SectionText>
                    </SectionHeader>

                    <TwoColumnGrid>
                        <Input
                            label="Tỉnh/Thành phố"
                            placeholder="Tỉnh/Thành phố"
                            {...register("province")}
                        />

                        <Input
                            label="Phường/Xã"
                            placeholder="Phường/Xã"
                            {...register("ward")}
                        />
                    </TwoColumnGrid>

                    <FieldGrid>
                        <TextArea
                            placeholder="Số nhà, tên đường, mốc nhận diện hoặc mô tả vị trí cụ thể"
                            label="Vị trí cụ thể"
                            {...register("addressDetail")}
                        />
                    </FieldGrid>

                    <ToggleList>
                        <ToggleLabel>
                            <ToggleInput
                                type="checkbox"
                                {...register("provideSenderAddress")}
                            />

                            <ToggleText>
                                <span>Cung cấp địa chỉ cho đơn vị xử lý</span>
                                <ToggleHint>
                                    Giúp cơ quan phụ trách xác minh vị trí nhanh
                                    hơn.
                                </ToggleHint>
                            </ToggleText>
                        </ToggleLabel>
                    </ToggleList>
                </FormSection>

                <FormSection>
                    <SectionHeader>
                        <SectionIcon>
                            <Icon icon="zi-photo" size={20} />
                        </SectionIcon>

                        <SectionText>
                            <SectionTitle>Hình ảnh đính kèm</SectionTitle>
                            <SectionDescription>
                                Thêm ảnh hiện trường hoặc tài liệu liên quan nếu
                                có.
                            </SectionDescription>
                        </SectionText>
                    </SectionHeader>

                    <ImageUpload
                        label="Ảnh đính kèm"
                        maxItemSize={MAX_FEEDBACK_IMAGE_SIZE}
                        maxSelect={MAX_FEEDBACK_IMAGES}
                        onImagesChange={setImageUrls}
                    />
                </FormSection>

                <FormSection>
                    <SectionHeader>
                        <SectionIcon>
                            <Icon icon="zi-lock" size={20} />
                        </SectionIcon>

                        <SectionText>
                            <SectionTitle>Tùy chọn công khai</SectionTitle>
                            <SectionDescription>
                                Chọn cách hiển thị phản ánh và kết quả xử lý
                                trên cổng thông tin.
                            </SectionDescription>
                        </SectionText>
                    </SectionHeader>

                    <ToggleList>
                        <ToggleLabel>
                            <ToggleInput
                                type="checkbox"
                                {...register("isPublic")}
                            />

                            <ToggleText>
                                <span>Công khai phản ánh</span>
                                <ToggleHint>
                                    Nội dung phản ánh có thể được hiển thị cho
                                    cộng đồng.
                                </ToggleHint>
                            </ToggleText>
                        </ToggleLabel>

                        <ToggleLabel>
                            <ToggleInput
                                type="checkbox"
                                {...register("isResultPublic")}
                            />

                            <ToggleText>
                                <span>Công khai kết quả xử lý</span>
                                <ToggleHint>
                                    Kết quả phản hồi có thể được hiển thị sau
                                    khi hoàn tất.
                                </ToggleHint>
                            </ToggleText>
                        </ToggleLabel>
                    </ToggleList>
                </FormSection>

                <FieldHint>
                    Các trường có dấu * là bắt buộc. Vui lòng kiểm tra lại thông
                    tin trước khi gửi.
                </FieldHint>

                <ActionRow>
                    <CancelButton type="button" onClick={onCancel}>
                        Hủy
                    </CancelButton>

                    <SendButton
                        disabled={loading}
                        loading={loading}
                        htmlType="submit"
                        suffixIcon={<Icon icon="zi-chevron-right" />}
                    >
                        {loading ? "Đang gửi..." : "Gửi phản ánh"}
                    </SendButton>
                </ActionRow>
            </Form>
        </Container>
    );
};

export default CreateFeedbackForm;
