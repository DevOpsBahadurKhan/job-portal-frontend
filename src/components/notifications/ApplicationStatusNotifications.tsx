
"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { useAuth } from "@/contexts/AuthContext";

export default function ApplicationStatusNotifications() {
    const { user, isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (loading) return;

        if (
            !isAuthenticated ||
            !user ||
            user.role !== "CANDIDATE"
        ) {
            socket.disconnect();
            return;
        }

        const handleStatusUpdate = (update: {
            applicationId: number;
            status: string;
            updatedAt?: string;
        }) => {
            const status = update.status.replace(/_/g, " ");

            switch (update.status) {
                case "SHORTLISTED":
                    toast.success("Application shortlisted!", {
                        description: "Your application has been shortlisted.",
                    });
                    break;

                case "ACCEPTED":
                    toast.success("Application accepted!", {
                        description: "Congratulations! Your application has been accepted.",
                    });
                    break;

                case "REJECTED":
                    toast.error("Application status updated", {
                        description: "Your application was rejected.",
                    });
                    break;

                case "PENDING":
                    toast.info("Application status updated", {
                        description: "Your application is pending.",
                    });
                    break;

                default:
                    toast.info("Application status updated", {
                        description: `New status: ${status}`,
                    });
            }
        };

        socket.on("application:status-updated", handleStatusUpdate);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("application:status-updated", handleStatusUpdate);
        };
    }, [user?.id, user?.role, isAuthenticated, loading]);

    return null;
}
