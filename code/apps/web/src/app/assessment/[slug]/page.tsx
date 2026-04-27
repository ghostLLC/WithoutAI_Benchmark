'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { QuestionsResponse, SubmittedAnswer, AssessmentResult } from '@without-ai/shared';
import { postApi } from '@/lib/api';

const DEPTH_OPTIONS = [
  { value: 'quick', label: '快速', desc: '8 题 · 约 2 分钟', icon: '⚡' },
  { value: 'standard', label: '标准', desc: '20 题 · 约 4 分钟', icon: '📋' },
  { value: 'deep', label: '深度', desc: '45 题 · 约 10 分钟', icon: '🔍' },
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
      <div className="max-w-2xl mx-auto px-5 pt-16 pb-16">
        <h1 className="text-2xl font-bold tracking-tight mb-2">选择测评深度</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8">越深度的测评题目越多，结果越精确。</p>
        <div className="space-y-3">
          {DEPTH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDepth(opt.value)}
              className="w-full text-left p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)] transition-all duration-200 flex items-center gap-4"
            >
              <span className="text-3xl">{opt.icon}</span>
              <div>
                <div className="text-base font-semibold">{opt.label}</div>
                <div className="text-sm text-[var(--color-text-secondary)]">{opt.desc}</div>
              </div>
              <span className="ml-auto text-[var(--color-text-secondary)]">→</span>
            </button>
          ))}
        </div>
        <Link href="/assessment" className="inline-block mt-6 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-underline">
          ← 返回场景选择
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--color-border)] border-t-[var(--color-text)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-24 text-center">
        <p className="text-[var(--color-text-secondary)] mb-4">{error}</p>
        <Link href="/assessment" className="text-sm text-[var(--color-primary)] no-underline hover:underline">← 返回</Link>
      </div>
    );
  }

  if (!currentQ) return null;

  const isLast = currentIdx === total - 1;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-10 pb-16">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
            第 {currentIdx + 1} / {total} 题
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[var(--color-border-light)] text-[10px]">{currentQ.questionType === 'scenario' ? '情境' : currentQ.questionType === 'self_check' ? '自检' : '选择'}</span>
            {currentQ.category}
          </span>
        </div>
        <div className="h-1 bg-[var(--color-border-light)] rounded-full overflow-hidden">
          <div className="h-full bg-[var(--color-text)] rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold leading-relaxed mb-1">{currentQ.title}</h2>
        {currentQ.description && <p className="text-sm text-[var(--color-text-secondary)] mt-2">{currentQ.description}</p>}
      </div>

      <div className="space-y-2.5 mb-10">
        {currentQ.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 text-sm leading-relaxed
                ${isSelected ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)] text-[var(--color-text)]'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button onClick={() => setCurrentIdx((i) => i - 1)} disabled={currentIdx === 0}
          className="px-4 py-2.5 text-sm rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          ← 上一题
        </button>
        {isLast ? (
          <button onClick={handleSubmit} disabled={submitting || !selected}
            className="px-6 py-2.5 text-sm font-medium rounded-xl bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2">
            {submitting ? (<><span className="w-3.5 h-3.5 border-2 border-[var(--color-bg)]/30 border-t-[var(--color-bg)] rounded-full animate-spin" />分析中...</>) : '提交并查看结果'}
          </button>
        ) : (
          <button onClick={() => setCurrentIdx((i) => i + 1)} disabled={!selected}
            className="px-6 py-2.5 text-sm font-medium rounded-xl bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            下一题 →
          </button>
        )}
      </div>

      {submitError && (
        <div className="mt-4 p-3 rounded-xl bg-[var(--color-pause-bg)] border border-[var(--color-pause-border)] text-sm text-[var(--color-pause)]">{submitError}</div>
      )}
    </div>
  );
}
