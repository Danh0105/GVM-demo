import { MINI_APP_ID } from "@constants/common";
import Routes from "@pages";
import { useStore } from "@store";
import React, { useEffect } from "react";
import { App, SnackbarProvider } from "zmp-ui";
import Auth from "./Auth";
import ErrorNotification from "./notifications/ErrorNotification";

const MyApp = () => {
    const [, getOrganization] = useStore(state => [
        state.organization,
        state.getOrganization,
    ]);

    useEffect(() => {
        getOrganization({ miniAppId: MINI_APP_ID }).catch(() => undefined);
    }, [getOrganization]);

    return (
        <App>
            <SnackbarProvider>
                <ErrorNotification />
                <Auth />
                <Routes />
            </SnackbarProvider>
        </App>
    );
};
export default MyApp;
