'use client';

import { useState, useCallback } from 'react';
import { SegmentWithVideos, ScriptSegment, PexelsVideo } from '@/types';
import ScriptPanel from '@/components/ScriptPanel/ScriptPanel';
import SegmentBlock from '@/components/SegmentBlock/SegmentBlock';
import styles from './page.module.css';

export default function Home() {
  const [segments, setSegments] = useState<SegmentWithVideos[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'results'>('input');

  // ── 1. AI 分析口稿 ──────────────────────────────────────────────
  const handleAnalyze = useCallback(async (script: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const initialSegments: SegmentWithVideos[] = (data.segments as ScriptSegment[]).map(seg => ({
        segment: seg,
        videos: [],
        selectedVideoId: null,
        isLoading: true,
      }));

      setSegments(initialSegments);
      setStep('results');

      // 并发搜索所有片段的视频
      await Promise.allSettled(
        data.segments.map((seg: ScriptSegment) => fetchVideosForSegment(seg.id, seg.keyword))
      );
    } catch (err: any) {
      setError(err.message || '分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // ── 2. 搜索片段视频 ──────────────────────────────────────────────
  const fetchVideosForSegment = useCallback(async (segmentId: string, keyword: string) => {
    setSegments(prev =>
      prev.map(item =>
        item.segment.id === segmentId ? { ...item, isLoading: true } : item
      )
    );

    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSegments(prev =>
        prev.map(item =>
          item.segment.id === segmentId
            ? {
                ...item,
                videos: data.videos,
                selectedVideoId: data.videos[0]?.id ?? null,
                isLoading: false,
              }
            : item
        )
      );
    } catch {
      setSegments(prev =>
        prev.map(item =>
          item.segment.id === segmentId ? { ...item, videos: [], isLoading: false } : item
        )
      );
    }
  }, []);

  // ── 3. 选择视频 ──────────────────────────────────────────────────
  const handleSelectVideo = useCallback((segmentId: string, video: PexelsVideo) => {
    setSegments(prev =>
      prev.map(item =>
        item.segment.id === segmentId ? { ...item, selectedVideoId: video.id } : item
      )
    );
  }, []);

  // ── 4. 下载视频（单个）──────────────────────────────────────────
  const handleDownload = useCallback(async (video: PexelsVideo, segmentId: string) => {
    const videoFile = video.video_files
      .filter(f => f.file_type === 'video/mp4')
      .sort((a, b) => Math.abs(a.width - 1280) - Math.abs(b.width - 1280))[0];
    if (!videoFile) return;

    setDownloadingId(segmentId);
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoFile.link,
          filename: `sciclip_${segmentId}_${video.id}.mp4`,
        }),
      });
      if (!res.ok) throw new Error('下载失败');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sciclip_${segmentId}_${video.id}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  // ── 5. 一键下载全部已选视频 ─────────────────────────────────────
  const handleDownloadAll = useCallback(async () => {
    const toDownload = segments.filter(item => item.selectedVideoId !== null);
    for (const item of toDownload) {
      const video = item.videos.find(v => v.id === item.selectedVideoId);
      if (video) {
        await handleDownload(video, item.segment.id);
        await new Promise(r => setTimeout(r, 500)); // 间隔避免触发限速
      }
    }
  }, [segments, handleDownload]);

  const selectedCount = segments.filter(s => s.selectedVideoId !== null).length;
  const totalCount = segments.length;

  return (
    <div className={styles.page}>
      {/* Background */}
      <div className={styles.bgGlow} aria-hidden />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>🎬</div>
          <div>
            <h1 className={styles.logoTitle}>
              <span className="gradient-text">SciClip Studio</span>
            </h1>
            <p className={styles.logoSub}>科影工坊 · AI 驱动的科普视频素材助手</p>
          </div>
        </div>

        {step === 'results' && (
          <div className={styles.headerActions}>
            <div className={styles.progress}>
              <span className="badge badge-purple">{selectedCount}/{totalCount} 已选</span>
              {segments.some(s => s.isLoading) && (
                <span className={styles.loadingHint}>
                  <span className="spinner spinner-sm" />
                  搜索中...
                </span>
              )}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setStep('input'); setSegments([]); setError(null); }}
            >
              ← 重新输入
            </button>
            <button
              className="btn btn-primary"
              onClick={handleDownloadAll}
              disabled={selectedCount === 0 || downloadingId !== null}
              id="download-all-btn"
            >
              {downloadingId ? <span className="spinner spinner-sm" /> : '⬇️'}
              一键下载 ({selectedCount})
            </button>
          </div>
        )}
      </header>

      {/* Error toast */}
      {error && (
        <div className={styles.errorToast} onClick={() => setError(null)}>
          ⚠️ {error} <span className={styles.errorClose}>✕</span>
        </div>
      )}

      {/* Main content */}
      <main className={styles.main}>
        {step === 'input' ? (
          <div className={styles.inputLayout}>
            <div className={styles.inputLeft}>
              <ScriptPanel onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            </div>
            <div className={styles.inputRight}>
              <FeatureCards />
            </div>
          </div>
        ) : (
          <div className={styles.resultsLayout}>
            <div className={styles.segmentList}>
              {segments.map((item, index) => (
                <SegmentBlock
                  key={item.segment.id}
                  item={item}
                  index={index}
                  onSelectVideo={handleSelectVideo}
                  onRefreshVideos={fetchVideosForSegment}
                  onDownload={handleDownload}
                  isDownloading={downloadingId === item.segment.id}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Powered by</span>
        <span className="badge badge-blue">Google Gemini</span>
        <span className={styles.footerDot}>·</span>
        <span className="badge badge-purple">Pexels API</span>
        <span className={styles.footerDot}>·</span>
        <span className={styles.footerText}>视频素材仅供学习使用，请遵守 Pexels 授权协议</span>
      </footer>
    </div>
  );
}

// 功能介绍卡片（右侧说明区域）
function FeatureCards() {
  const features = [
    {
      icon: '✍️',
      title: 'AI 智能分段',
      desc: '基于 Gemini 将长口稿拆分为最优视觉片段，保持语义连贯性',
      color: 'var(--accent-blue)',
    },
    {
      icon: '🔍',
      title: '自动关键词提取',
      desc: '为每个片段生成精准英文搜索词，匹配最相关的视觉素材',
      color: 'var(--accent-purple)',
    },
    {
      icon: '🎬',
      title: 'Pexels 高质量素材',
      desc: '海量免费 4K/HD B-Roll 素材，悬停即可预览，点击选定',
      color: 'var(--accent-cyan)',
    },
    {
      icon: '⬇️',
      title: '一键批量下载',
      desc: '选好素材后一键打包下载，导入剪辑软件直接使用',
      color: 'var(--accent-green)',
    },
  ];

  return (
    <div className={styles.featureCards}>
      <div className={styles.featureHeader}>
        <h2 className={styles.featureTitle}>快速上手</h2>
        <p className={styles.featureSubtitle}>三步完成科普视频素材匹配</p>
        <div className={styles.steps}>
          {['粘贴口稿', 'AI 分析', '选择&下载'].map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{i + 1}</div>
              <span>{s}</span>
              {i < 2 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.featureGrid}>
        {features.map((f, i) => (
          <div key={i} className={`${styles.featureCard} glass-card`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={styles.featureIcon} style={{ color: f.color }}>{f.icon}</div>
            <div>
              <h3 className={styles.featureCardTitle}>{f.title}</h3>
              <p className={styles.featureCardDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.apiHint}>
        <span className={styles.apiHintIcon}>🔑</span>
        <div>
          <p className={styles.apiHintTitle}>需要配置 API Key</p>
          <p className={styles.apiHintDesc}>
            请在 <code>.env.local</code> 中填入 Gemini 和 Pexels API Key
          </p>
        </div>
      </div>
    </div>
  );
}
