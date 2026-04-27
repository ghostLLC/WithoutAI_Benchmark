import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'WithoutAI Benchmark',
  description: '判断在当前任务下，是否应该继续使用 AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="text-base font-semibold tracking-tight no-underline text-[var(--color-text)]">
              WithoutAI
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/assessment" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors no-underline">
                开始测评
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-secondary)]">
          <div className="max-w-4xl mx-auto px-5">
            WithoutAI Benchmark — 任务级 AI 使用边界判断工具
          </div>
        </footer>
      </body>
    </html>
  );
}
