export interface AIJob {
    id: number;
    title: string;
    description: string;
    location: string;
    salaryMin: number;
    salaryMax: number;
    skills: string;
}

export interface AIChatData {
    message: string;
    jobs: AIJob[];
    toolResults?: Array<{
        tool: string;
        success: boolean;
        result?: unknown;
        error?: string;
    }>;
}

export interface AIChatResponse {
    success: boolean;
    data: AIChatData;
    toolCalls: number;
}

export interface ChatMessage {
    role: "user" | "assistant";
    text: string;
    jobs?: AIJob[];
}