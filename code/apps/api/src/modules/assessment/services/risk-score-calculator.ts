import { Injectable } from '@nestjs/common';
import { ConfigRepository } from '../repositories/config.repository';
import type { SubmittedAnswer, DimensionProfile, Dimension, RiskPattern } from '@without-ai/shared';
import { DIMENSIONS } from '@without-ai/shared';

@Injectable()
export class RiskScoreCalculator {
  constructor(private readonly configRepository: ConfigRepository) {}

  async calculate(
    sceneId: string,
    depth: string,
    answers: SubmittedAnswer[],
  ): Promise<{
    baseRiskScore: number;
    dimensions: DimensionProfile;
    dominantPattern: RiskPattern;
  }> {
    const questions = await this.configRepository.getQuestionsByScene(sceneId, depth);
    const profile: DimensionProfile = {
      understanding: 0, thinking: 0, organization: 0, execution: 0, judgment: 0,
    };

    let totalAnswered = 0;

    for (const question of questions) {
      for (const answer of answers) {
        if (answer.questionId !== question.id) continue;

        for (const option of question.options) {
          if (option.id !== answer.optionId) continue;

          const dims = option.dimensionScores ?? {};
          for (const dim of DIMENSIONS) {
            profile[dim] += dims[dim] ?? 0;
          }
          totalAnswered++;
        }
      }
    }

    // 归一化：按题目数量标准化到 0-100
    const normalize = totalAnswered > 0 ? 100 / (totalAnswered * 10) : 1;
    const normProfile: DimensionProfile = {
      understanding: 0, thinking: 0, organization: 0, execution: 0, judgment: 0,
    };
    for (const dim of DIMENSIONS) {
      normProfile[dim] = Math.min(100, Math.round(profile[dim] * normalize));
    }

    const baseRiskScore = Math.round(
      Object.values(normProfile).reduce((a, b) => a + b, 0) / DIMENSIONS.length,
    );

    const dominantPattern = this.detectPattern(normProfile);

    return { baseRiskScore, dimensions: normProfile, dominantPattern };
  }

  private detectPattern(profile: DimensionProfile): RiskPattern {
    const vals = DIMENSIONS.map((d) => profile[d]);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const spread = max - min;

    // 全部低风险 → 健康辅助
    if (max <= 25) return '健康辅助';

    // 全部高风险 → 全面退化
    if (min >= 60) return '全面退化';

    // 思考 + 拆解明显高于执行 → 典型的替代模式
    if (profile.thinking >= 50 && profile.organization >= 40 && spread >= 30) {
      return '替代模式';
    }

    // 思考维度突出高 → 启动依赖
    if (profile.thinking >= 50 && profile.thinking - avg >= 15) {
      return '启动依赖';
    }

    // 各维度中等波动 → 外围依赖
    if (avg >= 30 && avg <= 60 && spread <= 30) {
      return '外围依赖';
    }

    return null;
  }
}
