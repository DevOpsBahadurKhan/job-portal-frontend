
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { ChatMessage } from "@/types/IAi";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";



const suggestions = [
    "Find Node.js jobs in Bengaluru",
    "Remote jobs for React developers",
    "Jobs with a salary above ₹10 LPA",
];

// const futureFeatures = [

//     {
//         title: "Career Guidance",
//         description: "Get personalized career suggestions",
//         icon: "compass",
//     },
// ];

function FeatureIcon({ type }: { type: string }) {
    if (type === "file") {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M8 13h8M8 17h5" />
            </svg>
        );
    }

    if (type === "target") {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
        </svg>
    );
}

export default function AIChat() {
    const router = useRouter();

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const handleNewChat = () => {
        if (loading) return;
        setMessages([]);
        setError("");
        setInput("");
        setSidebarOpen(false);
    };

    const handleSubmit = async (
        e?: FormEvent<HTMLFormElement>,
        prompt?: string
    ): Promise<void> => {
        e?.preventDefault();

        const message = (prompt ?? input).trim();
        if (!message || loading) return;

        setMessages((prev) => [...prev, { role: "user", text: message }]);
        setInput("");
        setLoading(true);
        setError("");

        try {
            const response = await apiClient.chatWithAI(message);

            if (!response.success || !response.data?.success) {
                throw new Error(response.error || "AI request failed");
            }

            const aiData = response.data.data;

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: aiData.message,
                    jobs: aiData.jobs || [],
                },
            ]);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] min-h-[600px] overflow-hidden bg-white text-slate-800">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-300 md:relative md:z-10 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Sidebar header */}
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Career AI</p>
                            <p className="text-[11px] text-slate-500">Your career companion</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 md:hidden"
                    >
                        ✕
                    </button>
                </div>

                {/* New chat */}
                <div className="p-4">
                    <button
                        type="button"
                        onClick={handleNewChat}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                    >
                        <span className="text-lg leading-none">＋</span>
                        New conversation
                    </button>
                </div>

                {/* Main tools */}
                <div className="flex-1 overflow-y-auto px-3 pb-4">
                    <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Workspace
                    </p>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl bg-violet-100 px-3 py-3 text-left text-sm font-semibold text-violet-800"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-violet-700 shadow-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 4-4-4Z" />
                            </svg>
                        </span>
                        AI Job Assistant
                        <span className="ml-auto h-2 w-2 rounded-full bg-violet-500" />
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSidebarOpen(false);
                            router.push("/resume-analyzer");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                            <FeatureIcon type="file" />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                                Resume Analyzer
                            </span>

                            <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                                Analyze your resume and get improvement tips
                            </span>
                        </span>

                        <span className="rounded-md bg-violet-100 px-1.5 py-1 text-[9px] font-semibold text-violet-600">
                            Open
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSidebarOpen(false);
                            router.push("/skill-gap");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                            <FeatureIcon type="file" />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                                Skill Gap Analysis
                            </span>

                            <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                                Discover skills to improve your profile
                            </span>
                        </span>

                        <span className="rounded-md bg-violet-100 px-1.5 py-1 text-[9px] font-semibold text-violet-600">
                            Open
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSidebarOpen(false);
                            router.push("/career-guidance");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                            <FeatureIcon type="file" />
                        </span>

                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium">
                                Career Guidance
                            </span>

                            <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                                Discover skills to improve your profile
                            </span>
                        </span>

                        <span className="rounded-md bg-violet-100 px-1.5 py-1 text-[9px] font-semibold text-violet-600">
                            Open
                        </span>
                    </button>

                    {/* <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                        Coming soon
                    </p>

                    <div className="space-y-1">
                        {futureFeatures.map((feature) => (
                            <div
                                key={feature.title}
                                title={feature.description}
                                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 opacity-65"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500">
                                    <FeatureIcon type={feature.icon} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-slate-700">
                                        {feature.title}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
                                        {feature.description}
                                    </span>
                                </span>
                                <span className="rounded-md bg-slate-200/70 px-1.5 py-1 text-[9px] font-semibold text-slate-500">
                                    Soon
                                </span>
                            </div>
                        ))}
                    </div> */}

                    {messages.length > 0 && (
                        <>
                            <p className="px-3 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                Current session
                            </p>
                            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                                <p className="truncate text-xs font-medium text-slate-700">
                                    {messages.find((m) => m.role === "user")?.text}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-400">
                                    {messages.filter((m) => m.role === "user").length} messages
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar footer */}
                <div className="border-t border-slate-200 p-4">
                    <Link
                        href="/dashboard"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-200 hover:text-slate-900">
                        <ArrowLeft size={15} />Back to previous page
                    </Link>
                    <p className="mt-3 px-3 text-[10px] text-slate-400">
                        AI responses may not always be accurate.
                    </p>
                </div>
            </aside>

            {/* Main chat area */}
            <section className="flex min-w-0 flex-1 flex-col bg-white">
                {/* Top bar */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 px-4 sm:px-7">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open sidebar"
                            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="min-w-0">
                            <h1 className="truncate text-sm font-bold text-slate-900 sm:text-base">
                                AI Job Assistant
                            </h1>
                            <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Ready to help you find opportunities
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleNewChat}
                        disabled={loading || messages.length === 0}
                        className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                    >
                        <span className="text-base">＋</span>
                        <span className="hidden sm:inline">New chat</span>
                    </button>
                </header>

                {/* Chat body */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 px-4 py-6 sm:px-7">
                    {messages.length === 0 ? (
                        <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center py-8 text-center">
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-200">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                            </div>

                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                                Your AI career companion
                            </p>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Find your next opportunity
                            </h2>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                                Tell me about your skills, preferred location, or salary expectations.
                                I can help you discover matching jobs from our database.
                            </p>

                            <div className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleSubmit(undefined, suggestion)}
                                        className="group rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-medium leading-5 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md disabled:opacity-50"
                                    >
                                        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700 transition group-hover:bg-violet-100">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M7 7h10v10" />
                                            </svg>
                                        </span>
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mx-auto max-w-3xl space-y-7">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {msg.role === "assistant" && (
                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-bold text-white">
                                            AI
                                        </div>
                                    )}

                                    <div
                                        className={`min-w-0 ${msg.role === "user"
                                            ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-slate-900 px-4 py-3 text-white shadow-sm"
                                            : "flex-1 pt-1 text-slate-800"
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap text-sm leading-7">
                                            {msg.text}
                                        </p>

                                        {msg.jobs && msg.jobs.length > 0 && (
                                            <div className="mt-5 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-900">
                                                        Matching opportunities
                                                    </h3>
                                                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                                                        {msg.jobs.length} jobs
                                                    </span>
                                                </div>

                                                {msg.jobs.map((job) => (
                                                    <article
                                                        key={job.id}
                                                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md sm:p-5"
                                                    >
                                                        <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                                            <div className="flex min-w-0 gap-3">
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-lg font-bold text-violet-700">
                                                                    {job.title.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h4 className="font-semibold text-slate-900">
                                                                        {job.title}
                                                                    </h4>
                                                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
                                                                            <circle cx="12" cy="10" r="2.2" />
                                                                        </svg>
                                                                        {job.location}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="sm:text-right">
                                                                <p className="text-sm font-bold text-emerald-700">
                                                                    ₹{job.salaryMin.toLocaleString("en-IN")} – ₹{job.salaryMax.toLocaleString("en-IN")}
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    Salary range
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {job.skills && (
                                                            <div className="mt-4 flex flex-wrap gap-2">
                                                                {job.skills.split(",").map((skill) => (
                                                                    <span
                                                                        key={skill.trim()}
                                                                        className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                                                                    >
                                                                        {skill.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {job.description && (
                                                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                                                                {job.description}
                                                            </p>
                                                        )}

                                                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                                            <span className="text-xs text-slate-400">
                                                                Job ID: {job.id}
                                                            </span>
                                                            <a
                                                                href={`/jobs/${job.id}`}
                                                                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                                                            >
                                                                View job
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === "user" && (
                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-xs font-bold text-slate-700">
                                            You
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-xs font-bold text-white">
                                        AI
                                    </div>
                                    <div className="flex items-center gap-1.5 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.3s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.15s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500" />
                                        <span className="ml-2 text-xs text-slate-500">
                                            Finding jobs...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="ml-12 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </main>

                {/* Message composer */}
                <footer className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-7">
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-50"
                    >
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    void handleSubmit();
                                }
                            }}
                            placeholder="Ask about jobs, skills, salary, or location..."
                            disabled={loading}
                            rows={1}
                            className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <span className="hidden sm:inline">Send</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14-7-4 14-3-6-7-1Z" />
                            </svg>
                        </button>
                    </form>

                    <p className="mt-2 text-center text-[11px] text-slate-400">
                        AI can make mistakes. Verify job details before applying.
                    </p>
                </footer>
            </section>
        </div>
    );
}
