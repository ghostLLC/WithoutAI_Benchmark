import { Module } from '@nestjs/common';
import { AssessmentController, HealthController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { RiskScoreCalculator } from './services/risk-score-calculator';
import { TriggerRuleEngine } from './services/trigger-rule-engine';
import { ResultLevelDecider } from './services/result-level-decider';
import { ResultBuilder } from './services/result-builder';
import { AiCoreService } from './services/ai-core.service';
import { ConfigRepository } from './repositories/config.repository';

@Module({
  controllers: [HealthController, AssessmentController],
  providers: [
    AssessmentService,
    RiskScoreCalculator,
    TriggerRuleEngine,
    ResultLevelDecider,
    ResultBuilder,
    AiCoreService,
    ConfigRepository,
  ],
})
export class AssessmentModule {}
