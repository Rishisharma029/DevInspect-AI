import { useState, useEffect } from 'react';
import styles from './common.module.css';

const INTERVALS = {
  low: { min: 4000, max: 7000 },
  medium: { min: 3000, max: 5000 },
  high: { min: 2000, max: 3500 },
};

export default function GlitchText({
  text,
  tag: Tag = 'span',
  className = '',
  intensity = 'medium',
}) {
  const [glitching, setGlitching] = useState(false);

  const intensityClass =
    intensity === 'low'
      ? styles.glitchLow
      : intensity === 'high'
      ? styles.glitchHigh
      : styles.glitchMedium;

  useEffect(() => {
    let mainTimeoutId;
    let burstTimeoutId;

    const run = () => {
      const { min, max } = INTERVALS[intensity] || INTERVALS.medium;
      const delay = Math.random() * (max - min) + min;

      mainTimeoutId = setTimeout(() => {
        setGlitching(true);

        const burstDuration = intensity === 'high' ? 800 : intensity === 'low' ? 400 : 600;

        burstTimeoutId = setTimeout(() => {
          setGlitching(false);
          run();
        }, burstDuration);
      }, delay);
    };

    run();

    return () => {
      clearTimeout(mainTimeoutId);
      clearTimeout(burstTimeoutId);
    };
  }, [intensity]);

  return (
    <Tag
      className={`${styles.glitchText} ${intensityClass} ${glitching ? styles.glitching : ''} ${className}`}
      data-text={text}
    >
      {text}
    </Tag>
  );
}
