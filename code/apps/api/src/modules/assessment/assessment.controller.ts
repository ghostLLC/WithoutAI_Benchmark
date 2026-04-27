import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { SubmitAssessmentDto, ConverseDto } from './dto';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'api', timestamp: new Date().toISOString() };
  }
}

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get('scenes')
  getScenes() {
    return this.assessmentService.getScenes();
  }

  @Get('scenes/:sceneId/questions')
  getQuestions(@Param('sceneId') sceneId: string, @Query('depth') depth?: string) {
    return this.assessmentService.getQuestions(sceneId, depth);
  }

  @Post('submit')
  submit(@Body() body: SubmitAssessmentDto) {
    return this.assessmentService.submitAssessment({
      sceneId: body.sceneId,
      depth: (body.depth ?? 'quick') as any,
      answers: body.answers,
    });
  }

  @Post('converse')
  converse(@Body() body: ConverseDto) {
    return this.assessmentService.converse(body);
  }

  @Get('follow-up/:level')
  getFollowUp(@Param('level') level: string, @Query('sceneId') sceneId: string) {
    return this.assessmentService.getFollowUp(sceneId, level);
  }
}
