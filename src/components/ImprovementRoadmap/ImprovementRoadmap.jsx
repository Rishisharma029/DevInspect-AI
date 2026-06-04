import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './ImprovementRoadmap.module.css';

const priorityConfig = {
  critical: { color: 'var(--accent-red)', label: 'CRITICAL', icon: '🔴' },
  high: { color: 'var(--accent-amber)', label: 'HIGH', icon: '🟠' },
  medium: { color: 'var(--accent-cyan)', label: 'MEDIUM', icon: '🔵' },
  low: { color: 'var(--accent-purple)', label: 'NICE TO HAVE', icon: '🟣' },
};

export default function ImprovementRoadmap() {
  const { state } = useApp();
  const { analysisResult } = state;

  const roadmap = analysisResult?.improvementRoadmap || [];

  if (roadmap.length === 0) return null;

  const handleCopyMarkdown = () => {
    const markdown = roadmap
      .map(item => `- **[${item.priority.toUpperCase()}]** ${item.title}: ${item.description} (Effort: ${item.effort})`)
      .join('\n');
    navigator.clipboard.writeText(markdown);
  };

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.prefix}>{'>'} IMPROVEMENT ROADMAP</span>
          <span className={styles.sub}>actionable recommendations</span>
        </div>
        <button className={styles.copyBtn} onClick={handleCopyMarkdown}>
          📋 Copy as Markdown
        </button>
      </div>

      <div className={styles.timeline}>
        {roadmap.map((item, i) => {
          const config = priorityConfig[item.priority] || priorityConfig.medium;
          return (
            <motion.div
              key={i}
              className={styles.item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
            >
              <div className={styles.itemLine}>
                <div
                  className={styles.itemDot}
                  style={{ backgroundColor: config.color, boxShadow: `0 0 10px ${config.color}44` }}
                />
                {i < roadmap.length - 1 && (
                  <div className={styles.itemConnector} />
                )}
              </div>

              <div className={styles.itemContent}>
                <div className={styles.itemHeader}>
                  <span
                    className={styles.itemPriority}
                    style={{ color: config.color, borderColor: `${config.color}33`, backgroundColor: `${config.color}11` }}
                  >
                    {config.icon} {config.label}
                  </span>
                  {item.effort && (
                    <span className={styles.itemEffort}>⏱ {item.effort}</span>
                  )}
                </div>
                <h4 className={styles.itemTitle}>{item.title}</h4>
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
