import { fetchApi } from '@/lib/api';
import type { ScenesResponse } from '@without-ai/shared';
import Link from 'next/link';

async function getScenes() {
  try {
    return await fetchApi<ScenesResponse>('/assessment/scenes');
  } catch {
    return null;
  }
}

export default async function AssessmentPage() {
  const data = await getScenes();

  if (!data || data.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 pt-24 pb-16 text-center animate-fade-up">
        <h1 className="text-2xl font-bold mb-3">选择测评场景</h1>
        <p className="text-[var(--color-text-secondary)]">
          暂无可用场景，请确认 API 服务已启动。
        </p>
        <Link href="/" className="inline-block mt-4 text-sm text-[var(--color-accent)] no-underline hover:underline">
          ← 返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-16 pb-16 animate-fade-up">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-3">选择你要判断的任务</h1>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-md">
          选择一个你日常使用 AI 的任务场景。系统会围绕该任务的具体行为来判断你当前的 AI 使用边界。
        </p>
      </div>

      <div className="space-y-3 stagger">
        {data.items.map((scene) => (
          <div key={scene.id} className="card-premium p-5 group">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold mb-1.5 text-[var(--color-text)]">
                  {scene.name}
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                  {scene.summary}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {scene.examples.map((ex) => (
                    <span
                      key={ex}
                      className="inline-block text-[11px] px-2.5 py-0.5 rounded-md bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
                {scene.focusCapabilities.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                    <span>重点能力：</span>
                    {scene.focusCapabilities.map((c) => (
                      <span key={c} className="text-[11px]">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-3 border-t border-[var(--color-border-light)]">
              <Link
                href={`/assessment/${scene.slug}`}
                className="text-xs font-medium px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors no-underline"
              >
                测评模式 →
              </Link>
              <Link
                href={`/assessment/${scene.slug}/converse`}
                className="text-xs px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-accent-border)] transition-all no-underline"
              >
                对话模式
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors no-underline">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
