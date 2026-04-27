import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AssessmentResult } from '@without-ai/shared';

interface ExplainResponse {
  scene_id: string;
  enhanced_risk_reasons: string[];
  enhanced_retained_capabilities: string[];
  summary: string | null;
}

interface SuggestResponse {
  scene_id: string;
  enhanced_suggestions: string[];
  priority: string;
}

@Injectable()
export class AiCoreService {
  private readonly baseUrl: string;
  private readonly logger = new Logger(AiCoreService.name);

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('AI_CORE_URL', 'http://localhost:8000');
  }

  /**
   * 调用 AI Core 增强风险解释。如果调用失败，静默回退到原始数据。
   */
  async enhanceExplanation(result: AssessmentResult): Promise<{
    riskReasons: string[];
    retainedCapabilities: string[];
    summary: string | null;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: result.sceneId,
          final_level: result.finalLevel,
          base_risk_score: result.baseRiskScore,
          triggered_rules: result.triggeredRules,
          risk_reasons: result.riskReasons,
          retained_capabilities: result.retainedCapabilities,
        }),
        signal: AbortSignal.timeout(2000),
      });

      if (!res.ok) {
        throw new Error(`AI Core returned ${res.status}`);
      }

      const data: ExplainResponse = await res.json();
      this.logger.log(`AI Core explain success for scene=${result.sceneId}`);

      return {
        riskReasons: data.enhanced_risk_reasons,
        retainedCapabilities: data.enhanced_retained_capabilities,
        summary: data.summary,
      };
    } catch (err) {
      this.logger.warn(`AI Core explain fallback: ${err instanceof Error ? err.message : err}`);
      return {
        riskReasons: result.riskReasons,
        retainedCapabilities: result.retainedCapabilities,
        summary: null,
      };
    }
  }

  /**
   * 对话式评估。如果 AI Core 不可用，返回 null。
   */
  async converse(request: {
    sceneId: string;
    sceneName: string;
    focusCapabilities: string[];
    history: { role: 'ai' | 'user'; content: string }[];
  }): Promise<{
    type: 'question' | 'assessment';
    message: string;
    finalLevel: string | null;
    riskReasons: string[] | null;
    retainedCapabilities: string[] | null;
    actionSuggestions: string[] | null;
  } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/converse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: request.sceneId,
          scene_name: request.sceneName,
          focus_capabilities: request.focusCapabilities,
          history: request.history,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`AI Core returned ${res.status}`);
      return await res.json();
    } catch (err) {
      this.logger.warn(`AI Core converse failed: ${err instanceof Error ? err.message : err}`);
      return null;
    }
  }

  /**
   * 调用 AI Core 优化行动建议。如果调用失败，静默回退到原始数据。
   */
  async enhanceSuggestions(result: AssessmentResult): Promise<{
    suggestions: string[];
    priority: string | null;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: result.sceneId,
          final_level: result.finalLevel,
          action_suggestions: result.actionSuggestions,
          triggered_rules: result.triggeredRules,
        }),
        signal: AbortSignal.timeout(2000),
      });

      if (!res.ok) {
        throw new Error(`AI Core returned ${res.status}`);
      }

      const data: SuggestResponse = await res.json();
      this.logger.log(`AI Core suggest success for scene=${result.sceneId}`);

      return {
        suggestions: data.enhanced_suggestions,
        priority: data.priority,
      };
    } catch (err) {
      this.logger.warn(`AI Core suggest fallback: ${err instanceof Error ? err.message : err}`);
      return {
        suggestions: result.actionSuggestions,
        priority: null,
      };
    }
  }
}
