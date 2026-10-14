"use client";

import JobForm from "@/components/jobs/JobForm";

export default function CreateJobPage() {
    // Replace this with the logged-in recruiter's actual company ID.
    const companyId = 1;

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="mx-auto max-w-3xl">
                <JobForm
                    companyId={companyId}
                    onSuccess={() => {
                        // Optional: refresh jobs or navigate after successful creation.
                    }}
                />
            </div>
        </main>
    );
}