
export interface LearningRoadmapItem {
    skill: string;
    priority: number;
    estimatedDuration: string;
    topicsToLearn: string[];
    practicalTask: string;
    expectedOutcome: string;
}

export interface SkillGapResume {
    id: number;
    fileName: string;
}

export interface SkillGapTargetJob {
    id: number;
    title: string;
}

export interface SkillGapData {
    resume: SkillGapResume;
    targetJob: SkillGapTargetJob | null;
    currentSkills: string[];
    requiredSkills?: string[];
    matchedSkills?: string[];
    missingSkills: string[];
    recommendations: string[];
    learningRoadmap: LearningRoadmapItem[];
}
