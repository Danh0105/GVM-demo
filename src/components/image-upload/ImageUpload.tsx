import React, { useEffect, useMemo, useState } from "react";
import { ChangeHandler } from "react-hook-form";
import styled from "styled-components";
import { Box, Icon, ImageViewer } from "zmp-ui";
import { ImageType } from "zmp-ui/image-viewer";

import { API, BASE_URL, MAX_FEEDBACK_IMAGES } from "@constants/common";
import { pickImages } from "@/services/zalo";
import { useStore } from "@store";

export interface IUploadImageResponse {
    domain: string;
    images: string[];
}

export interface FormItemValidate {
    status: "default" | "error";
    errorText?: string;
}

export interface FormValidate {
    title: FormItemValidate;
    content: FormItemValidate;
}

export interface ImageUploadProps {
    onImagesChange?: (images: Array<ImageType & { name: string }>) => void;
    onChange?: ChangeHandler;
    label?: string;
    maxSelect?: number;
    maxItemSize?: number;
}

type PickerError = {
    code?: number;
    error?: number;
    message?: string;
};

const LabelRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0;
`;

const Label = styled.div`
    color: #1f2937;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 600;
`;

const Counter = styled.span`
    color: #64748b;
    font-size: calc(12px * var(--app-font-scale));
    white-space: nowrap;
`;

const ImageContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;

    @media (min-width: 420px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
`;

const PreviewContainer = styled.div`
    position: relative;
    overflow: hidden;
    aspect-ratio: 1;
    border-radius: 12px;
    background: #f1f5f9;
`;

const Image = styled.img`
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    object-fit: cover;
    cursor: pointer;
`;

const RemoveButton = styled.button`
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    width: 25px;
    height: 25px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.72);
    color: #ffffff;
    cursor: pointer;
    transition: background-color 160ms ease, transform 160ms ease;

    &:active {
        background: rgba(220, 38, 38, 0.92);
        transform: scale(0.92);
    }
`;

const IconUploadContainer = styled.button`
    display: flex;
    min-width: 0;
    aspect-ratio: 1;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 5px;
    border: 1px dashed #b6c9d7;
    border-radius: 12px;
    background: #f8fafc;
    color: #64748b;
    cursor: pointer;
    transition: border-color 160ms ease, background-color 160ms ease,
        color 160ms ease, transform 160ms ease;

    &:active {
        border-color: #0075b8;
        background: #eef7fc;
        color: #0075b8;
        transform: scale(0.97);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }
`;

const UploadText = styled.span`
    padding: 0 4px;
    font-size: calc(11px * var(--app-font-scale));
    font-weight: 600;
    line-height: 14px;
    text-align: center;
`;

const HelperText = styled.p`
    margin: 8px 0 0;
    color: #64748b;
    font-size: calc(12px * var(--app-font-scale));
    line-height: 17px;
`;

const Container = styled(Box)``;

const getPickerErrorMessage = (error: unknown): string | null => {
    const pickerError = (error || {}) as PickerError;
    const code = pickerError.code ?? pickerError.error;

    switch (code) {
        // Người dùng chủ động đóng cửa sổ chọn ảnh.
        case -2003:
            return null;

        case -2004:
            return "Không thể chọn hoặc tải ảnh lên. Vui lòng kiểm tra kết nối mạng và thử lại.";

        case -1403:
            return "Ứng dụng chưa được cấp quyền chọn ảnh. Vui lòng kiểm tra quyền của Mini App.";

        case -1404:
            return "Phiên bản Zalo hiện tại chưa hỗ trợ chọn ảnh. Vui lòng cập nhật Zalo.";

        case -1408:
            return "Quá trình tải ảnh mất quá nhiều thời gian. Vui lòng thử lại.";

        default:
            return (
                pickerError.message ||
                "Chọn hình ảnh thất bại. Vui lòng thử lại với ảnh có dung lượng nhỏ hơn."
            );
    }
};

