import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Clock3, RefreshCw, ShieldAlert, X } from "lucide-react";
import { useStore } from "@store";

const Auth = () => {
    const [retryRemaining, setRetryRemaining] = useState(0);
    const [
        authStatus,
        authMessage,
        authRetryUntil,
        expiresAt,
        getAccessToken,
        refreshAccessToken,
        logout,
    ] = useStore(state => [
        state.authStatus,
        state.authMessage,
        state.authRetryUntil,
        state.expiresAt,
        state.getAccessToken,
        state.refreshAccessToken,
        state.logout,
    ]);

    useEffect(() => {
        const update = () => {
            setRetryRemaining(
                authRetryUntil
                    ? Math.max(
                          0,
                          Math.ceil((authRetryUntil - Date.now()) / 1000),
                      )
                    : 0,
            );
        };

        update();
        const timer = window.setInterval(update, 1000);

        return () => window.clearInterval(timer);
    }, [authRetryUntil]);

    useEffect(() => {
        if (authStatus !== "authenticated" || !expiresAt) {
            return undefined;
        }

        const refreshIn = Math.max(0, expiresAt - Date.now() - 60_000);
        const timer = window.setTimeout(() => {
            refreshAccessToken().catch(() => undefined);
        }, refreshIn);

        return () => window.clearTimeout(timer);
    }, [authStatus, expiresAt, refreshAccessToken]);

    if (
        authStatus === "idle" ||
        authStatus === "loading" ||
        authStatus === "authenticated"
    ) {
        return null;
    }

    const inactive = authStatus === "inactive";
    const title = inactive
        ? "Tài khoản chưa hoạt động"
        : "Không thể xác thực Zalo";
    const message = inactive
        ? "Tài khoản đang bị khóa hoặc chưa được duyệt. Vui lòng liên hệ đơn vị quản trị để được hỗ trợ."
        : authMessage || "Không thể hoàn tất xác thực. Vui lòng thử lại.";

    return (
        <AuthOverlay
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-notice-title"
            aria-describedby="auth-notice-message"
        >
            <AuthCard>
                <CloseButton
                    type="button"
                    aria-label="Đóng thông báo"
                    onClick={logout}
                >
                    <X size={20} />
                </CloseButton>

                <IconBox $inactive={inactive}>
                    <ShieldAlert size={30} strokeWidth={2.2} />
                </IconBox>

                <Eyebrow>Thông báo tài khoản</Eyebrow>
                <Title id="auth-notice-title">{title}</Title>
                <Message id="auth-notice-message">{message}</Message>

                {retryRemaining > 0 && (
                    <Countdown role="status">
                        <Clock3 size={17} />
                        Có thể thử lại sau {retryRemaining} giây
                    </Countdown>
                )}

                <ActionGrid $single={inactive}>
                    <SecondaryButton type="button" onClick={logout}>
                        {inactive ? "Đã hiểu" : "Để sau"}
                    </SecondaryButton>

                    {!inactive && (
                        <PrimaryButton
                            type="button"
                            disabled={retryRemaining > 0}
                            onClick={getAccessToken}
                        >
                            <RefreshCw size={18} />
                            {retryRemaining > 0
                                ? `Thử lại sau ${retryRemaining}s`
                                : "Thử lại"}
                        </PrimaryButton>
                    )}
                </ActionGrid>
            </AuthCard>
        </AuthOverlay>
    );
};

export default Auth;

const AuthOverlay = styled.div`
    position: fixed;
    inset: 0 auto 0 50%;
    z-index: 1000;
    width: min(100vw, 430px);
    box-sizing: border-box;
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-50%);
    background: rgba(13, 36, 54, 0.46);
    backdrop-filter: blur(5px);
`;

const AuthCard = styled.section`
    position: relative;
    width: 100%;
    max-height: calc(100vh - 36px);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 25px 20px 20px;
    border: 1px solid rgba(138, 179, 207, 0.28);
    border-radius: 26px;
    color: #173551;
    background: linear-gradient(180deg, #f7fcff 0%, #ffffff 45%);
    box-shadow: 0 24px 60px rgba(8, 48, 77, 0.28);
    text-align: center;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 14px;
    right: 14px;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 13px;
    display: grid;
    place-items: center;
    color: #54738b;
    background: #edf6fb;

    &:active {
        transform: scale(0.95);
    }
`;

const IconBox = styled.div<{ $inactive?: boolean }>`
    width: 66px;
    height: 66px;
    margin: 4px auto 15px;
    border-radius: 22px;
    display: grid;
    place-items: center;
    color: ${({ $inactive }) => ($inactive ? "#a15c00" : "#0067a8")};
    background: ${({ $inactive }) =>
        $inactive
            ? "linear-gradient(145deg, #fff5de, #ffe6b0)"
            : "linear-gradient(145deg, #e8f6ff, #d5efff)"};
    box-shadow: ${({ $inactive }) =>
        $inactive
            ? "0 12px 24px rgba(181, 106, 0, 0.13)"
            : "0 12px 24px rgba(0, 103, 168, 0.14)"};
`;

const Eyebrow = styled.div`
    color: #0075b8;
    font-size: calc(11px * var(--app-font-scale));
    line-height: 1.3;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
`;

const Title = styled.h1`
    margin: 7px 34px 8px;
    color: #173551;
    font-size: calc(21px * var(--app-font-scale));
    line-height: 1.25;
    font-weight: 950;
`;

const Message = styled.p`
    margin: 0;
    color: #647b8d;
    font-size: calc(14px * var(--app-font-scale));
    line-height: 1.55;
    font-weight: 600;
    overflow-wrap: anywhere;
`;

const Countdown = styled.div`
    min-height: 42px;
    margin-top: 15px;
    padding: 8px 12px;
    border: 1px solid #d7eaf5;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #075f9e;
    background: #f2f9fd;
    font-size: calc(13px * var(--app-font-scale));
    font-weight: 800;
`;

const ActionGrid = styled.div<{ $single?: boolean }>`
    margin-top: 20px;
    display: grid;
    grid-template-columns: ${({ $single }) =>
        $single ? "1fr" : "0.85fr 1.25fr"};
    gap: 10px;
`;

const BaseButton = styled.button`
    min-height: 48px;
    border: 0;
    border-radius: 15px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 900;

    &:active:not(:disabled) {
        transform: scale(0.98);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
    }
`;

const SecondaryButton = styled(BaseButton)`
    color: #49677e;
    background: #edf4f8;
`;

const PrimaryButton = styled(BaseButton)`
    color: #ffffff;
    background: linear-gradient(135deg, #07588f 0%, #007fc3 100%);
    box-shadow: 0 10px 20px rgba(0, 103, 168, 0.2);
`;
