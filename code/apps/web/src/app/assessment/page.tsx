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
      <div className="max-w-3xl mx-auto px-5 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold mb-4">选择测评场景</h1>
        <p className="text-[var(--color-text-secondary)]">
          暂无可用场景，请确认 API 服务已启动。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 pt-16 pb-16">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-2">选择你要判断的任务</h1>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          选择一个你日常使用 AI 的任务场景。系统会围绕这个任务的具体行为来判断你当前的使用状态。
        </p>
      </div>

      <div className="space-y-3">
        {data.items.map((scene) => (
          <div
            key={scene.id}
            className="block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
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
                      className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-[var(--color-border-light)] text-[var(--color-text-secondary)]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4 pt-3 border-t border-[var(--color-border-light)]">
              <Link
                href={`/assessment/${scene.slug}`}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-85 transition-opacity no-underline"
              >
                测评模式 →
              </Link>
              <Link
                href={`/assessment/${scene.slug}/converse`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-text-secondary)] transition-all no-underline"
              >
                对话模式 💬
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
