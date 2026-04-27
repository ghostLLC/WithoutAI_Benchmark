'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { postApi } from '@/lib/api';
import type { Dimension } from '@without-ai/shared';
import { DIMENSION_LABELS } from '@without-ai/shared';

interface Message { role: 'ai' | 'user'; content: string }

const SCENE_META: Record<string, { name: string; capabilities: string[] }> = {
  'writing-report': { name: '写作与汇报', capabilities: ['基础理解能力', '自主思考能力', '独立拆解与组织能力'] },
  'learning-research': { name: '学习与资料整理', capabilities: ['基础理解能力', '自主思考能力'] },
  'basic-coding': { name: '基础编程', capabilities: ['独立拆解与组织能力', '基础操作与执行能力', '初步判断与产出能力'] },
  'basic-data': { name: '基础数据处理', capabilities: ['基础理解能力', '基础操作与执行能力', '初步判断与产出能力'] },
};

const ALL_DIMS: Dimension[] = ['understanding', 'thinking', 'organization', 'execution', 'judgment'];

function DimensionProgress({ covered }: { covered: string[] }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {ALL_DIMS.map((dim, i) => {
        const isCovered = covered.includes(dim);
        return (
          <div key={dim} className="flex items-center gap-1.5">
            {i > 0 && <div className={`w-3 h-px ${isCovered ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'}`} />}
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isCovered ? 'bg-[var(--color-primary)] scale-110' : 'bg-[var(--color-border-light)]'}`} />
            <span className={`text-[10px] ${isCovered ? 'text-[var(--color-primary)] font-medium' : 'text-[var(--color-text-secondary)]'}`}>
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
  const scene = SCENE_META[slug] ?? { name: slug, capabilities: [] };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [covered, setCovered] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async (text: string) => {
    const history: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await postApi('/assessment/converse', {
        sceneId: slug,
        sceneName: scene.name,
        focusCapabilities: scene.capabilities,
        history: history.map((m) => ({ role: m.role, content: m.content })),
      });

      if ((res as any).type === 'assessment') {
        setMessages((prev) => [...prev, { role: 'ai', content: (res as any).message }]);
        setCovered(ALL_DIMS); // assessment = all covered
        const result = {
          sceneId: slug,
          baseRiskScore: 0,
          triggeredRules: [] as string[],
          finalLevel: (res as any).finalLevel ?? 'limit',
          dimensions: { understanding: 0, thinking: 0, organization: 0, execution: 0, judgment: 0 },
          dominantPattern: null,
          riskReasons: (res as any).riskReasons ?? [],
          retainedCapabilities: (res as any).retainedCapabilities ?? [],
          actionSuggestions: (res as any).actionSuggestions ?? [],
        };
        sessionStorage.setItem('quizResult', JSON.stringify(result));
        setTimeout(() => router.push(`/assessment/${slug}/result`), 2000);
      } else {
        setMessages((prev) => [...prev, { role: 'ai', content: (res as any).message }]);
        if ((res as any).dimensions_covered) setCovered((res as any).dimensions_covered);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('AI Core')) {
        setError('对话模式需要 AI Core 服务支持。请先启动 AI Core 并配置 API Key，或使用测评模式。');
      } else {
        setError(e instanceof Error ? e.message : '发送失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setStarted(true);
    await sendMessage('你好，我想评估一下我在这个场景下的 AI 使用情况。');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input.trim());
  };

  if (!started) {
    return (
      <div className="max-w-2xl mx-auto px-5 pt-16 pb-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">对话式评估</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">{scene.name}</p>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto mb-8 leading-relaxed">
          AI 评估师会通过 5-7 轮对话了解你的使用习惯。对话覆盖五个能力维度后给出评估结论。
        </p>
        <button onClick={handleStart} className="px-6 py-3 bg-[var(--color-text)] text-[var(--color-bg)] rounded-xl text-sm font-medium hover:opacity-85 transition-opacity">
          开始对话
        </button>
        {error && <p className="mt-4 text-sm text-[var(--color-pause)]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-6 flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header with progress */}
      <div className="shrink-0 mb-2">
        <div className="flex items-center justify-between">
          <Link href={`/assessment/${slug}`} className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] no-underline">← 测评模式</Link>
          <span className="text-xs text-[var(--color-text-secondary)]">{scene.name}</span>
        </div>
        <DimensionProgress covered={covered} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[var(--color-text)] text-[var(--color-bg)] rounded-br-md' : 'bg-[var(--color-border-light)] text-[var(--color-text)] rounded-bl-md'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--color-border-light)] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--color-text-secondary)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        {error && (
          <div className="text-center">
            <div className="inline-block text-sm text-[var(--color-pause)] bg-[var(--color-pause-bg)] px-4 py-2 rounded-xl">
              {error}
              {error.includes('AI Core') && (
                <div className="mt-2">
                  <Link href={`/assessment/${slug}`} className="text-[var(--color-primary)] hover:underline text-xs">→ 切换到测评模式</Link>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-[var(--color-border)] shrink-0">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
          placeholder="输入你的回答..." className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-text-secondary)] transition-colors placeholder:text-[var(--color-text-secondary)]/50" />
        <button type="submit" disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-medium hover:opacity-85 disabled:opacity-30 transition-all shrink-0">发送</button>
      </form>
    </div>
  );
}
