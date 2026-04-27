import { Injectable, BadRequestException } from '@nestjs/common';
import { RiskScoreCalculator } from './services/risk-score-calculator';
import { TriggerRuleEngine } from './services/trigger-rule-engine';
import { ResultLevelDecider } from './services/result-level-decider';
import { ResultBuilder } from './services/result-builder';
import { AiCoreService } from './services/ai-core.service';
import { ConfigRepository } from './repositories/config.repository';
import type {
  Scene, Question, AssessmentResult, FollowUpAction,
  SubmitAssessmentRequest, AssessmentDepth,
} from '@without-ai/shared';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly riskScoreCalculator: RiskScoreCalculator,
    private readonly triggerRuleEngine: TriggerRuleEngine,
    private readonly resultLevelDecider: ResultLevelDecider,
    private readonly resultBuilder: ResultBuilder,
    private readonly aiCoreService: AiCoreService,
    private readonly configRepository: ConfigRepository,
  ) {}

  async getScenes(): Promise<{ items: Scene[] }> {
    return { items: await this.configRepository.getAllEnabledScenes() };
  }

  async getQuestions(sceneId: string, depth?: string): Promise<{ sceneId: string; items: Question[] }> {
    return {
      sceneId,
      items: await this.configRepository.getQuestionsByScene(sceneId, depth),
    };
  }

  async submitAssessment(request: SubmitAssessmentRequest): Promise<AssessmentResult> {
    const { sceneId, depth, answers } = request;

    if (!answers || answers.length === 0) {
      throw new BadRequestException('至少需要提交一个答案');
    }

    // 校验深度参数
    const validDepths: AssessmentDepth[] = ['quick', 'standard', 'deep'];
    const d = depth ?? 'quick';
    if (!validDepths.includes(d)) {
      throw new BadRequestException(`无效的 depth 参数: ${d}`);
    }

    // 校验 questionId 归属
    const sceneQuestions = await this.configRepository.getQuestionsByScene(sceneId, d);
    const validQuestionIds = new Set(sceneQuestions.map((q) => q.id));
    const invalidIds = [...new Set(answers.map((a) => a.questionId))].filter(
      (id) => !validQuestionIds.has(id),
    );
    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `以下题目不属于场景 ${sceneId}: ${invalidIds.join(', ')}`,
      );
    }

    // 五维评分
    const { baseRiskScore, dimensions, dominantPattern } =
      await this.riskScoreCalculator.calculate(sceneId, d, answers);
    const triggeredRules = await this.triggerRuleEngine.detect(sceneId, d, answers);
    const finalLevel = this.resultLevelDecider.decide(
      baseRiskScore, triggeredRules, dimensions, dominantPattern,
    );

    let result = await this.resultBuilder.build(
      sceneId, baseRiskScore, triggeredRules, finalLevel,
      dimensions, dominantPattern,
    );

    // AI Core 增强
    const [explainResult, suggestResult] = await Promise.all([
      this.aiCoreService.enhanceExplanation(result),
      this.aiCoreService.enhanceSuggestions(result),
    ]);

    const hasAiExplain = explainResult.summary !== null;
    const hasAiSuggest = suggestResult.priority !== null;

    result = {
      ...result,
      riskReasons: hasAiExplain ? explainResult.riskReasons : result.riskReasons,
      retainedCapabilities: hasAiExplain ? explainResult.retainedCapabilities : result.retainedCapabilities,
      actionSuggestions: hasAiSuggest ? suggestResult.suggestions : result.actionSuggestions,
    };

    return result;
  }

  async converse(request: {
    sceneId: string; sceneName: string; focusCapabilities: string[];
    history: { role: 'ai' | 'user'; content: string }[];
  }) {
    const result = await this.aiCoreService.converse(request);
    if (!result) {
      throw new BadRequestException('对话模式需要 AI Core 服务支持，请确认 AI Core 已启动并配置了 API Key');
    }
    return result;
  }

  async getFollowUp(sceneId: string, level: string): Promise<FollowUpAction> {
    const validLevels = ['continue', 'limit', 'pause'];
    if (!validLevels.includes(level)) {
      throw new BadRequestException(
        `无效的 level 参数: ${level}，仅支持 ${validLevels.join(' / ')}`,
      );
    }
    return this.configRepository.getFollowUpByLevel(sceneId, level);
  }
}
