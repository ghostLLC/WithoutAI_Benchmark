import Link from 'next/link';

const scenes = [
  { slug: 'writing-report', name: '写作与汇报', desc: '周报、课程小结、汇报提纲', color: 'from-blue-500/10 to-indigo-500/10' },
  { slug: 'learning-research', name: '学习与资料整理', desc: '读文章、整理资料、课程复习', color: 'from-emerald-500/10 to-teal-500/10' },
  { slug: 'basic-coding', name: '基础编程', desc: '改 bug、写小功能、读代码', color: 'from-amber-500/10 to-orange-500/10' },
  { slug: 'basic-data', name: '基础数据处理', desc: '表格清洗、简单统计、基础分析', color: 'from-violet-500/10 to-purple-500/10' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-5 pt-24 pb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">
          你还应该继续这样用 AI 吗
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto mb-10">
          这不是 AI 使用技巧测试，也不是能力评级。<br />
          它是一个<strong className="text-[var(--color-text)]">任务级判断工具</strong>：
          帮你识别在当前任务上，AI 是在辅助你，还是在替代你。
        </p>

        {/* Two modes */}
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <Link
            href="/assessment"
            className="group block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)] transition-all duration-200 no-underline"
          >
            <div className="text-2xl mb-2">📋</div>
            <h2 className="text-sm font-semibold mb-1 text-[var(--color-text)]">测评模式</h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              像 MBTI 一样，选场景、答 5 道标准化题目，快速得出结构化判断。
            </p>
            <span className="inline-block mt-3 text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">
              快速测评 →
            </span>
          </Link>

          <Link
            href="/converse"
            className="group block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-text-secondary)] transition-all duration-200 no-underline"
          >
            <div className="text-2xl mb-2">💬</div>
            <h2 className="text-sm font-semibold mb-1 text-[var(--color-text)]">对话模式</h2>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              与 AI 评估师多轮交流，深入理解你的真实使用习惯，获得个性化建议。
            </p>
            <span className="inline-block mt-3 text-xs text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)] transition-colors">
              开始对话 →
            </span>
          </Link>
        </div>
      </section>

      {/* Scene preview */}
      <section className="max-w-3xl mx-auto px-5 pb-20">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 text-center">
          支持的任务类型
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {scenes.map((s) => (
            <Link
              key={s.slug}
              href={`/assessment/${s.slug}`}
              className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-text-secondary)] transition-all duration-200 no-underline"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <h3 className="text-sm font-semibold mb-1 text-[var(--color-text)]">{s.name}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom notice */}
      <section className="border-t border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto px-5 py-8 text-center text-xs text-[var(--color-text-secondary)] space-y-1">
          <p>这不是人格测试，不是 AI 能力评级，也不教你怎么把 AI 用得更好。</p>
          <p>它只回答一件事：<strong className="text-[var(--color-text)]">在当前任务上，你现在还应不应该继续这样用 AI。</strong></p>
        </div>
      </section>
    </div>
  );
}
