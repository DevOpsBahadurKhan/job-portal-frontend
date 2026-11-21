export interface CandidateProfile {
    id: number;
    userId: number;
    phone: string | null;
    avatarUrl: string | null;
    headline: string | null;
    summary: string | null;
    location: string | null;
    preferredRoles: string[];
    preferredLocations: string[];
    preferredJobTypes: string[];
    expectedSalaryMin: number | null;
    expectedSalaryMax: number | null;
    noticePeriod: string | null;
}

export interface UpdateCandidateProfile {
    name?: string;
    phone?: string;
    headline?: string;
    summary?: string;
    location?: string;
    preferredRoles?: string[];
    preferredLocations?: string[];
    preferredJobTypes?: string[];
    expectedSalaryMin?: number;
    expectedSalaryMax?: number;
    noticePeriod?: string;
}

export type ProfileForm = {
    phone: string;
    headline: string;
    summary: string;
    location: string;
    preferredRoles: string;
    preferredLocations: string;
    preferredJobTypes: string;
    expectedSalaryMin: string;
    expectedSalaryMax: string;
    noticePeriod: string;
};


export interface ISctionProps  {
    title: string;
    description: string;
    icon: string;
}