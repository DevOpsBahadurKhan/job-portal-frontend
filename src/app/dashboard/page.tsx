
"use client";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

import CandidateDashboard from "./components/CandidateDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";
import AdminDashboard from "./components/AdminDashboard";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

  let DashboardComponent = null;

  if (isAuthenticated && user) {
    switch (user.role) {
      case "CANDIDATE":
        DashboardComponent = CandidateDashboard;
        break;

      case "RECRUITER":
        DashboardComponent = RecruiterDashboard;
        break;

      case "ADMIN":
      case "SUPER_ADMIN":
        DashboardComponent = AdminDashboard;
        break;

      default:
        DashboardComponent = null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {DashboardComponent ? (
        <DashboardComponent />
      ) : (
        <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
          <p className="text-gray-600">
            {!isAuthenticated
              ? "Please login to access your dashboard."
              : "Unauthorized access"}
          </p>
        </div>
      )}
    </div>
  );
}
