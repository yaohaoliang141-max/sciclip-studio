'use client';

import { useState, useRef } from 'react';
import { PexelsVideo } from '@/types';
import styles from './VideoCard.module.css';

interface Props {
  video: PexelsVideo;
  isSelected: boolean;
  onSelect: (video: PexelsVideo) => void;
  index: number;
}

export default function VideoCard({ video, isSelected, onSelect, index }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 找最佳质量的 HD 文件（宽度在 1280 左右）
  const videoFile = video.video_files
    .filter(f => f.file_type === 'video/mp4')
    .sort((a, b) => {
      const targetWidth = 1280;
      return Math.abs(a.width - targetWidth) - Math.abs(b.width - targetWidth);
    })[0];

  const thumbnail = video.video_pictures[0]?.picture;
  const duration = `${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}`;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && videoFile) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={styles.thumbnail}>
        {thumbnail && (
          <img
            src={thumbnail}
            alt={`视频 ${video.id}`}
            className={`${styles.img} ${isPlaying ? styles.imgHidden : ''}`}
          />
        )}
        {videoFile && (
          <video
            ref={videoRef}
            className={`${styles.video} ${isPlaying ? styles.videoVisible : ''}`}
            src={videoFile.link}
            muted
            loop
            playsInline
            preload="none"
          />
        )}
        <div className={`${styles.overlay} ${isHovered ? styles.overlayVisible : ''}`}>
          <span className={styles.playIcon}>▶</span>
        </div>
        <div className={styles.duration}>{duration}</div>
        {isSelected && (
          <div className={styles.selectedBadge}>
            <span>✓</span> 已选
          </div>
        )}
        <div className={styles.resolution}>
          {videoFile ? `${videoFile.width}×${videoFile.height}` : 'HD'}
        </div>
      </div>

      <div className={styles.meta}>
        <span className={styles.author} title={video.user.name}>
          📷 {video.user.name}
        </span>
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.pexelsLink}
          onClick={e => e.stopPropagation()}
        >
          Pexels ↗
        </a>
      </div>
    </div>
  );
}
