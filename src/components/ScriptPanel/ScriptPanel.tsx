'use client';

import { useState } from 'react';
import styles from './ScriptPanel.module.css';

interface Props {
  onAnalyze: (script: string) => void;
  isLoading: boolean;
}

const DEMO_SCRIPT = `黑洞是宇宙中最神秘的天体之一。它的引力如此强大，连光都无法逃脱。

科学家们通过爱因斯坦的广义相对论预言了黑洞的存在。当一颗质量足够大的恒星走到生命尽头，它会在自身引力的作用下坍缩，最终形成黑洞。

在黑洞的边界——事件视界处，时间会极度扭曲，甚至停止流逝。任何进入事件视界的物质，都无法再逃脱出来。

2019年，人类第一次拍摄到了黑洞的照片。这张来自M87星系中心的黑洞图像，是由全球八台射电望远镜协同拍摄完成的。

霍金辐射理论告诉我们，黑洞并非永恒存在。它会缓慢地通过量子效应辐射能量，直到最终蒸发消失。`;

export default function ScriptPanel({ onAnalyze, isLoading }: Props) {
  const [script, setScript] = useState('');

  const handleDemo = () => setScript(DEMO_SCRIPT);
  const handleClear = () => setScript('');
  const handleSubmit = () => { if (script.trim()) onAnalyze(script); };

  const charCount = script.length;
  const segmentEstimate = Math.max(1, Math.round(script.split(/[。！？\n]+/).filter(s => s.trim()).length / 2));

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <span className={styles.titleIcon}>✍️</span>
            口稿输入
          </h2>
          <p className={styles.subtitle}>粘贴你的科普文案，AI 将自动拆分并匹配素材</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleDemo}>
          📄 示例口稿
        </button>
      </div>

      <div className={styles.textareaWrapper}>
        <textarea
          className={`textarea ${styles.textarea}`}
          value={script}
          onChange={e => setScript(e.target.value)}
          placeholder="在这里粘贴或输入科普口稿内容...

例如：
黑洞是宇宙中最神秘的天体之一，它的引力如此强大，连光都无法逃脱..."
          rows={16}
        />
        {script && (
          <button className={styles.clearBtn} onClick={handleClear} title="清空">
            ✕
          </button>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.stats}>
          {charCount > 0 && (
            <>
              <span className="badge badge-blue">{charCount} 字</span>
              <span className="badge badge-purple">预计 {segmentEstimate} 个片段</span>
            </>
          )}
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!script.trim() || isLoading}
          id="analyze-btn"
        >
          {isLoading ? (
            <>
              <span className="spinner spinner-sm" />
              AI 分析中...
            </>
          ) : (
            <>
              <span>✨</span>
              AI 智能分段
            </>
          )}
        </button>
      </div>
    </div>
  );
}
