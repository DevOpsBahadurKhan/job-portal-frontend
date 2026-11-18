
export interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    billingInterval: string;
    targetAudience: "CANDIDATE" | "RECRUITER" | "BOTH";
    maxActiveJobs: number;
    maxAiMessages: number;
    maxResumeAnalyses: number;
    maxSkillGapAnalyses: number;
    maxCareerGuidance: number;
}

export interface PlansResponse {
    success: boolean;
    data: Plan[];
}
