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

export default async function Home() {
  const data = await getScenes();
  const scenes = data?.items ?? [];

  return (
    <div>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-5 pt-20 pb-12 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-accent-border)] bg-[var(--color-accent-light)] text-xs font-medium text-[var(--color-accent)] mb-8">
          任务级 AI 使用边界判断
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5">
          你还在正确地
          <span className="text-[var(--color-accent)]">使用 AI</span>
          吗
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto mb-10">
          不是能力测试，不是技巧评分。<br />
          它只回答一个问题：<strong className="text-[var(--color-text)]">在当前任务上，AI 是在辅助你，还是在替代你。</strong>
        </p>

        {/* Two modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto stagger">
          <Link
            href="/assessment"
            className="card-premium group p-6 text-left no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
              📋
            </div>
            <h2 className="text-base font-semibold mb-2 text-[var(--color-text)]">
              测评模式
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
              选场景、快速作答，得到结构化的边界判断与行动建议。
            </p>
            <span className="text-sm font-medium text-[var(--color-accent)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              开始测评 →
            </span>
          </Link>

          <Link
            href="/converse"
            className="card-premium group p-6 text-left no-underline"
          >
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-light)] flex items-center justify-center text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
              💬
            </div>
            <h2 className="text-base font-semibold mb-2 text-[var(--color-text)]">
              对话模式
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
              AI 评估师多轮对话，深入了解使用习惯，给出个性化判断。
            </p>
            <span className="text-sm font-medium text-[var(--color-accent)] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              开始对话 →
            </span>
          </Link>
        </div>
      </section>

      {/* Scene preview */}
      {scenes.length > 0 && (
        <section className="max-w-3xl mx-auto px-5 pb-20 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-5 text-center">
            支持的任务类型
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
            {scenes.map((scene) => (
              <Link
                key={scene.id}
                href={`/assessment/${scene.slug}`}
                className="card-premium group p-5 no-underline flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold mb-1.5 text-[var(--color-text)]">
                    {scene.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3">
                    {scene.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scene.examples.slice(0, 3).map((ex) => (
                    <span
                      key={ex}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-border-light)] text-[var(--color-text-secondary)]"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom notice */}
      <section className="border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-5 py-8 text-center text-xs text-[var(--color-text-secondary)] space-y-1.5">
          <p>这不是人格测试，不是 AI 能力评级，也不教你怎么把 AI 用得更好。</p>
          <p>
            它只回答一件事：
            <strong className="text-[var(--color-text)]">
              在当前任务上，你现在还应不应该继续这样用 AI。
            </strong>
          </p>
        </div>
      </section>
    </div>
  );
}
