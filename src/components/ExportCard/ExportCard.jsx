import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import { useApp } from '../../context/AppContext';
import styles from './ExportCard.module.css';
import { getScoreColor, getScoreLabel, formatNumber } from '../../utils/helpers';

export default function ExportCard() {
  const { state } = useApp();
  const { repoData, analysisResult } = state;
  const [activeView, setActiveView] = useState('report');
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef(null);

  if (!repoData || !analysisResult) return null;

  const repo = repoData.repo;
  const score = analysisResult.metrics?.overall ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const metrics = analysisResult.metrics || {};

  const handleExport = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0f',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `devinspect-${repo.name}-${activeView}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(false);
  };

  const views = {
    report: { label: 'Report Card', emoji: '📊' },
    recruiter: { label: 'Recruiter View', emoji: '👔' },
    cto: { label: 'CTO View', emoji: '🚀' },
  };

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <span className={styles.prefix}>{'>'} EXPORT & SHARE</span>
        <span className={styles.sub}>shareable report cards</span>
      </div>

      <div className={styles.viewTabs}>
        {Object.entries(views).map(([key, view]) => (
          <button
            key={key}
            className={`${styles.viewTab} ${activeView === key ? styles.viewTabActive : ''}`}
            onClick={() => setActiveView(key)}
          >
            {view.emoji} {view.label}
          </button>
        ))}
      </div>

      {/* The exportable card */}
      <div className={styles.cardWrapper}>
        <div ref={cardRef} className={styles.card}>
          <div className={styles.cardBrand}>
            <span className={styles.cardBrandName}>DEVINSPECT AI</span>
            <span className={styles.cardBrandSub}>repository inspection report</span>
          </div>

          <div className={styles.cardRepo}>
            <h3 className={styles.cardRepoName}>{repo.full_name}</h3>
            {repo.description && (
              <p className={styles.cardRepoDesc}>{repo.description}</p>
            )}
            <div className={styles.cardStats}>
              <span>⭐ {formatNumber(repo.stargazers_count)}</span>
              <span>🔱 {formatNumber(repo.forks_count)}</span>
              <span>📅 {new Date(repo.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={styles.cardScore}>
            <div className={styles.cardScoreCircle} style={{ borderColor: scoreColor }}>
              <span className={styles.cardScoreValue} style={{ color: scoreColor }}>{score}</span>
            </div>
            <span className={styles.cardScoreLabel} style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>

          {activeView === 'report' && (
            <div className={styles.cardMetrics}>
              <MetricRow label="Documentation" score={metrics.documentationDensity?.score} />
              <MetricRow label="Deployment" score={metrics.deploymentConfidence?.score} />
              <MetricRow label="Portfolio Value" score={metrics.portfolioValue?.score} />
              <MetricRow label="Production Ready" score={metrics.productionReadiness?.score} />
              <MetricRow label="Open Source" score={metrics.openSourceFriendliness?.score} />
            </div>
          )}

          {activeView === 'recruiter' && (
            <div className={styles.cardMetrics}>
              <MetricRow label="Portfolio Value" score={metrics.portfolioValue?.score} />
              <MetricRow label="Documentation" score={metrics.documentationDensity?.score} />
              <MetricRow label="Deployment" score={metrics.deploymentConfidence?.score} />
              <MetricRow label="Originality" score={metrics.tutorialDependency?.score} />
              <MetricRow label="README Quality" score={metrics.readmePowerLevel?.score} />
            </div>
          )}

          {activeView === 'cto' && (
            <div className={styles.cardMetrics}>
              <MetricRow label="Production Ready" score={metrics.productionReadiness?.score} />
              <MetricRow label="Tech Debt" score={metrics.technicalDebtForecast?.score} />
              <MetricRow label="Architecture" score={metrics.openSourceFriendliness?.score} />
              <MetricRow label="Market Ready" score={metrics.founderHallucination?.score} />
              <MetricRow label="Deployment" score={metrics.deploymentConfidence?.score} />
            </div>
          )}

          {analysisResult.roastLine && (
            <div className={styles.cardRoast}>
              "{analysisResult.roastLine}"
            </div>
          )}

          <div className={styles.cardFooter}>
            <span>devinspect.ai</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
          {exporting ? '⏳ Exporting...' : '📥 Download as PNG'}
        </button>
        <button className={styles.printBtn} onClick={() => window.print()}>
          🖨️ Export PDF Report
        </button>
      </div>
    </motion.section>
  );
}

function MetricRow({ label, score }) {
  const s = score ?? 0;
  const color = getScoreColor(s);
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricBar}>
        <div
          className={styles.metricBarFill}
          style={{ width: `${s}%`, backgroundColor: color }}
        />
      </div>
      <span className={styles.metricValue} style={{ color }}>{s}</span>
    </div>
  );
}
