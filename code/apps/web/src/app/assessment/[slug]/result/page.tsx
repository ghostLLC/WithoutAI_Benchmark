'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { AssessmentResult, Dimension, DimensionProfile } from '@without-ai/shared';
import { DIMENSION_LABELS } from '@without-ai/shared';

const LEVEL_CONFIG: Record<string, { label: string; title: string; subtitle: string; textColor: string; bgColor: string; borderColor: string }> = {
  continue: { label: '可以继续使用', title: '你仍处于辅助使用区间', subtitle: 'AI 目前在你的任务中扮演的是辅助角色，关键过程仍由你掌握。', textColor: 'var(--color-continue)', bgColor: 'var(--color-continue-bg)', borderColor: 'var(--color-continue-border)' },
  limit: { label: '建议限制使用', title: '你的使用方式正在从辅助滑向替代', subtitle: 'AI 已经开始进入你任务中的核心过程。部分关键能力虽在，但正在变薄。', textColor: 'var(--color-limit)', bgColor: 'var(--color-limit-bg)', borderColor: 'var(--color-limit-border)' },
  pause: { label: '建议暂停使用', title: 'AI 已越过了当前应有的边界', subtitle: '在这类任务上，AI 已经不只是辅助，而是接近完成前提。继续这样使用会进一步削弱你的独立完成能力。', textColor: 'var(--color-pause)', bgColor: 'var(--color-pause-bg)', borderColor: 'var(--color-pause-border)' },
};

const PATTERN_LABELS: Record<string, string> = {
  '全面退化': '多个维度同时出现高风险，能力正在系统性减弱',
  '替代模式': '思考和拆解能力已被 AI 替代，但执行尚存',
  '启动依赖': '任务的起始环节对 AI 的依赖较为突出',
  '外围依赖': '各维度处于中等风险，AI 已渗透到多个环节',
  '健康辅助': '各维度均处于低风险区间，AI 仍是辅助角色',
};

const DIMS: Dimension[] = ['understanding', 'thinking', 'organization', 'execution', 'judgment'];

function RadarChart({ dimensions }: { dimensions: DimensionProfile }) {
  const size = 200; const cx = 100; const cy = 100; const r = 70;
  const angles = DIMS.map((_, i) => (Math.PI * 2 * i) / DIMS.length - Math.PI / 2);
  const points = DIMS.map((d, i) => {
    const val = Math.min(dimensions[d] / 100, 1) * r;
    return `${cx + Math.cos(angles[i]) * val},${cy + Math.sin(angles[i]) * val}`;
  });

  const levels = [0.25, 0.5, 0.75, 1].map((level) => {
    const pts = DIMS.map((_, i) => {
      const val = level * r;
      return `${cx + Math.cos(angles[i]) * val},${cy + Math.sin(angles[i]) * val}`;
    });
    return <polygon key={level} points={pts.join(' ')} fill="none" stroke="var(--color-border)" strokeWidth="0.5" />;
  });

  const gridLines = DIMS.map((_, i) => (
    <line key={`grid-${i}`} x1={cx} y1={cy} x2={cx + Math.cos(angles[i]) * r} y2={cy + Math.sin(angles[i]) * r} stroke="var(--color-border)" strokeWidth="0.5" />
  ));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px] mx-auto">
      {levels}
      {gridLines}
      <polygon points={points.join(' ')} fill="var(--color-primary)" fillOpacity="0.15" stroke="var(--color-primary)" strokeWidth="1.5" />
      {DIMS.map((d, i) => (
        <circle key={d} cx={cx + Math.cos(angles[i]) * (Math.min(dimensions[d] / 100, 1) * r)} cy={cy + Math.sin(angles[i]) * (Math.min(dimensions[d] / 100, 1) * r)} r="3" fill="var(--color-primary)" />
      ))}
    </svg>
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
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-text)] rounded-full animate-spin" /></div>;
  }

  const config = LEVEL_CONFIG[result.finalLevel] ?? LEVEL_CONFIG.limit;
  const hasRisks = result.riskReasons.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-16">
      {/* Banner */}
      <div className="rounded-2xl p-6 mb-8" style={{ background: config.bgColor, border: `1px solid ${config.borderColor}` }}>
        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3" style={{ background: config.borderColor, color: config.textColor }}>{config.label}</span>
        <h1 className="text-xl font-bold mb-2" style={{ color: config.textColor }}>{config.title}</h1>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{config.subtitle}</p>
      </div>

      {/* Dimension Profile */}
      <section className="mb-8 p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">五维能力画像</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-48 shrink-0"><RadarChart dimensions={result.dimensions} /></div>
          <div className="flex-1 w-full space-y-2">
            {DIMS.map((dim) => {
              const val = result.dimensions[dim];
              const label = DIMENSION_LABELS[dim];
              const barColor = val >= 70 ? 'var(--color-pause)' : val >= 40 ? 'var(--color-limit)' : 'var(--color-continue)';
              const barBg = val >= 70 ? 'var(--color-pause-bg)' : val >= 40 ? 'var(--color-limit-bg)' : 'var(--color-continue-bg)';
              return (
                <div key={dim}>
                  <div className="flex justify-between text-xs mb-0.5"><span>{label}</span><span className="tabular-nums">{val}</span></div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: barBg }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {result.dominantPattern && (
          <div className="mt-4 pt-3 border-t border-[var(--color-border-light)] text-xs text-[var(--color-text-secondary)]">
            检测模式：<strong className="text-[var(--color-text)]">{result.dominantPattern}</strong> — {PATTERN_LABELS[result.dominantPattern] ?? ''}
          </div>
        )}
      </section>

      {hasRisks && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">主要风险来源</h2>
          <div className="space-y-2">
            {result.riskReasons.map((r, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <span className="text-sm mt-px shrink-0">•</span><span className="text-sm leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.retainedCapabilities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">你目前仍保有的能力</h2>
          <div className="space-y-2">
            {result.retainedCapabilities.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--color-continue-border)] bg-[var(--color-continue-bg)]">
                <span className="text-sm mt-px shrink-0 text-[var(--color-continue)]">✓</span><span className="text-sm leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">下一步建议</h2>
        <div className="space-y-2">
          {result.actionSuggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] mt-px shrink-0 w-5">{i + 1}</span>
              <span className="text-sm leading-relaxed">{s}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={`/assessment/${params.slug}`} className="flex-1 text-center py-2.5 text-sm rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-text-secondary)] transition-all no-underline">重新测评</Link>
        <Link href="/assessment" className="flex-1 text-center py-2.5 text-sm rounded-xl bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-85 transition-opacity no-underline">测评其他场景</Link>
      </div>
    </div>
  );
}
