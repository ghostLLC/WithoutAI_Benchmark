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
    <div className="max-w-2xl mx-auto px-5 pt-16 pb-16 animate-fade-up">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-light)] flex items-center justify-center text-2xl mb-5">
          💬
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">对话式评估</h1>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-md">
          AI 评估师会围绕你选的任务场景，通过 5-7 轮自然对话了解你的使用习惯。
          回答越真实，判断越准确。对话结束后给出个性化评估结论和行动建议。
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-4">
          需要 AI Core 已启动并配置 LLM API Key
        </p>
      </div>

      {!data || data.items.length === 0 ? (
        <div className="card-premium p-8 text-center">
          <p className="text-[var(--color-text-secondary)] mb-4">暂无可用场景，请确认 API 服务已启动。</p>
          <Link href="/assessment" className="text-sm font-medium text-[var(--color-accent)] no-underline hover:underline">
            切换为测评模式 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {data.items.map((scene) => (
            <Link
              key={scene.id}
              href={`/assessment/${scene.slug}/converse`}
              className="card-premium group flex items-center justify-between p-5 no-underline"
            >
              <div className="min-w-0">
                <h2 className="text-base font-semibold mb-1 text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                  {scene.name}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] truncate">{scene.summary}</p>
                {scene.focusCapabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {scene.focusCapabilities.map((c) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent)] group-hover:translate-x-0.5 transition-all text-lg shrink-0 ml-4">
                →
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link href="/assessment" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors no-underline">
          ← 切换为测评模式
        </Link>
      </div>
    </div>
  );
}
