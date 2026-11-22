"use client";

import type { ActiveSection } from "../RecruiterDashboard";

interface AdminSidebarProps {
    activeSection: ActiveSection;
    setActiveSection: (section: ActiveSection) => void;
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
}

const menuItems: {
    label: string;
    section: ActiveSection;
}[] = [
        { label: "Overview", section: "overview" },
        // { label: "Job Management", section: "jobs" },
        // { label: "Company Management", section: "companies" },
        { label: "Application Management", section: "application" },
    ];

export default function CandidateSidebar({
    activeSection,
    setActiveSection,
    collapsed,
    setCollapsed,
}: AdminSidebarProps) {
    return (
        <aside
            className={`flex min-h-full shrink-0 flex-col border-r border-slate-200 bg-white transition-all ${collapsed ? "w-20" : "w-64"
                }`}
        >
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
                {!collapsed && (
                    <h2 className="font-bold text-slate-900">Admin Panel</h2>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                    aria-label="Toggle sidebar"
                >
                    ☰
                </button>
            </div>

            <nav className="flex-1 space-y-2 p-3">
                {menuItems.map((item) => {
                    const isActive = activeSection === item.section;

                    return (
                        <button
                            key={item.section}
                            onClick={() => setActiveSection(item.section)}
                            title={collapsed ? item.label : undefined}
                            className={`w-full rounded-lg px-3 py-3 text-left text-sm font-medium transition ${isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                        >
                            {collapsed ? item.label.charAt(0) : item.label}
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}