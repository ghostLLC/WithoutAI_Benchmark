'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { QuestionsResponse, SubmittedAnswer, AssessmentResult } from '@without-ai/shared';
import { postApi } from '@/lib/api';

const DEPTH_OPTIONS = [
  { value: 'quick', label: '快速测评', desc: '聚焦核心风险信号，快速给出判断', icon: '⚡' },
  { value: 'standard', label: '标准测评', desc: '覆盖全部五个能力维度，判断更全面', icon: '📋' },
  { value: 'deep', label: '深度测评', desc: '增加情境题与自检题，精细定位边界', icon: '🔍' },
] as const;

export default function QuizPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [depth, setDepth] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionsResponse['items']>([]);
  const [sceneId, setSceneId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const loadQuestions = useCallback(async (d: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'}/assessment/scenes/${slug}/questions?depth=${d}`);
      if (!res.ok) throw new Error('加载失败');
      const data: QuestionsResponse = await res.json();
      if (data.items.length === 0) { setError('该场景暂无此深度的题目'); return; }
      setSceneId(data.sceneId);
      setQuestions(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载题目失败');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (depth) loadQuestions(depth);
  }, [depth, loadQuestions]);

  const currentQ = questions[currentIdx];
  const total = questions.length;
  const selected = currentQ ? answers[currentQ.id] : null;
  const progressPct = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;

  const handleSelect = (optionId: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionId }));
    setSubmitError(null);
  };

  const handleNext = () => {
    if (!selected) return;
    if (currentIdx < total - 1) {
      setExiting(true);
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
        setExiting(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setExiting(true);
      setTimeout(() => {
        setCurrentIdx((i) => i - 1);
        setExiting(false);
      }, 150);
    }
  };

  const handleSubmit = async () => {
    const payload: SubmittedAnswer[] = questions.map((q) => ({
      questionId: q.id,
      optionId: answers[q.id] ?? '',
    }));
    const unanswered = payload.find((a) => !a.optionId);
    if (unanswered) {
      const q = questions.find((q) => q.id === unanswered.questionId);
      setCurrentIdx(questions.indexOf(q!));
      setSubmitError('请先回答当前题目');
      setTimeout(() => setSubmitError(null), 2500);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result: AssessmentResult = await postApi('/assessment/submit', {
        sceneId,
        depth: depth ?? 'quick',
        answers: payload,
      });
      sessionStorage.setItem('quizResult', JSON.stringify(result));
      router.push(`/assessment/${slug}/result`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '提交失败，请重试');
      setSubmitting(false);
    }
  };

  // Depth selection screen
  if (!depth) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-16 pb-16 animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight mb-2">选择测评深度</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">深度越高，覆盖维度越全面，判断越精准。</p>
        <div className="space-y-3">
          {DEPTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDepth(opt.value)}
              className="w-full text-left card-premium p-5 flex items-center gap-5 group cursor-pointer"
            >
              <span className="text-3xl shrink-0">{opt.icon}</span>
              <div className="flex-1">
                <div className="text-base font-semibold text-[var(--color-text)]">{opt.label}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">{opt.desc}</div>
              </div>
              <span className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all">→</span>
            </button>
          ))}
        </div>
        <Link href="/assessment" className="inline-block mt-6 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-underline transition-colors">
          ← 返回场景选择
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
          <span className="text-sm text-[var(--color-text-secondary)]">加载题目中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-24 text-center animate-fade-up">
        <div className="card-premium p-8 inline-block">
          <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
          <button onClick={() => loadQuestions(depth!)} className="text-sm font-medium text-[var(--color-accent)] hover:underline mr-4">重试</button>
          <Link href="/assessment" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-underline">← 返回</Link>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  const isLast = currentIdx === total - 1;
  const typeLabel = currentQ.questionType === 'scenario' ? '情境题' : currentQ.questionType === 'self_check' ? '自检题' : '选择题';

  return (
    <div className="max-w-xl mx-auto px-5 pt-8 pb-16">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            第 {currentIdx + 1} / {total} 题
          </span>
          <span className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <span className="px-1.5 py-0.5 rounded-md bg-[var(--color-accent-light)] text-[var(--color-accent)] text-[10px] font-medium">
              {typeLabel}
            </span>
            {currentQ.category}
          </span>
        </div>
        <div className="h-1 bg-[var(--color-border-light)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%`, background: 'var(--color-accent)' }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className={`transition-all duration-150 ${exiting ? 'opacity-0 translate-y-2' : 'opacity-100'}`}>
        <div className="mb-8">
          <h2 className="text-xl font-semibold leading-relaxed mb-2">{currentQ.title}</h2>
          {currentQ.description && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{currentQ.description}</p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2.5 mb-10">
          {currentQ.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 text-sm leading-relaxed cursor-pointer
                  ${isSelected
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-text)] ring-1 ring-[var(--color-accent)]/20'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent-border)] hover:shadow-sm text-[var(--color-text)]'
                  }`}
              >
                <span className="flex items-start gap-3">
                  <span className={`shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center transition-all ${isSelected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'}`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </span>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="px-5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-accent-border)] disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            ← 上一题
          </button>
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !selected}
              className="px-6 py-2.5 text-sm font-medium rounded-xl text-white cursor-pointer transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: selected ? 'var(--color-accent)' : 'var(--color-border)', backgroundAttachment: 'fixed' }}
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  分析中...
                </>
              ) : (
                '提交并查看结果'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!selected}
              className="px-6 py-2.5 text-sm font-medium rounded-xl text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: selected ? 'var(--color-accent)' : 'var(--color-border)', backgroundAttachment: 'fixed' }}
            >
              下一题 →
            </button>
          )}
        </div>

        {submitError && (
          <div className="mt-4 p-3 rounded-xl border border-[var(--color-pause-border)] bg-[var(--color-pause-bg)] text-sm text-[var(--color-pause)] animate-fade-in">
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
}
