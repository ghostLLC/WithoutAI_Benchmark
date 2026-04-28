'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AssessmentResult, Dimension, DimensionProfile } from '@without-ai/shared';

const DIMENSION_LABELS: Record<Dimension, string> = {
  understanding: '基础理解',
  thinking: '自主思考',
  organization: '独立拆解',
  execution: '基础执行',
  judgment: '判断产出',
};

const LEVEL_CONFIG: Record<string, {
  label: string;
  title: string;
  subtitle: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  badgeBg: string;
  badgeText: string;
}> = {
  continue: {
    label: '可以继续使用',
    title: '你仍处于辅助使用区间',
    subtitle: 'AI 目前在你的任务中扮演辅助角色，关键过程仍由你掌握。继续保持当前边界，让 AI 停留在润色、补充、检查等外围环节。',
    textColor: 'var(--color-continue)',
    bgClass: 'banner-continue',
    borderClass: 'border-[var(--color-continue-border)]',
    badgeBg: 'var(--color-continue-bg)',
    badgeText: 'var(--color-continue)',
  },
  limit: {
    label: '建议限制使用',
    title: '你的使用方式正在从辅助滑向替代',
    subtitle: 'AI 已开始进入核心过程。部分关键能力虽在，但正在变薄。建议收回到润色和补充环节，重新拿回首次理解和首次组织的主动权。',
    textColor: 'var(--color-limit)',
    bgClass: 'banner-limit',
    borderClass: 'border-[var(--color-limit-border)]',
    badgeBg: 'var(--color-limit-bg)',
    badgeText: 'var(--color-limit)',
  },
  pause: {
    label: '建议暂停使用',
    title: 'AI 已越过当前应有的边界',
    subtitle: 'AI 已不只是辅助，而是接近完成前提。继续这样使用会进一步削弱你的独立完成能力。建议阶段性暂停，先独立完成最小可接受版本。',
    textColor: 'var(--color-pause)',
    bgClass: 'banner-pause',
    borderClass: 'border-[var(--color-pause-border)]',
    badgeBg: 'var(--color-pause-bg)',
    badgeText: 'var(--color-pause)',
  },
};

const PATTERN_LABELS: Record<string, string> = {
  '全面退化': '多个维度同时出现高风险，能力正在系统性减弱',
  '替代模式': '思考和拆解能力已被 AI 替代，但执行尚存',
  '启动依赖': '任务的起始环节对 AI 的依赖较为突出',
  '外围依赖': '各维度处于中等风险，AI 已渗透到多个环节',
  '健康辅助': '各维度均处于低风险区间，AI 仍是辅助角色',
};

const RULE_LABELS: Record<string, string> = {
  first_process_replaced: 'AI 已替代任务启动环节',
  dependency_signal_detected: '检测到对 AI 的持续依赖',
  cannot_finish_without_ai: '离开 AI 难以独立完成任务',
  core_step_fully_replaced: '核心步骤已被 AI 完全替代',
};

const DIMS: Dimension[] = ['understanding', 'thinking', 'organization', 'execution', 'judgment'];

function RiskGauge({ score }: { score: number }) {
  const angle = (score / 100) * 180;
  const rad = (angle - 90) * (Math.PI / 180);
  const r = 54;
  const cx = 70;
  const cy = 70;
  const nx = cx + r * Math.cos(rad);
  const ny = cy + r * Math.sin(rad);

  const color = score >= 70 ? 'var(--color-pause)' : score >= 35 ? 'var(--color-limit)' : 'var(--color-continue)';
  const trackColor = 'var(--color-border-light)';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 140 90" className="w-44">
        <path d="M 16 70 A 54 54 0 0 1 124 70" fill="none" stroke={trackColor} strokeWidth="8" strokeLinecap="round" />
        {score > 0 && (
          <path d={`M 16 70 A 54 54 0 ${angle > 90 ? '1' : '0'} 1 ${nx} ${ny}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />
        )}
        <text x="70" y="60" textAnchor="middle" className="text-2xl font-bold" fill="var(--color-text)">{score}</text>
        <text x="70" y="76" textAnchor="middle" className="text-[9px]" fill="var(--color-text-tertiary)">风险指数</text>
      </svg>
      <div className="flex justify-between w-44 text-[10px] text-[var(--color-text-tertiary)] -mt-3 px-2">
        <span>安全</span><span>警戒</span><span>危险</span>
      </div>
    </div>
  );
}

function DimBar({ dim, val }: { dim: Dimension; val: number }) {
  const label = DIMENSION_LABELS[dim];
  const barColor = val >= 70 ? 'var(--color-pause)' : val >= 40 ? 'var(--color-limit)' : 'var(--color-continue)';
  const barBg = val >= 70 ? 'var(--color-pause-bg)' : val >= 40 ? 'var(--color-limit-bg)' : 'var(--color-continue-bg)';

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-[var(--color-text)]">{label}</span>
        <span className="tabular-nums text-[var(--color-text-secondary)]">{val}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: barBg }}>
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${val}%`, background: barColor }} />
      </div>
    </div>
  );
}

