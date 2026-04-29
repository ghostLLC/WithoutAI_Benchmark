import { Injectable } from '@nestjs/common';
import { ConfigRepository } from '../repositories/config.repository';
import type { SubmittedAnswer, DimensionProfile, Dimension, RiskPattern } from '@without-ai/shared';
import { DIMENSIONS } from '@without-ai/shared';

const SCENE_WEIGHTS: Record<string, Record<string, number>> = {
  'writing-report':  { understanding: 1.0, thinking: 1.5, organization: 1.5, execution: 0.7, judgment: 1.0 },
  'learning-research': { understanding: 1.5, thinking: 1.3, organization: 1.0, execution: 0.7, judgment: 1.0 },
  'basic-coding':     { understanding: 0.7, thinking: 1.0, organization: 1.3, execution: 1.5, judgment: 1.0 },
  'basic-data':       { understanding: 1.3, thinking: 0.7, organization: 1.0, execution: 1.0, judgment: 1.5 },
};

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
    completionAvgScore: number;
  }> {
    const questions = await this.configRepository.getQuestionsByScene(sceneId, depth);
    const profile: DimensionProfile = {
      understanding: 0, thinking: 0, organization: 0, execution: 0, judgment: 0,
    };

    let totalAnswered = 0;
    let completionTotal = 0;
    let completionCount = 0;

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

          // 收集"脱离AI可完成度"类题目用于兜底判断
          if (question.category === '脱离AI可完成度') {
            const riskScore = option.riskScore ?? Math.round(
              Object.values(dims).reduce((a, b) => a + b, 0) / DIMENSIONS.length,
            );
            completionTotal += riskScore;
            completionCount++;
          }
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

    // 场景感知加权：应用维度权重矩阵
    const weights = SCENE_WEIGHTS[sceneId] ?? {};
    const weightedSum = DIMENSIONS.reduce((sum, dim) => {
      const w = weights[dim] ?? 1.0;
      return sum + normProfile[dim] * w;
    }, 0);
    const weightSum = DIMENSIONS.reduce((sum, dim) => sum + (weights[dim] ?? 1.0), 0);

    const baseRiskScore = Math.round(weightedSum / weightSum);

    const completionAvgScore = completionCount > 0
      ? Math.round(completionTotal / completionCount)
      : 0;

    const dominantPattern = this.detectPattern(normProfile);

    return { baseRiskScore, dimensions: normProfile, dominantPattern, completionAvgScore };
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
