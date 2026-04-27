// ====== 评估等级 ======
export type AssessmentLevel = 'continue' | 'limit' | 'pause';

// ====== 题型 ======
export type QuestionType = 'behavioral' | 'scenario' | 'self_check';

// ====== 测评深度 ======
export type AssessmentDepth = 'quick' | 'standard' | 'deep';

// ====== 风险信号 ======
export type RiskSignal = 'weakening' | 'replacement' | 'dependency';

// ====== 五维能力 ======
export const DIMENSIONS = ['understanding', 'thinking', 'organization', 'execution', 'judgment'] as const;
export type Dimension = typeof DIMENSIONS[number];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  understanding: '基础理解',
  thinking: '自主思考',
  organization: '独立拆解',
  execution: '基础执行',
  judgment: '判断产出',
};

// ====== 场景 ======
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

// ====== 题目选项 ======
export interface QuestionOption {
  id: string;
  label: string;
  riskLevel?: AssessmentLevel;
  riskScore?: number;
  dimensionScores: Record<Dimension, number>;
  signals?: RiskSignal[];
  triggerTags?: string[];
}

// ====== 题目 ======
export interface Question {
  id: string;
  sceneId: string;
  type: 'single_choice' | 'scenario_choice';
  questionType: QuestionType;
  category: string;
  title: string;
  description?: string;
  options: QuestionOption[];
  weight: number;
  isHighWeight: boolean;
  depthLevels: AssessmentDepth[];
  sortOrder: number;
  enabled: boolean;
}

// ====== 提交答案 ======
export interface SubmittedAnswer {
  questionId: string;
  optionId: string;
}

// ====== 维度画像 ======
export type DimensionProfile = Record<Dimension, number>;

// ====== 风险模式 ======
export type RiskPattern = '全面退化' | '替代模式' | '启动依赖' | '外围依赖' | '健康辅助' | null;

// ====== 评估结果 ======
export interface AssessmentResult {
  sceneId: string;
  baseRiskScore: number;
  triggeredRules: string[];
  finalLevel: AssessmentLevel;
  dimensions: DimensionProfile;
  dominantPattern: RiskPattern;
  riskReasons: string[];
  retainedCapabilities: string[];
  actionSuggestions: string[];
}

// ====== 后续动作 ======
export interface FollowUpAction {
  sceneId: string;
  level: AssessmentLevel;
  title: string;
  riskReasons: string[];
  retainedCapabilities: string[];
  actions: string[];
}

// ====== API 请求/响应类型 ======
export interface SubmitAssessmentRequest {
  sceneId: string;
  depth: AssessmentDepth;
  answers: SubmittedAnswer[];
}

export interface ScenesResponse {
  items: Scene[];
}

export interface QuestionsResponse {
  sceneId: string;
  items: Question[];
}