export default function ResultPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('quizResult');
    if (!raw) { router.replace(`/assessment/${params.slug}`); return; }
    try { setResult(JSON.parse(raw)); } catch { router.replace(`/assessment/${params.slug}`); }
  }, [params.slug, router]);

  if (!result) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--color-text-secondary)]">加载结果中...</span>
        </div>
      </div>
    );
  }

  const config = LEVEL_CONFIG[result.finalLevel] ?? LEVEL_CONFIG.limit;
  const hasRisks = result.riskReasons.length > 0;
  const hasCapabilities = result.retainedCapabilities.length > 0;
  const hasRules = result.triggeredRules.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 pb-16 animate-fade-up">
      {/* Result Banner */}
      <div className={`rounded-2xl p-6 mb-8 ${config.bgClass}`}>
        <div className="flex items-center gap-2 mb-4">
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: config.badgeBg, color: config.badgeText }}
          >
            {config.label}
          </span>
          {result.aiEnhanced && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)]">
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
              AI 增强
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: config.textColor }}>
          {config.title}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {config.subtitle}
        </p>
      </div>

      {/* Score & Dimensions — only for quiz mode (quantitative) */}
      {result.baseRiskScore > 0 && (
        <section className="card-premium p-6 mb-6">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-5">
            评估概要
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <RiskGauge score={result.baseRiskScore} />

            <div className="flex-1 w-full space-y-3">
              {DIMS.map((dim) => (
                <DimBar key={dim} dim={dim} val={result.dimensions[dim]} />
              ))}
            </div>
          </div>

          {/* Dominant pattern + triggered rules */}
          <div className="mt-5 pt-4 border-t border-[var(--color-border-light)] space-y-2">
            {result.dominantPattern && (
              <div className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                <span className="shrink-0 text-[var(--color-accent)]">◆</span>
                <span>
                  检测模式：<strong className="text-[var(--color-text)]">{result.dominantPattern}</strong>
                  <span className="ml-1 text-[var(--color-text-tertiary)]">— {PATTERN_LABELS[result.dominantPattern] ?? ''}</span>
                </span>
              </div>
            )}
            {hasRules && (
              <div className="text-xs text-[var(--color-text-secondary)] flex items-start gap-2">
                <span className="shrink-0 text-[var(--color-accent)]">⚡</span>
                <span>
                  触发规则：
                  {result.triggeredRules.map((r, i) => (
                    <span key={r}>
                      {i > 0 && '、'}
                      <strong className="text-[var(--color-text)]">{RULE_LABELS[r] ?? r}</strong>
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Risk Reasons */}
      {hasRisks && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-0.5">
            主要风险来源
          </h2>
          <div className="space-y-2">
            {result.riskReasons.map((r, i) => (
              <div key={i} className="card-premium p-4 flex items-start gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-pause-bg)] flex items-center justify-center text-[11px] text-[var(--color-pause)] mt-px">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Retained Capabilities */}
      {hasCapabilities && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-0.5">
            你目前仍保有的能力
          </h2>
          <div className="space-y-2">
            {result.retainedCapabilities.map((c, i) => (
              <div key={i} className="card-premium p-4 flex items-start gap-3" style={{ borderColor: 'var(--color-continue-border)', background: 'var(--color-continue-bg)' }}>
                <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-continue)]/15 flex items-center justify-center text-xs text-[var(--color-continue)] mt-px">
                  ✓
                </span>
                <span className="text-sm leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Action Suggestions */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 px-0.5">
          下一步建议
        </h2>
        <div className="card-premium divide-y divide-[var(--color-border-light)] overflow-hidden">
          {result.actionSuggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <span className="shrink-0 w-6 h-6 rounded-lg bg-[var(--color-accent-light)] flex items-center justify-center text-xs font-semibold text-[var(--color-accent)]">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed pt-0.5">{s}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/assessment/${params.slug}`}
          className="flex-1 text-center py-3 text-sm rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent-border)] hover:text-[var(--color-accent)] transition-all no-underline"
        >
          重新测评
        </Link>
        <Link
          href="/assessment"
          className="flex-1 text-center py-3 text-sm rounded-xl bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors no-underline"
        >
          测评其他场景
        </Link>
      </div>
    </div>
  );
}