const getUploadImageUrl = () => {
    const baseUrl = String(BASE_URL || "")
        .trim()
        .replace(/\/+$/, "");

    if (!baseUrl) {
        throw new Error("Chưa cấu hình VITE_API_BASE_URL trong file .env");
    }

    return new URL(API.UPLOAD_IMAGE, `${baseUrl}/`).toString();
};

const ImageUpload: React.FC<ImageUploadProps> = ({
    onImagesChange,
    label = "Ảnh đính kèm",
    maxSelect = MAX_FEEDBACK_IMAGES,
    maxItemSize = 5 * 1024 * 1024,
    onChange,
}) => {
    const { setError } = useStore();

    const [imgViewerVisible, setImgViewerVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPickingImages, setIsPickingImages] = useState(false);

    const [imageUrls, setImageUrls] = useState<
        Array<ImageType & { name: string }>
    >([]);

    const remainingSlots = useMemo(
        () => Math.max(maxSelect - imageUrls.length, 0),
        [imageUrls.length, maxSelect],
    );

    const maxItemSizeInMb = useMemo(
        () => Math.max(1, Math.round(maxItemSize / (1024 * 1024))),
        [maxItemSize],
    );

    const onClickUpload = async () => {
        if (isPickingImages || remainingSlots <= 0) {
            return;
        }

        setIsPickingImages(true);

        try {
            const images = await pickImages({
                maxItemSize,
                maxSelectItem: remainingSlots,
                serverUploadUrl: getUploadImageUrl(),
                compressLevel: 2,
            });

            setImageUrls(currentImages =>
                [...currentImages, ...images].slice(0, maxSelect),
            );
        } catch (error) {
            console.error("Lỗi chọn hoặc tải hình ảnh:", error);

            const message = getPickerErrorMessage(error);

            // Không hiển thị lỗi nếu người dùng chủ động đóng hộp chọn ảnh.
            if (message) {
                setError({ message });
            }
        } finally {
            setIsPickingImages(false);
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(currentImages =>
            currentImages.filter((_, imageIndex) => imageIndex !== index),
        );

        setImgViewerVisible(false);
        setActiveIndex(0);
    };

    useEffect(() => {
        onImagesChange?.(imageUrls);

        onChange?.({
            target: {
                value: [...imageUrls],
            },
        });
    }, [imageUrls, onChange, onImagesChange]);

    return (
        <Container>
            <LabelRow>
                <Label>{label}</Label>

                <Counter>
                    {imageUrls.length}/{maxSelect} ảnh
                </Counter>
            </LabelRow>

            <ImageContainer>
                {imageUrls.map((image, index) => (
                    <PreviewContainer key={`${image.name}-${index}`}>
                        <Image
                            src={image.src}
                            alt={`Ảnh đính kèm ${index + 1}`}
                            onClick={() => {
                                setActiveIndex(index);
                                setImgViewerVisible(true);
                            }}
                        />

                        <RemoveButton
                            type="button"
                            aria-label={`Xóa ảnh ${index + 1}`}
                            onClick={() => removeImage(index)}
                        >
                            <Icon icon="zi-close" size={14} />
                        </RemoveButton>
                    </PreviewContainer>
                ))}

                {remainingSlots > 0 && (
                    <IconUploadContainer
                        type="button"
                        disabled={isPickingImages}
                        onClick={onClickUpload}
                    >
                        <Icon
                            icon={isPickingImages ? "zi-loading" : "zi-plus"}
                            size={22}
                        />

                        <UploadText>
                            {isPickingImages ? "Đang tải..." : "Thêm ảnh"}
                        </UploadText>
                    </IconUploadContainer>
                )}
            </ImageContainer>

            <HelperText>
                Tối đa {maxSelect} ảnh, mỗi ảnh không vượt quá {maxItemSizeInMb}{" "}
                MB.
            </HelperText>

            <ImageViewer
                visible={imgViewerVisible}
                activeIndex={activeIndex}
                images={imageUrls}
                onClose={() => setImgViewerVisible(false)}
            />
        </Container>
    );
};

export default ImageUpload;
