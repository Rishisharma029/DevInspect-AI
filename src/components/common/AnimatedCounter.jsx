import { useState, useEffect, useRef } from 'react';
import styles from './common.module.css';

export default function AnimatedCounter({
  target = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    function startCount() {
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quart for natural deceleration
        const eased = 1 - Math.pow(1 - progress, 4);

        const isFloat = !Number.isInteger(target);
        const current = eased * target;

        setValue(isFloat ? parseFloat(current.toFixed(1)) : Math.round(current));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          startCount();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return (
    <span className={`${styles.counter} ${className}`} ref={ref}>
      {prefix && <span className={styles.counterPrefix}>{prefix}</span>}
      {value}
      {suffix && <span className={styles.counterSuffix}>{suffix}</span>}
    </span>
  );
}
