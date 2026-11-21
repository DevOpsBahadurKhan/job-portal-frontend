
import { io } from "socket.io-client";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const socket = io(API_URL, {
    autoConnect: false,
    withCredentials: true,
    reconnection: true,
});
