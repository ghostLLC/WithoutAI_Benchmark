import { Injectable } from '@nestjs/common';
import { ConfigRepository } from '../repositories/config.repository';
import type { AssessmentResult, DimensionProfile, RiskPattern } from '@without-ai/shared';

@Injectable()
export class ResultBuilder {
  constructor(private readonly configRepository: ConfigRepository) {}

  async build(
    sceneId: string,
    baseRiskScore: number,
    triggeredRules: string[],
    finalLevel: string,
    dimensions: DimensionProfile,
    dominantPattern: RiskPattern,
  ): Promise<AssessmentResult> {
    const followUp = await this.configRepository.getFollowUpByLevel(sceneId, finalLevel);

    return {
      sceneId,
      baseRiskScore,
      triggeredRules,
      finalLevel: finalLevel as AssessmentResult['finalLevel'],
      dimensions,
      dominantPattern,
      riskReasons: followUp.riskReasons ?? [],
      retainedCapabilities: followUp.retainedCapabilities ?? [],
      actionSuggestions: followUp.actions ?? [],
    };
  }
}
