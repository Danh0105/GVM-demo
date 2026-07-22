import React, { ReactNode } from "react";
import styled from "styled-components";
import { Page, useNavigate } from "zmp-ui";
import AppBottomNav from "@/components/layout/AppBottomNav";
import AppHeader from "@/components/layout/AppHeader";

type MeetingLayoutProps = {
    children: ReactNode;
    title: string;
    description?: string;
    backTo?: string;
};

const MeetingLayout: React.FC<MeetingLayoutProps> = ({
    children,
    title,
    description,
    backTo = "/",
}) => {
    const navigate = useNavigate();

    return (
        <PageRoot>
            <AppHeader
                back
                title={title}
                description={description}
                onBack={() => navigate(backTo, { direction: "backward" })}
            />
            <Content>{children}</Content>
            <AppBottomNav />
        </PageRoot>
    );
};

export default MeetingLayout;

export const PageRoot = styled(Page)`
    min-height: 100vh;
    max-width: 430px;
    margin: 0 auto;
    padding: 112px 0 90px;
    color: #172033;
    background: radial-gradient(
            circle at 28px 132px,
            rgba(0, 87, 160, 0.12),
            transparent 150px
        ),
        linear-gradient(180deg, #eef7ff 0, #f7fbff 260px, #f5f7fb 100%);
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
`;

export const Content = styled.main`
    display: grid;
    gap: 14px;
    padding: 14px 12px 24px;
`;
