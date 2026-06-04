import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './RepoOverview.module.css';
import AnimatedCounter from '../common/AnimatedCounter';
import { formatNumber, timeAgo, calculateLanguagePercentages, getScoreColor, getScoreLabel, storage } from '../../utils/helpers';
import { EASTER_EGG_KEYS } from '../../utils/constants';

export default function RepoOverview() {
  const { state } = useApp();
  const { repoData, analysisResult } = state;
  const [showScore, setShowScore] = useState(false);
  const [historyRuns, setHistoryRuns] = useState([]);
  const sectionRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowScore(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (state.repoUrl) {
      const history = storage.get(EASTER_EGG_KEYS.SCAN_HISTORY, []);
      const repoEntry = history.find(
        (h) => h.url.toLowerCase() === state.repoUrl.toLowerCase()
      );
      if (repoEntry && repoEntry.runs && repoEntry.runs.length > 0) {
        const runs = repoEntry.runs;
        setTimeout(() => {
          setHistoryRuns(runs);
        }, 0);
      }
    }
  }, [state.repoUrl]);

  if (!repoData || !analysisResult) return null;

  const repo = repoData.repo;
  const languages = calculateLanguagePercentages(repoData.languages);
  const overallScore = analysisResult.metrics?.overall ?? 0;
  const detections = analysisResult.detections || [];
  const scoreColor = getScoreColor(overallScore);
  const scoreLabel = getScoreLabel(overallScore);

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <motion.section
      ref={sectionRef}
      className={styles.section}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={styles.header}>
        <span className={styles.terminalPrefix}>{'>'} INSPECTION REPORT</span>
        <span className={styles.timestamp}>diagnosed {new Date().toLocaleString()}</span>
      </div>

      <div className={styles.grid}>
        {/* Score Ring */}
        <motion.div
          className={styles.scoreCard}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
        >
          <div className={styles.scoreRing}>
            <svg width="140" height="140" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="54"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="6"
              />
              {showScore && (
                <motion.circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    filter: `drop-shadow(0 0 8px ${scoreColor})`,
                  }}
                />
              )}
            </svg>
            <div className={styles.scoreValue}>
              <AnimatedCounter target={overallScore} duration={2000} />
              <span className={styles.scoreMax}>/100</span>
            </div>
          </div>
          <div className={styles.scoreLabel} style={{ color: scoreColor }}>
            {scoreLabel}
          </div>
        </motion.div>

        {/* Repo Info */}
        <motion.div
          className={styles.repoInfo}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className={styles.repoName}>
            <span className={styles.owner}>{repo.owner?.login}/</span>
            {repo.name}
          </h2>
          {repo.description && (
            <p className={styles.description}>{repo.description}</p>
          )}

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>⭐</span>
              <span className={styles.statValue}>{formatNumber(repo.stars)}</span>
              <span className={styles.statLabel}>stars</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>🔱</span>
              <span className={styles.statValue}>{formatNumber(repo.forks)}</span>
              <span className={styles.statLabel}>forks</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>👁️</span>
              <span className={styles.statValue}>{formatNumber(repo.watchers)}</span>
              <span className={styles.statLabel}>watchers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statIcon}>📅</span>
              <span className={styles.statValue}>{timeAgo(repo.createdAt)}</span>
              <span className={styles.statLabel}>created</span>
            </div>
          </div>

          {/* Languages */}
          {languages.length > 0 && (
            <div className={styles.languages}>
              <div className={styles.langBar}>
                {languages.map((lang, i) => (
                  <div
                    key={lang.name}
                    className={styles.langSegment}
                    style={{
                      width: `${lang.percentage}%`,
                      backgroundColor: getLanguageColor(lang.name),
                      animationDelay: `${i * 100}ms`,
                    }}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                ))}
              </div>
              <div className={styles.langLabels}>
                {languages.slice(0, 5).map(lang => (
                  <span key={lang.name} className={styles.langLabel}>
                    <span
                      className={styles.langDot}
                      style={{ backgroundColor: getLanguageColor(lang.name) }}
                    />
                    {lang.name} {lang.percentage}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detection Badges */}
          {detections.length > 0 && (
            <div className={styles.detections}>
              {detections.map((det, i) => (
                <motion.span
                  key={i}
                  className={`${styles.badge} ${styles[`badge${det.severity}`]}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + i * 0.15, type: 'spring' }}
                >
                  {det.label}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Rule Engine Breakdown */}
      {analysisResult.metrics?.ruleResult?.rules && (
        <div className={styles.rulesContainer}>
          <div className={styles.rulesHeader}>
            <span className={styles.rulesTitle}>// DETERMINISTIC SCORE BREAKDOWN</span>
            <span className={styles.rulesSubtitle}>how the score was calculated</span>
          </div>
          <div className={styles.rulesList}>
            {analysisResult.metrics.ruleResult.rules.map((rule) => {
              const rulePointsPercent = (rule.points / rule.maxPoints) * 100;
              return (
                <div key={rule.id} className={styles.ruleItem}>
                  <div className={styles.ruleMain}>
                    <div className={styles.ruleNameRow}>
                      <span className={styles.ruleName}>{rule.name}</span>
                      <span className={styles.rulePoints}>
                        {rule.points} <span className={styles.ruleMax}>/ {rule.maxPoints} pts</span>
                      </span>
                    </div>
                    <div className={styles.ruleProgressTrack}>
                      <div 
                        className={styles.ruleProgressFill} 
                        style={{ 
                          width: `${rulePointsPercent}%`,
                          backgroundColor: rule.points === rule.maxPoints ? 'var(--accent-green)' : rule.points > 0 ? 'var(--accent-amber)' : 'var(--accent-red)'
                        }}
                      />
                    </div>
                    <p className={styles.ruleEvidence}>{rule.evidence}</p>
                    {rule.tip && (
                      <p className={styles.ruleTip}>
                        <span className={styles.tipLabel}>💡 Recommendation:</span> {rule.tip}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trajectory timeline */}
      {historyRuns.length > 1 && (
        <div className={styles.historyContainer}>
          <div className={styles.historyTitle}>// score trajectory trend</div>
          <div className={styles.trajectoryTimeline}>
            {historyRuns.map((run, index) => {
              const runDate = new Date(run.date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              const shortSha = run.sha || 'unknown';
              return (
                <div key={index} className={styles.timelineNode}>
                  <div
                    className={styles.timelineNodePoint}
                    style={{ borderColor: getScoreColor(run.score) }}
                  >
                    <span className={styles.nodeScore}>{run.score}</span>
                  </div>
                  <div className={styles.nodeMeta}>
                    <span className={styles.nodeSha}>{shortSha}</span>
                    <span className={styles.nodeDate}>{runDate}</span>
                  </div>
                  {index < historyRuns.length - 1 && (
                    <div className={styles.timelineConnector} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.section>
  );
}

function getLanguageColor(lang) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572a5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00add8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4f5d95',
    Swift: '#f05138',
    Kotlin: '#a97bff',
    Dart: '#00b4ab',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Shell: '#89e051',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Lua: '#000080',
    R: '#198ce7',
  };
  return colors[lang] || '#8888a0';
}
