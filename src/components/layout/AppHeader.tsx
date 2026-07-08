import React, { ReactNode } from "react";
import styled from "styled-components";
import { Icon } from "zmp-ui";

export interface AppHeaderProps {
    title?: ReactNode;
    description?: ReactNode;
    back?: boolean;
    fixed?: boolean;
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
    className?: string;
    onBack?: () => void;
}

const HeaderRoot = styled.header<{ $fixed?: boolean }>`
    ${({ $fixed }) =>
        $fixed
            ? `
                position: fixed;
                top: 0;
                left: 50%;
                width: min(100vw, 430px);
                transform: translateX(-50%);
            `
            : `
                position: sticky;
                top: 0;
                width: 100%;
            `}

    z-index: 30;
    box-sizing: border-box;
    min-height: calc(30px + var(--zaui-safe-area-inset-top, 0px));
    padding: calc(14px + var(--zaui-safe-area-inset-top, 0px)) 16px 18px;
    display: flex;
    align-items: flex-end;

    color: #ffffff;
    background: radial-gradient(
            circle at 20% 0%,
            rgba(255, 255, 255, 0.22),
            transparent 34%
        ),
        linear-gradient(135deg, #07588f 0%, #0075b8 100%);

    border-radius: 0 0 26px 26px;
    box-shadow: 0 14px 30px rgba(0, 80, 140, 0.22);
`;

const HeaderRow = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
`;

export const AppHeaderBackButton = styled.button`
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    display: grid;
    place-items: center;

    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 15px;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.14);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(10px);

    transition: transform 0.18s ease, background 0.18s ease;

    &:active {
        transform: scale(0.94);
        background: rgba(255, 255, 255, 0.24);
    }
`;

const HeaderContent = styled.div`
    min-width: 0;
    flex: 1;
`;

export const AppHeaderTitle = styled.h1`
    margin: 0;
    color: #ffffff;
    font-size: calc(18px * var(--app-font-scale));
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: 0;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const AppHeaderDescription = styled.p`
    margin: 4px 0 0;
    color: rgba(255, 255, 255, 0.86);
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.35;
    font-weight: 700;

    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const RightSlot = styled.div`
    flex: none;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    description,
    back,
    fixed = true,
    leftSlot,
    rightSlot,
    className,
    onBack,
}) => (
    <HeaderRoot $fixed={fixed} className={className}>
        <HeaderRow>
            {leftSlot}

            {!leftSlot && back && (
                <AppHeaderBackButton
                    aria-label="Quay lại"
                    onClick={onBack}
                    type="button"
                >
                    <Icon icon="zi-arrow-left" size={22} />
                </AppHeaderBackButton>
            )}

            <HeaderContent>
                {title && <AppHeaderTitle>{title}</AppHeaderTitle>}
                {description && (
                    <AppHeaderDescription>{description}</AppHeaderDescription>
                )}
            </HeaderContent>

            {rightSlot && <RightSlot>{rightSlot}</RightSlot>}
        </HeaderRow>
    </HeaderRoot>
);

export default AppHeader;
