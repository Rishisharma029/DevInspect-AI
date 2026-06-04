import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import styles from './common.module.css';

function getColor(score) {
  if (score >= 75) return 'var(--score-high)';
  if (score >= 40) return 'var(--score-mid)';
  return 'var(--score-low)';
}

export default function ScoreGauge({
  score = 0,
  size = 120,
  label = '',
  animated = true,
}) {
  const [displayScore, setDisplayScore] = useState(0);
  const [hasEntered, setHasEntered] = useState(!animated);
  const ref = useRef(null);
  const rafRef = useRef(null);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;
  const color = getColor(clampedScore);
  const displayVal = animated ? displayScore : clampedScore;

  // Intersection observer — start animation when visible
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEntered) {
          setHasEntered(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [animated, hasEntered]);

  // Animated count-up
  useEffect(() => {
    if (!hasEntered || !animated) return;

    const duration = 1500;
    const startTime = performance.now();
    const startVal = 0;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(startVal + (clampedScore - startVal) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [hasEntered, clampedScore, animated]);

  const viewBox = '0 0 100 100';
  const isSmall = size < 100;

  return (
    <div
      className={styles.gaugeContainer}
      ref={ref}
      style={{ '--gauge-color': color }}
    >
      <div className={styles.gaugeWrapper} style={{ width: size, height: size }}>
        <motion.svg
          className={styles.gaugeSvg}
          viewBox={viewBox}
          width={size}
          height={size}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={hasEntered ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Track */}
          <circle
            className={styles.gaugeTrack}
            cx="50"
            cy="50"
            r={radius}
          />
          {/* Fill */}
          <circle
            className={styles.gaugeFill}
            cx="50"
            cy="50"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={hasEntered ? offset : circumference}
            style={{ stroke: color }}
          />
        </motion.svg>

        {/* Center score */}
        <div className={styles.gaugeCenter}>
          <span className={`${styles.gaugeScore} ${isSmall ? styles.gaugeScoreSm : ''}`}>
            {displayVal}
          </span>
        </div>
      </div>

      {label && <span className={styles.gaugeLabel}>{label}</span>}
    </div>
  );
}
