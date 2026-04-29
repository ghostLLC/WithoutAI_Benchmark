import { Injectable } from '@nestjs/common';
import type { SubmittedAnswer, AssessmentLevel } from '@without-ai/shared';

interface CheckPair {
  label: string;
  questionIds: [string, string];
}

const CROSS_VALIDATION_PAIRS: Record<string, CheckPair[]> = {
  'writing-report': [
    { label: '起始方式一致性', questionIds: ['wr_q01', 'wr_q43'] },
    { label: '写作自主性', questionIds: ['wr_q05', 'wr_q08'] },
  ],
  'learning-research': [
    { label: '阅读习惯一致性', questionIds: ['lr_q01', 'lr_q30'] },
    { label: '学习自主性', questionIds: ['lr_q05', 'lr_q08'] },
  ],
  'basic-coding': [
    { label: '编码自主性', questionIds: ['bc_q01', 'bc_q16'] },
    { label: '独立编码能力自检', questionIds: ['bc_q02', 'bc_q10'] },
  ],
  'basic-data': [
    { label: '数据自主性', questionIds: ['bd_q01', 'bd_q15'] },
    { label: '手动数据处理自检', questionIds: ['bd_q02', 'bd_q16'] },
  ],
};

@Injectable()
export class ConsistencyChecker {
  check(
    sceneId: string,
    answers: SubmittedAnswer[],
  ): { passed: boolean; inconsistencies: string[]; suggestionLevel: AssessmentLevel | null } {
    const pairs = CROSS_VALIDATION_PAIRS[sceneId] ?? [];
    const inconsistencies: string[] = [];

    for (const pair of pairs) {
      const a1 = answers.find((a) => a.questionId === pair.questionIds[0]);
      const a2 = answers.find((a) => a.questionId === pair.questionIds[1]);
      if (!a1 || !a2) continue;

      const r1 = a1.optionId.slice(-1).charCodeAt(0) - 'a'.charCodeAt(0);
      const r2 = a2.optionId.slice(-1).charCodeAt(0) - 'a'.charCodeAt(0);

      if (Math.abs(r1 - r2) >= 2) {
        inconsistencies.push(pair.label);
      }
    }

    const passed = inconsistencies.length === 0;
    const suggestionLevel: AssessmentLevel | null = inconsistencies.length > 0 ? 'limit' : null;

    return { passed, inconsistencies, suggestionLevel };
  }
}
