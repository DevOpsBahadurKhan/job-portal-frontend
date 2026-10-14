"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function GuestGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.replace("/");
        }
    }, [loading, isAuthenticated, router]);

    if (loading || isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}