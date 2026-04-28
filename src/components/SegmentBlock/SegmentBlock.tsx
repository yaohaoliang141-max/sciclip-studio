'use client';

import { useState } from 'react';
import { SegmentWithVideos, PexelsVideo } from '@/types';
import VideoCard from '@/components/VideoCard/VideoCard';
import styles from './SegmentBlock.module.css';

interface Props {
  item: SegmentWithVideos;
  index: number;
  onSelectVideo: (segmentId: string, video: PexelsVideo) => void;
  onRefreshVideos: (segmentId: string, keyword: string) => void;
  onDownload: (video: PexelsVideo, segmentId: string) => void;
  isDownloading: boolean;
}

export default function SegmentBlock({
  item, index, onSelectVideo, onRefreshVideos, onDownload, isDownloading
}: Props) {
  const [customKeyword, setCustomKeyword] = useState(item.segment.keyword);
  const [isEditingKeyword, setIsEditingKeyword] = useState(false);

  const { segment, videos, selectedVideoId, isLoading } = item;
  const selectedVideo = videos.find(v => v.id === selectedVideoId);

  const handleSearch = () => {
    onRefreshVideos(segment.id, customKeyword);
    setIsEditingKeyword(false);
  };

  return (
    <div className={`${styles.block} glass-card fade-in`} style={{ animationDelay: `${index * 0.08}s` }}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.indexBadge}>
          <span>{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className={styles.headerContent}>
          <p className={styles.segmentText}>{segment.text}</p>
          <div className={styles.keywordRow}>
            {isEditingKeyword ? (
              <div className={styles.keywordEdit}>
                <input
                  className={`input ${styles.keywordInput}`}
                  value={customKeyword}
                  onChange={e => setCustomKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  autoFocus
                />
                <button className="btn btn-primary btn-sm" onClick={handleSearch}>搜索</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingKeyword(false)}>取消</button>
              </div>
            ) : (
              <div className={styles.keywordDisplay}>
                <span className="badge badge-blue">🔍 {customKeyword}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsEditingKeyword(true)}
                  title="修改搜索词"
                >
                  ✏️ 改关键词
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onRefreshVideos(segment.id, customKeyword)}
                  disabled={isLoading}
                  title="换一批素材"
                >
                  {isLoading ? <span className="spinner spinner-sm" /> : '🔄'} 换一批
                </button>
              </div>
            )}
          </div>
        </div>
        {selectedVideo && (
          <button
            className={`btn btn-primary btn-sm ${styles.downloadBtn}`}
            onClick={() => onDownload(selectedVideo, segment.id)}
            disabled={isDownloading}
            id={`download-${segment.id}`}
          >
            {isDownloading ? <span className="spinner spinner-sm" /> : '⬇️'}
            下载
          </button>
        )}
      </div>

      {/* Video Grid */}
      <div className={styles.videoSection}>
        {isLoading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeleton} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className={styles.videoGrid}>
            {videos.map((video, i) => (
              <VideoCard
                key={video.id}
                video={video}
                isSelected={video.id === selectedVideoId}
                onSelect={(v) => onSelectVideo(segment.id, v)}
                index={i}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎬</span>
            <p>未找到相关素材</p>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsEditingKeyword(true)}>
              尝试其他关键词
            </button>
          </div>
        )}
      </div>

      {/* Selected info */}
      {selectedVideo && (
        <div className={styles.selectedInfo}>
          <span className="badge badge-green">✓ 已选定素材</span>
          <span className={styles.selectedName}>
            {selectedVideo.user.name} · {selectedVideo.duration}s ·{' '}
            {selectedVideo.video_files[0]?.width}×{selectedVideo.video_files[0]?.height}
          </span>
        </div>
      )}
    </div>
  );
}
