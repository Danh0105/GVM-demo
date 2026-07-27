import { BASE_URL } from "@constants/common";
import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;
let socketToken: string | undefined;

const getSocketOrigin = () => {
    try {
        return new URL(BASE_URL).origin;
    } catch {
        return BASE_URL;
    }
};

export const connectRemoteQueueSocket = (token: string): Socket => {
    if (socket?.connected && socketToken === token) {
        return socket;
    }

    socket?.disconnect();
    socketToken = token;
    socket = io(`${getSocketOrigin()}/remote-queue`, {
        auth: { token },
        extraHeaders: { Authorization: `Bearer ${token}` },
        transports: ["websocket"],
    });

    return socket;
};

export const disconnectRemoteQueueSocket = () => {
    socket?.disconnect();
    socket = undefined;
    socketToken = undefined;
};

export const vietnamServiceDate = () =>
    new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
