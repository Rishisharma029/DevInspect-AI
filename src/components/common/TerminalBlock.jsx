import styles from './common.module.css';

export default function TerminalBlock({ children, title, className = '' }) {
  return (
    <div className={`${styles.terminalBlock} ${className}`}>
      <div className={styles.terminalHeader}>
        <div className={styles.terminalDots}>
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
        </div>
        {title && <span className={styles.terminalTitle}>{title}</span>}
      </div>
      <div className={styles.terminalBody}>
        {children}
      </div>
    </div>
  );
}
