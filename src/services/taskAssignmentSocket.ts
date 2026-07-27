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

export const connectTaskAssignmentSocket = (token: string): Socket => {
    if (socket?.connected && socketToken === token) {
        return socket;
    }

    socket?.disconnect();
    socketToken = token;
    socket = io(`${getSocketOrigin()}/task-assignments`, {
        auth: { token },
        extraHeaders: { Authorization: `Bearer ${token}` },
        transports: ["websocket"],
    });

    return socket;
};

export const disconnectTaskAssignmentSocket = () => {
    socket?.disconnect();
    socket = undefined;
    socketToken = undefined;
};
