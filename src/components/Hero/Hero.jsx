import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import GlitchText from '../common/GlitchText';
import styles from './Hero.module.css';

const SUBTITLE_TEXT = 'Your repository. Professionally judged.';

const STATUS_BADGES = [
  { text: 'SYSTEMS ONLINE', className: 'badge1' },
  { text: 'ANALYSIS ENGINE: READY', className: 'badge2' },
  { text: 'PERSONA CORE: LOADED', className: 'badge3' },
];

const PARTICLE_COUNT = 18;

export default function Hero() {
  const [subtitleChars, setSubtitleChars] = useState(0);
  const [showCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (subtitleChars >= SUBTITLE_TEXT.length) {
      // Keep cursor blinking after typing complete
      return;
    }

    const delay = subtitleChars === 0 ? 1200 : 40 + Math.random() * 40;
    const timeout = setTimeout(() => {
      setSubtitleChars(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timeout);
  }, [subtitleChars]);

  // Generate particles deterministically with random positions and delays
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const seed1 = Math.sin(i + 1) * 10000;
      const r1 = seed1 - Math.floor(seed1);

      const seed2 = Math.cos(i + 2) * 10000;
      const r2 = seed2 - Math.floor(seed2);

      const seed3 = Math.sin(i + 3) * 10000;
      const r3 = seed3 - Math.floor(seed3);

      const seed4 = Math.cos(i + 4) * 10000;
      const r4 = seed4 - Math.floor(seed4);

      const seed5 = Math.sin(i + 5) * 10000;
      const r5 = seed5 - Math.floor(seed5);

      return {
        id: i,
        left: `${r1 * 100}%`,
        animationDuration: `${6 + r2 * 8}s`,
        animationDelay: `${r3 * 6}s`,
        size: `${1 + r4 * 2}px`,
        opacity: 0.2 + r5 * 0.5,
      };
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <section className={styles.hero}>
      {/* Animated grid background */}
      <div className={styles.gridBg} />

      {/* Floating particles */}
      <div className={styles.particles}>
        {particles.map(p => (
          <div
            key={p.id}
            className={styles.particle}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <motion.div
        className={styles.heroGlow}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      />

      {/* Title Area */}
      <motion.div
        className={styles.titleArea}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* DEVINSPECT */}
        <motion.div variants={childVariants}>
          <GlitchText
            text="DEVINSPECT"
            tag="h1"
            className={styles.mainTitle}
            intensity="high"
          />
        </motion.div>

        {/* AI */}
        <motion.div variants={childVariants}>
          <span className={styles.aiTitle}>AI</span>
        </motion.div>

        {/* Subtitle with typewriter */}
        <motion.div
          className={styles.subtitleWrapper}
          variants={childVariants}
        >
          <p className={styles.subtitle}>
            {SUBTITLE_TEXT.slice(0, subtitleChars)}
            {showCursor && <span className={styles.cursor} />}
          </p>
        </motion.div>
      </motion.div>

      {/* Floating status badges */}
      <div className={styles.badges}>
        {STATUS_BADGES.map((badge, i) => (
          <motion.span
            key={badge.className}
            className={`${styles.statusBadge} ${styles[badge.className]}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.5 + i * 0.3,
              ease: 'easeOut',
            }}
          >
            {badge.text}
          </motion.span>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
      >
        <div className={styles.scrollCursor} />
        <span className={styles.scrollText}>scroll</span>
      </motion.div>
    </section>
  );
}
