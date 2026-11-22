import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Header() {
    return (
        <header className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white px-5 py-6 shadow-sm sm:px-7 sm:py-7">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500" />
            <div className="relative">
                <div className="flex items-center justify-between">
                    <Link
                        href="/ai-assistant"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-violet-700"
                    >
                    <ArrowLeft size={15} />
                    Back
                    </Link>


                    <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        AI-Powered
                    </span>
                </div>
            </div>
        </header>
    );
}