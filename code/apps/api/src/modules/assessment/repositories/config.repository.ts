import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { Scene, Question, FollowUpAction } from '@without-ai/shared';

@Injectable()
export class ConfigRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllEnabledScenes(): Promise<Scene[]> {
    const rows = await this.prisma.scene.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      summary: r.summary,
      examples: JSON.parse(r.examples),
      focusCapabilities: JSON.parse(r.focusCapabilities),
      enabled: r.enabled,
      sortOrder: r.sortOrder,
    }));
  }

  async getQuestionsByScene(sceneId: string, depth?: string): Promise<Question[]> {
    await this.ensureSceneExists(sceneId);

    const where: any = { sceneId, enabled: true };
    if (depth) {
      where.depthLevels = { contains: depth };
    }

    const rows = await this.prisma.question.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return rows.map((q) => ({
      id: q.id,
      sceneId: q.sceneId,
      type: q.type as Question['type'],
      questionType: (q.questionType as Question['questionType']) ?? 'behavioral',
      category: q.category,
      title: q.title,
      description: q.description ?? undefined,
      weight: q.weight,
      isHighWeight: q.isHighWeight,
      depthLevels: JSON.parse(q.depthLevels) as Question['depthLevels'],
      sortOrder: q.sortOrder,
      enabled: q.enabled,
      options: q.options.map((o) => ({
        id: o.id,
        label: o.label,
        riskLevel: (o.riskLevel as Question['options'][number]['riskLevel']) ?? undefined,
        riskScore: o.riskScore ?? undefined,
        dimensionScores: JSON.parse(o.dimensionScores) as Question['options'][number]['dimensionScores'],
        signals: JSON.parse(o.signals) as Question['options'][number]['signals'],
        triggerTags: JSON.parse(o.triggerTags) as Question['options'][number]['triggerTags'],
      })),
    }));
  }

  async getFollowUpByLevel(sceneId: string, level: string): Promise<FollowUpAction> {
    await this.ensureSceneExists(sceneId);

    const row = await this.prisma.followUp.findUnique({
      where: { sceneId_level: { sceneId, level } },
    });

    if (!row) {
      return {
        sceneId,
        level: level as FollowUpAction['level'],
        title: this.getFollowUpTitle(level),
        riskReasons: [],
        retainedCapabilities: [],
        actions: [],
      };
    }

    return {
      sceneId,
      level: level as FollowUpAction['level'],
      title: this.getFollowUpTitle(level),
      riskReasons: JSON.parse(row.riskReasons),
      retainedCapabilities: JSON.parse(row.retainedCapabilities),
      actions: JSON.parse(row.actionSuggestions),
    };
  }

  private async ensureSceneExists(sceneId: string): Promise<void> {
    const scene = await this.prisma.scene.findUnique({ where: { id: sceneId } });
    if (!scene) {
      throw new NotFoundException(`场景不存在: ${sceneId}`);
    }
  }

  private getFollowUpTitle(level: string): string {
    const titles: Record<string, string> = {
      continue: '你可以继续使用 AI，但请保持自觉',
      limit: '你现在更适合限制 AI 介入范围',
      pause: '建议暂停 AI 介入，先恢复独立完成能力',
    };
    return titles[level] ?? '';
  }
}
