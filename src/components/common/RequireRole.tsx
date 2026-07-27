import React, { FC, ReactNode } from "react";
import styled from "styled-components";
import { Icon } from "zmp-ui";
import { useStore } from "@store";
import { SystemRole } from "@dts";
import MeetingLayout from "@/components/MeetingRoom/Layout";
import { getSystemRole } from "@/utils/permissions";

const Wrapper = styled.div`
    min-height: 60vh;
    display: grid;
    place-items: center;
    padding: 32px 24px;
    text-align: center;
    gap: 12px;
    color: #667085;
`;

const IconCircle = styled.div`
    width: 64px;
    height: 64px;
    margin: 0 auto 8px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #d92d20;
    background: rgba(255, 218, 214, 0.6);
`;

const Title = styled.div`
    color: #172033;
    font-size: calc(18px * var(--app-font-scale));
    font-weight: 900;
`;

const Description = styled.div`
    font-size: calc(14px * var(--app-font-scale));
    font-weight: 600;
    line-height: 1.5;
`;

export const ForbiddenState: FC<{ message?: string }> = ({ message }) => (
    <Wrapper>
        <div>
            <IconCircle>
                <Icon icon="zi-lock" size={30} />
            </IconCircle>
            <Title>Bạn không có quyền truy cập</Title>
            <Description>
                {message || "Bạn không có quyền sử dụng chức năng này."}
            </Description>
        </div>
    </Wrapper>
);

type RequireRoleProps = {
    roles: SystemRole[];
    children: ReactNode;
};

const RequireRole: FC<RequireRoleProps> = ({ roles, children }) => {
    const user = useStore(state => state.user);
    const role = getSystemRole(user);

    if (!roles.includes(role)) {
        return (
            <MeetingLayout title="Không có quyền truy cập">
                <ForbiddenState />
            </MeetingLayout>
        );
    }

    return children;
};

export default RequireRole;
