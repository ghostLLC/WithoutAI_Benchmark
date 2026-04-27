import { Injectable } from '@nestjs/common';
import { ConfigRepository } from '../repositories/config.repository';
import type { SubmittedAnswer } from '@without-ai/shared';

@Injectable()
export class TriggerRuleEngine {
  constructor(private readonly configRepository: ConfigRepository) {}

  async detect(sceneId: string, depth: string, answers: SubmittedAnswer[]): Promise<string[]> {
    const questions = await this.configRepository.getQuestionsByScene(sceneId, depth);
    const triggered = new Set<string>();

    for (const question of questions) {
      for (const answer of answers) {
        if (answer.questionId !== question.id) continue;

        for (const option of question.options) {
          if (option.id !== answer.optionId) continue;

          for (const tag of option.triggerTags ?? []) {
            triggered.add(tag);
          }
        }
      }
    }

    return Array.from(triggered);
  }
}
