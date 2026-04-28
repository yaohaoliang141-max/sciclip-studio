import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SciClip Studio · 科影工坊',
  description: '输入科普口稿，AI 智能拆分片段，自动匹配高质量视频素材',
  keywords: ['科普视频', '视频素材', 'AI剪辑', 'Pexels', 'B-Roll'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
