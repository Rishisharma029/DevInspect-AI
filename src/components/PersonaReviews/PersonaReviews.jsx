import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './PersonaReviews.module.css';
import { PERSONAS } from '../../utils/constants';

const personaOrder = [
  PERSONAS.SENIOR_ENGINEER,
  PERSONAS.RECRUITER,
  PERSONAS.DEVOPS_VETERAN,
  PERSONAS.OPENSOURCE_MAINTAINER,
  PERSONAS.STARTUP_CTO,
];

export default function PersonaReviews() {
  const { state } = useApp();
  const { analysisResult } = state;
  const [activeTab, setActiveTab] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textRef = useRef(null);

  const reviews = analysisResult?.personaReviews || {};

  const currentPersona = personaOrder[activeTab];
  const reviewKey = currentPersona.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  const currentReview = reviews[reviewKey] || {
    summary: 'Review pending...',
    keyPoints: [],
    verdict: 'N/A',
    score: 0,
  };

  // Typewriter effect for review text
  useEffect(() => {
    const text = currentReview.summary || '';
    let i = 0;

    const timer = setTimeout(() => {
      setDisplayedText('');
      setIsTyping(true);
    }, 0);

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 18);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [activeTab, currentReview.summary]);

  if (!analysisResult) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.prefix}>{'>'} PERSONA REVIEWS</span>
        <span className={styles.sub}>expert opinions</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {personaOrder.map((persona, i) => (
          <motion.button
            key={persona.id}
            className={`${styles.tab} ${i === activeTab ? styles.tabActive : ''}`}
            style={{ '--persona-color': persona.color }}
            onClick={() => setActiveTab(i)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <span className={styles.tabEmoji}>{persona.emoji}</span>
            <span className={styles.tabName}>{persona.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Review Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className={styles.panel}
          style={{ '--persona-color': currentPersona.color }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.panelHeader}>
            <div className={styles.personaInfo}>
              <span className={styles.personaEmoji}>{currentPersona.emoji}</span>
              <div>
                <h3 className={styles.personaName}>{currentPersona.name}</h3>
                <span className={styles.personaTone}>{currentPersona.tone}</span>
              </div>
            </div>
            <div className={styles.personaScore}>
              <span className={styles.personaScoreValue}>{currentReview.score || '—'}</span>
              <span className={styles.personaScoreLabel}>/100</span>
            </div>
          </div>

          <div className={styles.reviewBody}>
            <div className={styles.reviewText} ref={textRef}>
              {displayedText}
              {isTyping && <span className={styles.cursor}>▌</span>}
            </div>

            {!isTyping && currentReview.keyPoints && currentReview.keyPoints.length > 0 && (
              <motion.div
                className={styles.keyPoints}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className={styles.keyPointsLabel}>KEY FINDINGS:</span>
                {currentReview.keyPoints.map((point, i) => (
                  <motion.div
                    key={i}
                    className={styles.keyPoint}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <span className={styles.keyPointBullet}>›</span>
                    {point}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!isTyping && currentReview.verdict && (
              <motion.div
                className={styles.verdict}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className={styles.verdictLabel}>VERDICT:</span>
                <span className={styles.verdictText}>{currentReview.verdict}</span>
              </motion.div>
            )}
          </div>

          <div className={styles.panelFooter}>
            <span className={styles.tagline}>{currentPersona.tagline}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
