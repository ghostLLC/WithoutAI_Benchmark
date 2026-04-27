import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import type { ScenesResponse } from '@without-ai/shared';

async function getScenes() {
  try {
    return await fetchApi<ScenesResponse>('/assessment/scenes');
  } catch {
    return null;
  }
}

export default async function ConversePage() {
  const data = await getScenes();

  return (
    <div className="max-w-2xl mx-auto px-5 pt-16 pb-16">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-2">对话式评估</h1>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-lg">
          AI 评估师会围绕你选的任务场景，通过多轮自然对话了解你的使用习惯。回答越真实，判断越准确。对话结束后给出个性化评估结论和行动建议。
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-3 opacity-60">
          需要 AI Core 已启动并配置 LLM API Key。
        </p>
      </div>

      {!data || data.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)] mb-4">暂无可用场景，请确认 API 服务已启动。</p>
          <Link href="/assessment" className="text-sm text-[var(--color-primary)] no-underline hover:underline">
            切换为测评模式 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((scene) => (
            <Link
              key={scene.id}
              href={`/assessment/${scene.slug}/converse`}
              className="group flex items-center justify-between p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)] transition-all duration-200 no-underline"
            >
              <div>
                <h2 className="text-base font-semibold mb-1 text-[var(--color-text)]">{scene.name}</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">{scene.summary}</p>
              </div>
              <span className="text-[var(--color-text-secondary)] group-hover:translate-x-0.5 transition-transform text-lg shrink-0 ml-4">
                →
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/assessment" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors no-underline">
          ← 切换为测评模式
        </Link>
      </div>
    </div>
  );
}
