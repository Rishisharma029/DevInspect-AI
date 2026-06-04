import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './MetricsDashboard.module.css';
import AnimatedCounter from '../common/AnimatedCounter';
import { getScoreColor, randomRotation, asciiProgressBar } from '../../utils/helpers';
import { METRICS } from '../../utils/constants';

export default function MetricsDashboard() {
  const { state } = useApp();
  const { analysisResult } = state;
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleExpand = (metricId) => {
    setExpandedCard((prev) => (prev === metricId ? null : metricId));
  };

  const metricCards = useMemo(() => {
    if (!analysisResult?.metrics) return [];
    const m = analysisResult.metrics;
    const expl = analysisResult.metricsExplanations || {};
    return [
      { ...METRICS.DOCUMENTATION_DENSITY, score: m.documentationDensity?.score ?? 0, verdict: m.documentationDensity?.verdict ?? '', evidence: expl.documentationDensity || m.documentationDensity?.evidence || [] },
      { ...METRICS.DEPLOYMENT_CONFIDENCE, score: m.deploymentConfidence?.score ?? 0, verdict: m.deploymentConfidence?.verdict ?? '', evidence: expl.deploymentConfidence || m.deploymentConfidence?.evidence || [] },
      { ...METRICS.PORTFOLIO_VALUE, score: m.portfolioValue?.score ?? 0, verdict: m.portfolioValue?.verdict ?? '', evidence: expl.portfolioValue || m.portfolioValue?.evidence || [] },
      { ...METRICS.TECHNICAL_DEBT_FORECAST, score: m.technicalDebtForecast?.score ?? 0, verdict: m.technicalDebtForecast?.verdict ?? '', evidence: expl.technicalDebtForecast || m.technicalDebtForecast?.evidence || [] },
      { ...METRICS.OPENSOURCE_FRIENDLINESS, score: m.openSourceFriendliness?.score ?? 0, verdict: m.openSourceFriendliness?.verdict ?? '', evidence: expl.openSourceFriendliness || m.openSourceFriendliness?.evidence || [] },
      { ...METRICS.PRODUCTION_READINESS, score: m.productionReadiness?.score ?? 0, verdict: m.productionReadiness?.verdict ?? '', evidence: expl.productionReadiness || m.productionReadiness?.evidence || [] },
      { ...METRICS.TUTORIAL_DEPENDENCY, score: m.tutorialDependency?.score ?? 0, verdict: m.tutorialDependency?.verdict ?? '', evidence: expl.tutorialDependency || m.tutorialDependency?.evidence || [] },
      { ...METRICS.README_POWER_LEVEL, score: m.readmePowerLevel?.score ?? 0, verdict: m.readmePowerLevel?.verdict ?? '', evidence: expl.readmePowerLevel || m.readmePowerLevel?.evidence || [] },
      { ...METRICS.FOUNDER_HALLUCINATION, score: m.founderHallucination?.score ?? 0, verdict: m.founderHallucination?.verdict ?? '', evidence: expl.founderHallucination || m.founderHallucination?.evidence || [] },
    ];
  }, [analysisResult]);

  if (metricCards.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.prefix}>{'>'} METRICS DASHBOARD</span>
        <span className={styles.sub}>diagnostic readings</span>
      </div>

      <div className={styles.grid}>
        {metricCards.map((metric, i) => (
          <motion.div
            key={metric.id}
            className={styles.card}
            style={{ '--card-rotation': randomRotation(0.6) }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.1 + i * 0.08,
              duration: 0.5,
              type: 'spring',
              stiffness: 120,
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>{metric.icon}</span>
              <span className={styles.cardName}>{metric.name}</span>
            </div>

            <div className={styles.scoreRow}>
              <div className={styles.scoreNumber} style={{ color: getScoreColor(metric.score) }}>
                <AnimatedCounter target={metric.score} duration={1500 + i * 100} />
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressTrack}>
                  <motion.div
                    className={styles.progressFill}
                    style={{ backgroundColor: getScoreColor(metric.score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.score}%` }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <span className={styles.progressAscii}>
                  {asciiProgressBar(metric.score, 10)}
                </span>
              </div>
            </div>

            {metric.verdict && (
              <p className={styles.verdict}>{metric.verdict}</p>
            )}

            <button
              className={styles.explainBtn}
              onClick={() => toggleExpand(metric.id)}
              type="button"
            >
              {expandedCard === metric.id ? '[- hide evidence]' : '[+ explain score]'}
            </button>

            <AnimatePresence initial={false}>
              {expandedCard === metric.id && metric.evidence && metric.evidence.length > 0 && (
                <motion.div
                  className={styles.evidenceBlock}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ul className={styles.evidenceList}>
                    {metric.evidence.map((bullet, idx) => (
                      <li key={idx} className={styles.evidenceItem}>
                        • {bullet}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
