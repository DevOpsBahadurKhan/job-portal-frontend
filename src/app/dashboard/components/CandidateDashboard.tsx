"use client";

import { useState } from "react";
import AdminSidebar from "./Candidate/CandidateSidebar";
import AdminOverview from "./Candidate/CandidateOverview";
import JobManagement from "./Candidate/JobManagement";
import CompanyManagement from "./Candidate/CompanyManagement";
import ApplicationManagement from "./Candidate/ApplicationsManagement";

export type ActiveSection = "overview" | "jobs" | "companies" | "application";

export default function AdminDashboard() {
    const [activeSection, setActiveSection] =
        useState<ActiveSection>("overview");

    const [collapsed, setCollapsed] = useState(false);

    const sectionTitles: Record<ActiveSection, string> = {
        overview: "Dashboard Overview",
        jobs: "Job Management",
        companies: "Company Management",
        application: "Application Management",
    };

    return (
        <div className="flex min-h-[calc(100vh-64px)] w-full bg-slate-50">
            <AdminSidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <main className="min-w-0 flex-1">
                <header className="border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="mb-1 text-xs text-slate-400">
                                Admin / {sectionTitles[activeSection]}
                            </div>

                            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                {sectionTitles[activeSection]}
                            </h1>
                        </div>
                    </div>
                </header>

                <div className="p-5 sm:p-8">
                    {activeSection === "overview" && (
                        <AdminOverview onNavigate={setActiveSection} />
                    )}

                    {activeSection === "jobs" && <JobManagement />}

                    {activeSection === "companies" && <CompanyManagement />}

                    {activeSection === "companies" && <CompanyManagement />}

                    {activeSection === "application" && <ApplicationManagement />}



                </div>
            </main>
        </div>
    );
}