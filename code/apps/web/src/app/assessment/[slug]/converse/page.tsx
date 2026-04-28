'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { postApi, fetchApi } from '@/lib/api';
import type { Dimension, ScenesResponse } from '@without-ai/shared';

const DIMENSION_LABELS: Record<string, string> = {
  understanding: '基础理解',
  thinking: '自主思考',
  organization: '独立拆解',
  execution: '基础执行',
  judgment: '判断产出',
};

interface Message { role: 'ai' | 'user'; content: string }

const ALL_DIMS: Dimension[] = ['understanding', 'thinking', 'organization', 'execution', 'judgment'];

function DimensionProgress({ covered }: { covered: string[] }) {
  return (
    <div className="flex items-center gap-3 px-1 py-2">
      {ALL_DIMS.map((dim) => {
        const isCovered = covered.includes(dim);
        return (
          <div key={dim} className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                isCovered ? 'bg-[var(--color-accent)] scale-125 shadow-[0_0_6px_var(--color-accent)]' : 'bg-[var(--color-border)]'
              }`}
            />
            <span className={`text-[10px] transition-colors ${isCovered ? 'text-[var(--color-accent)] font-medium' : 'text-[var(--color-text-tertiary)]'}`}>
              {DIMENSION_LABELS[dim]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ConversePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [sceneMeta, setSceneMeta] = useState<{ name: string; capabilities: string[] } | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [covered, setCovered] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch scene metadata from API
  useEffect(() => {
    fetchApi<ScenesResponse>('/assessment/scenes')
      .then((data) => {
        const scene = data.items.find((s) => s.slug === slug || s.id === slug);
        if (scene) {
          setSceneMeta({
            name: scene.name,
            capabilities: scene.focusCapabilities,
          });
        } else {
          setSceneMeta({ name: slug, capabilities: [] });
        }
      })
      .catch(() => setSceneMeta({ name: slug, capabilities: [] }))
      .finally(() => setMetaLoading(false));
  }, [slug]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!sceneMeta) return;
    const history: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await postApi('/assessment/converse', {
        sceneId: slug,
        sceneName: sceneMeta.name,
        focusCapabilities: sceneMeta.capabilities,
        history: history.map((m) => ({ role: m.role, content: m.content })),
      });

      if ((res as any).type === 'assessment') {
        setMessages((prev) => [...prev, { role: 'ai', content: (res as any).message }]);
        setCovered(ALL_DIMS);
        const raw = res as any;
        const dims = raw.dimensions ?? {};
        const result = {
          sceneId: slug,
          baseRiskScore: raw.baseRiskScore ?? 0,
          triggeredRules: [] as string[],
          finalLevel: raw.finalLevel ?? 'limit',
          dimensions: {
            understanding: dims.understanding ?? 0,
            thinking: dims.thinking ?? 0,
            organization: dims.organization ?? 0,
            execution: dims.execution ?? 0,
            judgment: dims.judgment ?? 0,
          } as Record<Dimension, number>,
          dominantPattern: raw.dominantPattern ?? null,
          riskReasons: raw.riskReasons ?? [],
          retainedCapabilities: raw.retainedCapabilities ?? [],
          actionSuggestions: raw.actionSuggestions ?? [],
          aiEnhanced: true,
        };
        sessionStorage.setItem('quizResult', JSON.stringify(result));
        setTimeout(() => router.push(`/assessment/${slug}/result`), 2500);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: (res as any).message }]);
        if ((res as any).dimensions_covered) setCovered((res as any).dimensions_covered);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('AI Core')) {
        setError('对话模式需要 AI Core 服务支持。请先启动 AI Core 并配置 API Key，或使用测评模式。');
      } else {
        setError(e instanceof Error ? e.message : '发送失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  }, [messages, sceneMeta, slug, router]);

  const handleStart = async () => {
    setStarted(true);
    await sendMessage('你好，我想评估一下我在这个场景下的 AI 使用情况。');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  if (metaLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-xl mx-auto px-5 pt-16 pb-16 text-center animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-light)] flex items-center justify-center text-2xl mx-auto mb-6">
          💬
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">对话式评估</h1>
        <p className="text-base font-medium text-[var(--color-accent)] mb-1">{sceneMeta?.name}</p>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto mb-8 leading-relaxed">
          AI 评估师将通过 5-7 轮自然对话，了解你的真实使用习惯。对话覆盖五个能力维度后，给出个性化评估结论。
        </p>
        <button
          onClick={handleStart}
          className="px-8 py-3.5 bg-[var(--color-accent)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer"
        >
          开始对话
        </button>
        <div className="mt-6">
          <Link href={`/assessment/${slug}`} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors no-underline">
            ← 切换为测评模式
          </Link>
        </div>
        {error && (
          <div className="mt-6 p-4 rounded-xl border border-[var(--color-pause-border)] bg-[var(--color-pause-bg)] text-sm text-[var(--color-pause)] max-w-sm mx-auto">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="shrink-0 mb-3 pb-3 border-b border-[var(--color-border-light)]">
        <div className="flex items-center justify-between mb-2">
          <Link href={`/assessment/${slug}`} className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-underline transition-colors">
            ← 测评模式
          </Link>
          <span className="text-xs font-medium text-[var(--color-accent)]">{sceneMeta?.name}</span>
        </div>
        <DimensionProgress covered={covered} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-up`}>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--color-accent)] text-white rounded-br-sm'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="text-center animate-fade-in">
            <div className="inline-block text-sm text-[var(--color-pause)] bg-[var(--color-pause-bg)] border border-[var(--color-pause-border)] px-4 py-3 rounded-xl max-w-sm">
              <p>{error}</p>
              {error.includes('AI Core') && (
                <Link href={`/assessment/${slug}`} className="inline-block mt-2 text-[var(--color-accent)] hover:underline text-xs font-medium">
                  → 切换到测评模式
                </Link>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-[var(--color-border)] shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="输入你的回答..."
          className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]/20 transition-colors placeholder:text-[var(--color-text-tertiary)]"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
        >
          发送
        </button>
      </form>
    </div>
  );
}
