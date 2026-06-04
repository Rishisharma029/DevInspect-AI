import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './DocumentationAnalysis.module.css';

export default function DocumentationAnalysis() {
  const { state } = useApp();
  const { analysisResult } = state;

  if (!analysisResult?.analysis?.readmeAnalysis) return null;

  const readme = analysisResult.analysis.readmeAnalysis;
  const powerLevel = analysisResult.metrics?.readmePowerLevel?.score ?? 0;

  const checklist = [
    { label: 'README.md exists', check: readme.length > 0, icon: '📄' },
    { label: 'Screenshots / images', check: readme.hasScreenshots, icon: '🖼️' },
    { label: 'Badges', check: readme.hasBadges, icon: '🏷️' },
    { label: 'Setup / installation', check: readme.hasSetupInstructions, icon: '⚙️' },
    { label: 'Code examples', check: readme.codeBlockCount > 0, icon: '💻' },
    { label: 'Headings structure', check: readme.headingCount >= 3, icon: '📑' },
    { label: 'Contribution guide', check: readme.hasContributing, icon: '🤝' },
    { label: 'License', check: readme.hasLicense, icon: '📜' },
    { label: 'Substantial content', check: readme.wordCount > 100, icon: '📝' },
  ];

  const passedCount = checklist.filter(c => c.check).length;
  const totalCount = checklist.length;

  // Power level bar segments (DBZ style)
  const powerSegments = 10;
  const filledSegments = Math.round((powerLevel / 100) * powerSegments);

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <span className={styles.prefix}>{'>'} DOCUMENTATION ANALYSIS</span>
        <span className={styles.sub}>readme inspection</span>
      </div>

      <div className={styles.content}>
        {/* Power Level */}
        <div className={styles.powerLevel}>
          <div className={styles.powerHeader}>
            <span className={styles.powerLabel}>README POWER LEVEL</span>
            <span className={styles.powerValue} style={{ color: getPowerColor(powerLevel) }}>
              {powerLevel}
            </span>
          </div>
          <div className={styles.powerBar}>
            {Array.from({ length: powerSegments }).map((_, i) => (
              <motion.div
                key={i}
                className={`${styles.powerSegment} ${i < filledSegments ? styles.powerSegmentFilled : ''}`}
                style={{
                  backgroundColor: i < filledSegments ? getPowerColor(powerLevel) : undefined,
                  boxShadow: i < filledSegments ? `0 0 8px ${getPowerColor(powerLevel)}44` : undefined,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
              />
            ))}
          </div>
          <span className={styles.powerVerdict}>
            {analysisResult.metrics?.readmePowerLevel?.verdict || ''}
          </span>
        </div>

        {/* Checklist */}
        <div className={styles.checklist}>
          <div className={styles.checklistHeader}>
            <span className={styles.checklistTitle}>Documentation Checklist</span>
            <span className={styles.checklistCount}>
              {passedCount}/{totalCount} passed
            </span>
          </div>
          {checklist.map((item, i) => (
            <motion.div
              key={i}
              className={`${styles.checkItem} ${item.check ? styles.checkPass : styles.checkFail}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <span className={styles.checkIcon}>{item.icon}</span>
              <span className={styles.checkLabel}>{item.label}</span>
              <span className={styles.checkStatus}>
                {item.check ? '✓ PASS' : '✗ FAIL'}
              </span>
            </motion.div>
          ))}
        </div>

        {/* README Stats */}
        <div className={styles.readmeStats}>
          <div className={styles.readmeStat}>
            <span className={styles.readmeStatValue}>{readme.wordCount || 0}</span>
            <span className={styles.readmeStatLabel}>words</span>
          </div>
          <div className={styles.readmeStat}>
            <span className={styles.readmeStatValue}>{readme.headingCount || 0}</span>
            <span className={styles.readmeStatLabel}>headings</span>
          </div>
          <div className={styles.readmeStat}>
            <span className={styles.readmeStatValue}>{readme.codeBlockCount || 0}</span>
            <span className={styles.readmeStatLabel}>code blocks</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function getPowerColor(level) {
  if (level >= 80) return '#00ff41';
  if (level >= 60) return '#00e5ff';
  if (level >= 40) return '#ffb700';
  if (level >= 20) return '#ff6b9d';
  return '#ff3e3e';
}
