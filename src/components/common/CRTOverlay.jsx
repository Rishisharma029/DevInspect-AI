import styles from './common.module.css';

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

export default function CRTOverlay() {
  return (
    <div className={styles.crtWrapper} aria-hidden="true">
      {/* Scanlines */}
      <div className={styles.scanlines} />

      {/* Vignette */}
      <div className={styles.vignette} />

      {/* Animated noise texture */}
      <div
        className={styles.noise}
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />

      {/* Horizontal flicker sweep line */}
      <div className={styles.flickerLine} />
    </div>
  );
}
