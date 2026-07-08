import React, { FC } from "react";
import { useNavigate } from "zmp-ui";
import AppHeader from "./AppHeader";

export interface DefaultHeaderProps {
    title?: string;
    back?: boolean;
}

const DefaultHeader: FC<DefaultHeaderProps> = ({ title, back }) => {
    const navigate = useNavigate();

    return (
        <AppHeader
            back={back}
            title={title}
            onBack={() => navigate(-1)}
        />
    );
};

export default DefaultHeader;
