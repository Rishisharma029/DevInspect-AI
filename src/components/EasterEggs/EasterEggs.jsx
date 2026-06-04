import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './EasterEggs.module.css';

/* ═══ RECRUITER TYPING ═══ */
export function RecruiterTyping() {
  const { state } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.scanState !== 'complete') return;
    
    let timeout;
    const startTimer = () => {
      timeout = setTimeout(() => {
        if (Math.random() < 0.3) {
          setVisible(true);
          setTimeout(() => setVisible(false), 4000 + Math.random() * 3000);
        }
        startTimer();
      }, 15000 + Math.random() * 20000);
    };

    const initialDelay = setTimeout(startTimer, 10000);
    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeout);
    };
  }, [state.scanState]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.recruiterTyping}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
        >
          <span className={styles.recruiterDot} />
          <span className={styles.recruiterText}>
            Recruiter is typing
            <span className={styles.dots}>
              <span>.</span><span>.</span><span>.</span>
            </span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══ BURNOUT METER ═══ */
export function BurnoutMeter() {
  const { state } = useApp();
  const count = state.easterEggs.burnoutCount;

  const getBurnoutLevel = (c) => {
    if (c <= 2) return { level: 'Intern', emoji: '🌱', color: 'var(--accent-green)' };
    if (c <= 8) return { level: 'Junior Dev', emoji: '☕', color: 'var(--accent-cyan)' };
    if (c <= 20) return { level: 'Mid-Level', emoji: '😤', color: 'var(--accent-amber)' };
    if (c <= 40) return { level: 'Senior Developer, Mentally', emoji: '💀', color: 'var(--accent-red)' };
    return { level: 'Staff Engineer (Emotionally)', emoji: '👻', color: 'var(--accent-purple)' };
  };

  const { level, emoji, color } = getBurnoutLevel(count);

  if (count < 2) return null;

  return (
    <motion.div
      className={styles.burnoutMeter}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2 }}
    >
      <span className={styles.burnoutEmoji}>{emoji}</span>
      <div className={styles.burnoutInfo}>
        <span className={styles.burnoutLabel}>BURNOUT LEVEL</span>
        <span className={styles.burnoutLevel} style={{ color }}>{level}</span>
        <span className={styles.burnoutCount}>{count} inspections</span>
      </div>
    </motion.div>
  );
}

/* ═══ TOUCH GRASS PROTOCOL ═══ */
export function TouchGrass() {
  const { state } = useApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sessionStart = state.easterEggs.sessionStart;
    const checkInterval = setInterval(() => {
      const elapsed = (Date.now() - sessionStart) / 1000 / 60;
      if (elapsed >= 30 && !show) {
        setShow(true);
      }
    }, 60000);

    return () => clearInterval(checkInterval);
  }, [state.easterEggs.sessionStart, show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.touchGrass}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShow(false)}
        >
          <motion.div
            className={styles.touchGrassCard}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <span className={styles.touchGrassEmoji}>🌿</span>
            <span className={styles.touchGrassTitle}>TOUCH GRASS PROTOCOL</span>
            <span className={styles.touchGrassText}>
              You have been inspecting repositories for over 30 minutes.
            </span>
            <span className={styles.touchGrassRecommendation}>
              Recommendation: Locate vegetation.
            </span>
            <button className={styles.touchGrassBtn} onClick={() => setShow(false)}>
              DISMISS (I'm fine)
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══ HUMANITY CHECK ═══ */
export function HumanityCheck({ score }) {
  const [show, setShow] = useState(false);
  const [prevScore, setPrevScore] = useState(score);
  const [dismissed, setDismissed] = useState(false);

  if (score !== prevScore) {
    setPrevScore(score);
    setDismissed(false);
  }

  useEffect(() => {
    if (score >= 90 && !dismissed) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [score, dismissed]);

  // Auto-dismiss modal after 8.5 seconds (5 seconds after respect earned renders)
  useEffect(() => {
    if (show) {
      const autoDismissTimer = setTimeout(() => {
        setShow(false);
        setDismissed(true);
      }, 8500);
      return () => clearTimeout(autoDismissTimer);
    }
  }, [show]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className={styles.humanityCheck}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.humanityCard}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.humanityDots}>
                <span>.</span><span>.</span><span>.</span>
              </div>
              <motion.p
                className={styles.humanityWait}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                wait.
              </motion.p>
              <motion.p
                className={styles.humanitySolid}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                this is actually solid.
              </motion.p>
              <motion.p
                className={styles.humanityRespect}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
              >
                respect earned. ✊
              </motion.p>
              <motion.button
                className={styles.humanityBtn}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5 }}
                onClick={() => {
                  setShow(false);
                  setDismissed(true);
                }}
              >
                continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {dismissed && score >= 90 && (
        <motion.div
          className={styles.respectBadge}
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <span className={styles.respectBadgeGlow}>✊</span>
          <span className={styles.respectBadgeText}>RESPECT EARNED</span>
        </motion.div>
      )}
    </>
  );
}

/* ═══ DVD LOGO ═══ */
export function DVDLogo() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [cornerHit, setCornerHit] = useState(false);
  const [color, setColor] = useState('var(--accent-green)');
  const velocityRef = useRef({ dx: 1.5, dy: 1.2 });

  useEffect(() => {
    const width = 100;
    const height = 30;
    const colors = ['var(--accent-green)', 'var(--accent-cyan)', 'var(--accent-purple)', 'var(--accent-amber)', 'var(--accent-pink)'];

    const animate = () => {
      setPosition(prev => {
        let newX = prev.x + velocityRef.current.dx;
        let newY = prev.y + velocityRef.current.dy;
        let bounced = false;

        if (newX <= 0 || newX >= window.innerWidth - width) {
          velocityRef.current.dx *= -1;
          bounced = true;
          newX = Math.max(0, Math.min(newX, window.innerWidth - width));
        }
        if (newY <= 0 || newY >= window.innerHeight - height) {
          velocityRef.current.dy *= -1;
          bounced = true;
          newY = Math.max(0, Math.min(newY, window.innerHeight - height));
        }

        if (bounced) {
          setColor(colors[Math.floor(Math.random() * colors.length)]);

          // Corner hit detection
          const nearLeft = newX < 5;
          const nearRight = newX > window.innerWidth - width - 5;
          const nearTop = newY < 5;
          const nearBottom = newY > window.innerHeight - height - 5;
          if ((nearLeft || nearRight) && (nearTop || nearBottom)) {
            setCornerHit(true);
            setTimeout(() => setCornerHit(false), 3000);
          }
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div
        className={styles.dvdLogo}
        style={{
          left: position.x,
          top: position.y,
          color: color,
          textShadow: `0 0 10px ${color}`,
        }}
      >
        DI
      </div>
      <AnimatePresence>
        {cornerHit && (
          <motion.div
            className={styles.cornerHit}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className={styles.cornerHitTitle}>LEGENDARY ALIGNMENT</span>
            <span className={styles.cornerHitAura}>+100 Aura</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
