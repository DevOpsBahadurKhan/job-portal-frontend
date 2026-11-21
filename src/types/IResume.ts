export type ResumeStatus =
    | "UPLOADED"
    | "PROCESSING"
    | "COMPLETED"
    | "FAILED";

export interface ResumeAnalysisSummary {
    id: number;
    overallScore: number | null;
    atsScore: number | null;
    createdAt: string;
}

export interface Resume {
    id: number;
    fileName: string;
    fileType: string | null;
    fileSize: number | null;
    status: ResumeStatus;
    isDefault: boolean;
    uploadedAt: string;
    updatedAt: string;
    analysis: ResumeAnalysisSummary | null;
}

export interface ResumeAnalysis {
    id: number;
    overallScore: number | null;
    atsScore: number | null;
    summary: string | null;

    strengths: string[] | null;
    weaknesses: string[] | null;
    suggestions: string[] | null;

    skills: string[] | null;
    missingSkills: string[] | null;

    keywords: string[] | null;
    missingKeywords: string[] | null;

    experienceAnalysis: {
        summary?: string;
        strengths?: string[];
        gaps?: string[];
    } | null;

    educationAnalysis: {
        summary?: string;
        strengths?: string[];
        gaps?: string[];
    } | null;

    projectsAnalysis: {
        summary?: string;
        strengths?: string[];
        improvements?: string[];
    } | null;

    aiModel: string | null;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;

    createdAt: string;
    updatedAt: string;
}

export interface ResumeAnalysisResponse {
    resume: {
        id: number;
        fileName: string;
        fileType: string | null;
        fileSize: number | null;
        status: ResumeStatus;
        uploadedAt: string;
        updatedAt: string;
    };

    analysis: ResumeAnalysis | null;
}

export interface ResumeMatch {
    id: number;
    resumeId: number;
    jobId: number;
    matchScore: number | null;

    matchedSkills: string[] | null;
    missingSkills: string[] | null;

    matchedKeywords: string[] | null;
    missingKeywords: string[] | null;

    recommendations: string[] | null;

    createdAt: string;
    updatedAt: string;
}

export interface ResumeMatch {
    id: number;
    resumeId: number;
    jobId: number;

    matchScore: number | null;

    matchedSkills: string[] | null;
    missingSkills: string[] | null;

    matchedKeywords: string[] | null;
    missingKeywords: string[] | null;

    recommendations: string[] | null;

    createdAt: string;
    updatedAt: string;
}