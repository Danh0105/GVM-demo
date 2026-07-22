import React, {
    ChangeEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ChangeHandler } from "react-hook-form";
import styled from "styled-components";
import { Box, Icon, ImageViewer } from "zmp-ui";
import { ImageType } from "zmp-ui/image-viewer";

import { MAX_FEEDBACK_IMAGES } from "@constants/common";
import { uploadImages } from "@/services/upload-images";
import { useStore } from "@store";
import { useRateLimitCountdown } from "@/hooks/useRateLimitCountdown";

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

const HiddenInput = styled.input`
    display: none;
`;

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);

const ImageUpload: React.FC<ImageUploadProps> = ({
    onImagesChange,
    label = "Ảnh đính kèm",
    maxSelect = MAX_FEEDBACK_IMAGES,
    maxItemSize = 5 * 1024 * 1024,
    onChange,
}) => {
    const { setError } = useStore();
    const rateLimitRemaining = useRateLimitCountdown();
    const inputRef = useRef<HTMLInputElement>(null);

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

    const onSelectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const selectedFiles = Array.from(input.files || []).slice(
            0,
            remainingSlots,
        );
        input.value = "";

        if (!selectedFiles.length) {
            return;
        }

        const invalidType = selectedFiles.find(
            file => !ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase()),
        );
        const oversized = selectedFiles.find(file => file.size > maxItemSize);

        if (invalidType) {
            setError({
                message: "Chỉ hỗ trợ ảnh JPG, JPEG, PNG, GIF hoặc WEBP.",
            });
            return;
        }

        if (oversized) {
            setError({
                message: `Ảnh ${oversized.name} vượt quá ${maxItemSizeInMb}MB.`,
                statusCode: 413,
            });
            return;
        }

        setIsPickingImages(true);

        try {
            const images = await uploadImages(selectedFiles);

            setImageUrls(currentImages =>
                [...currentImages, ...images].slice(0, maxSelect),
            );
        } catch (error) {
            setError({
                message:
                    error instanceof Error
                        ? error.message
                        : "Không thể tải ảnh lên. Vui lòng thử lại.",
            });
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

    let uploadText = "Thêm ảnh";

    if (isPickingImages) {
        uploadText = "Đang tải...";
    } else if (rateLimitRemaining > 0) {
        uploadText = `Thử lại sau ${rateLimitRemaining}s`;
    }

    return (
        <Container>
            <HiddenInput
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={onSelectFiles}
            />
            <LabelRow>
                <Label>{label}</Label>

                <Counter>
                    {imageUrls.length}/{maxSelect} ảnh
                </Counter>
            </LabelRow>

            <ImageContainer>
                {imageUrls.map((image, index) => (
                    <PreviewContainer key={image.name}>
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
                        disabled={isPickingImages || rateLimitRemaining > 0}
                        onClick={() => inputRef.current?.click()}
                    >
                        <Icon icon="zi-plus" size={22} />

                        <UploadText>{uploadText}</UploadText>
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
