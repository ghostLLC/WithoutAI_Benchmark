import { Injectable } from '@nestjs/common';
import type { AssessmentLevel, DimensionProfile, RiskPattern } from '@without-ai/shared';

const ESCALATION_TRIGGERS = ['first_process_replaced', 'dependency_signal_detected'];
const PAUSE_TRIGGERS = ['cannot_finish_without_ai', 'core_step_fully_replaced'];

@Injectable()
export class ResultLevelDecider {
  decide(
    baseRiskScore: number,
    triggeredRules: string[],
    dimensions: DimensionProfile,
    dominantPattern: RiskPattern,
  ): AssessmentLevel {
    let level: AssessmentLevel =
      baseRiskScore >= 70 ? 'pause' :
      baseRiskScore >= 35 ? 'limit' :
      'continue';

    // 跨维度模式校正
    if (dominantPattern === '全面退化' && level !== 'pause') {
      level = 'pause';
    } else if (dominantPattern === '替代模式' && level === 'continue') {
      level = 'limit';
    }

    // 触发规则校正
    if (level === 'continue' && this.hasEscalationTrigger(triggeredRules)) {
      level = 'limit';
    }
    if (level === 'limit' && this.hasPauseTrigger(triggeredRules)) {
      level = 'pause';
    }

    // 最高维度分数超过 80 但也可能整体分不高——强制 pause
    const maxDim = Math.max(
      dimensions.understanding, dimensions.thinking,
      dimensions.organization, dimensions.execution, dimensions.judgment,
    );
    if (maxDim >= 80 && level !== 'pause') {
      level = 'pause';
    }

    return level;
  }

  private hasEscalationTrigger(triggers: string[]): boolean {
    return triggers.some((r) => ESCALATION_TRIGGERS.includes(r));
  }

  private hasPauseTrigger(triggers: string[]): boolean {
    return triggers.some((r) => PAUSE_TRIGGERS.includes(r));
  }
}
