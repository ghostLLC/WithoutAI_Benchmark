export type AssessmentLevel = 'continue' | 'limit' | 'pause';
export type RiskSignal = 'weakening' | 'replacement' | 'dependency';
export interface Scene {
    id: string;
    name: string;
    slug: string;
    summary: string;
    examples: string[];
    focusCapabilities: string[];
    enabled: boolean;
    sortOrder: number;
}
export interface QuestionOption {
    id: string;
    label: string;
    riskLevel?: AssessmentLevel;
    riskScore?: number;
    signals?: RiskSignal[];
    triggerTags?: string[];
}
export interface Question {
    id: string;
    sceneId: string;
    type: 'single_choice' | 'scenario_choice';
    category: string;
    title: string;
    description?: string;
    options: QuestionOption[];
    weight: number;
    isHighWeight: boolean;
    sortOrder: number;
    enabled: boolean;
}
export interface SubmittedAnswer {
    questionId: string;
    optionId: string;
}
export interface AssessmentResult {
    sceneId: string;
    baseRiskScore: number;
    triggeredRules: string[];
    finalLevel: AssessmentLevel;
    riskReasons: string[];
    retainedCapabilities: string[];
    actionSuggestions: string[];
}
export interface FollowUpAction {
    sceneId: string;
    level: AssessmentLevel;
    title: string;
    riskReasons: string[];
    retainedCapabilities: string[];
    actions: string[];
}
export interface SubmitAssessmentRequest {
    sceneId: string;
    answers: SubmittedAnswer[];
}
export interface ScenesResponse {
    items: Scene[];
}
export interface QuestionsResponse {
    sceneId: string;
    items: Question[];
}
