import { motion } from 'motion/react';
import GlitchText from './GlitchText';
import styles from './common.module.css';

export default function SectionHeader({
  title,
  subtitle,
  accent = 'var(--accent-green)',
  className = '',
}) {
  // Deterministic slight rotation for handcrafted feel based on title length
  const rotation = (((title || '').length % 7) * 0.15 - 0.45).toFixed(2) + 'deg';

  return (
    <motion.div
      className={`${styles.sectionHeader} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ transform: `rotate(${rotation})` }}
    >
      <div className={styles.sectionHeaderInner}>
        <div className={styles.sectionTitleRow}>
          <span className={styles.sectionPrompt}>{'>'}</span>
          <GlitchText
            text={title}
            tag="h2"
            className={styles.sectionTitle}
            intensity="low"
          />
        </div>
        {subtitle && (
          <p className={styles.sectionSubtitle}>{subtitle}</p>
        )}
        <span
          className={styles.sectionAccent}
          style={{ background: accent }}
        />
      </div>
    </motion.div>
  );
}
