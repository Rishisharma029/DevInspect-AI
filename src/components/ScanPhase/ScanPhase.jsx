import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { SCAN_MESSAGES } from '../../utils/constants';
import { asciiProgressBar } from '../../utils/helpers';
import styles from './ScanPhase.module.css';

const MATRIX_CHARS = 'アイウエオカキクケコサシスセソ01001101ABCDEF{}[]<>/\\';
const MATRIX_COLS = 12;

export default function ScanPhase() {
  const { state } = useApp();
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const terminalEndRef = useRef(null);
  const timeoutRef = useRef(null);

  // Generate matrix columns data deterministically
  const matrixColumns = useMemo(() => {
    return Array.from({ length: MATRIX_COLS }, (_, i) => {
      // Deterministic pseudo-random generation based on index i to bypass Math.random purity warning
      const seed1 = Math.sin(i + 1) * 10000;
      const r1 = seed1 - Math.floor(seed1); // pseudo-random [0, 1]
      
      const seed2 = Math.cos(i + 2) * 10000;
      const r2 = seed2 - Math.floor(seed2); // pseudo-random [0, 1]
      
      const seed3 = Math.sin(i + 3) * 10000;
      const r3 = seed3 - Math.floor(seed3); // pseudo-random [0, 1]
      
      const seed4 = Math.cos(i + 4) * 10000;
      const r4 = seed4 - Math.floor(seed4); // pseudo-random [0, 1]

      const len = 20 + Math.floor(r4 * 15);
      const chars = Array.from({ length: len }, (_, k) => {
        const seedChar = Math.sin(i * 10 + k) * 10000;
        const rChar = seedChar - Math.floor(seedChar);
        const charIndex = Math.floor(rChar * MATRIX_CHARS.length);
        return MATRIX_CHARS[charIndex];
      }).join('');

      return {
        id: i,
        left: `${(i / MATRIX_COLS) * 100 + r1 * (100 / MATRIX_COLS)}%`,
        duration: `${4 + r2 * 8}s`,
        delay: `${r3 * 4}s`,
        chars,
      };
    });
  }, []);

  // Sequentially reveal scan messages
  useEffect(() => {
    let currentIndex = 0;

    function showNext() {
      if (currentIndex >= SCAN_MESSAGES.length) {
        // All messages shown — trigger completion
        setTimeout(() => {
          setShowFlash(true);
          setTimeout(() => {
            setShowFlash(false);
            setIsComplete(true);
          }, 300);
        }, 500);
        return;
      }

      const msg = SCAN_MESSAGES[currentIndex];
      const jitter = Math.random() * 200; // Random extra delay for realism

      timeoutRef.current = setTimeout(() => {
        setVisibleMessages(prev => [...prev, { ...msg, id: currentIndex }]);
        setProgress(Math.round(((currentIndex + 1) / SCAN_MESSAGES.length) * 100));
        currentIndex++;
        showNext();
      }, msg.delay + jitter);
    }

    // Start after a brief initial delay
    timeoutRef.current = setTimeout(showNext, 600);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visibleMessages]);

  const getPrefix = (type) => {
    switch (type) {
      case 'warn': return { text: '[WARN]', className: styles.logPrefixWarn };
      case 'done': return { text: '[DONE]', className: styles.logPrefixDone };
      default:     return { text: '[SCAN]', className: styles.logPrefixScan };
    }
  };

  const repoUrl = state.repoUrl || '';

  return (
    <motion.div
      className={styles.scanPhase}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Matrix rain background */}
      <div className={styles.matrixBg} aria-hidden="true">
        {matrixColumns.map(col => (
          <span
            key={col.id}
            className={styles.matrixColumn}
            style={{
              left: col.left,
              animationDuration: col.duration,
              animationDelay: col.delay,
            }}
          >
            {col.chars}
          </span>
        ))}
      </div>

      {/* Header */}
      <motion.div
        className={styles.scanHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className={styles.scanTitle}>SCANNING REPOSITORY</div>
        {repoUrl && (
          <div className={styles.scanTarget}>target: {repoUrl}</div>
        )}
      </motion.div>

      {/* Progress */}
      <motion.div
        className={styles.progressSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className={styles.progressRow}>
          <span className={styles.progressAscii}>
            {asciiProgressBar(progress, 30)}
          </span>
          <span className={styles.progressPct}>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>

      {/* Terminal output */}
      <motion.div
        className={styles.terminal}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <div className={styles.terminalHeader}>
          <div className={styles.termDots}>
            <span className={`${styles.termDot} ${styles.termDotR}`} />
            <span className={`${styles.termDot} ${styles.termDotY}`} />
            <span className={`${styles.termDot} ${styles.termDotG}`} />
          </div>
          <span className={styles.termTitle}>diagnostic output</span>
        </div>

        <div className={styles.terminalBody}>
          <AnimatePresence>
            {visibleMessages.map((msg) => {
              const prefix = getPrefix(msg.type);
              return (
                <motion.div
                  key={msg.id}
                  className={styles.logLine}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={`${styles.logPrefix} ${prefix.className}`}>
                    {prefix.text}
                  </span>
                  <span
                    className={
                      msg.type === 'done' ? styles.logTextDone : styles.logText
                    }
                  >
                    {msg.text}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Blinking cursor at end */}
          {!isComplete && (
            <div>
              <span className={styles.termCursor} />
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={terminalEndRef} />
        </div>
      </motion.div>

      {/* Flash effect on completion */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className={styles.flash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
