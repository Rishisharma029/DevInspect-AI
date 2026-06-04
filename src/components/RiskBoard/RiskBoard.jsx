import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './RiskBoard.module.css';

export default function RiskBoard() {
  const { state } = useApp();
  const { analysisResult } = state;

  if (!analysisResult) return null;

  const securityRisks = analysisResult.analysis?.securityRisks || [];
  const maintainabilityRisks = analysisResult.analysis?.maintainabilityRisks || [];
  const testIssues = analysisResult.analysis?.testIssues || [];

  const totalRisks = securityRisks.length + maintainabilityRisks.length + testIssues.length;

  if (totalRisks === 0) {
    return (
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <span className={styles.terminalPrefix}>{'>'} DIAGNOSTICS BOARD</span>
          <span className={styles.summaryClean}>SYSTEMS NOMINAL — 0 RISKS DETECTED</span>
        </div>
        <div className={styles.cleanState}>
          <span className={styles.cleanIcon}>🛡️</span>
          <p className={styles.cleanText}>No critical file exposures, nesting issues, or missing setup warnings found. Excellent hygiene!</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <span className={styles.terminalPrefix}>{'>'} DIAGNOSTICS BOARD</span>
        <span className={styles.summaryAlert}>ATTENTION REQUIRED — {totalRisks} RISKS DETECTED</span>
      </div>

      <div className={styles.grid}>
        {/* Security Risks */}
        <div className={`${styles.riskCard} ${styles.securityCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>⚠️</span>
            <h3>SECURITY RISKS ({securityRisks.length})</h3>
          </div>
          {securityRisks.length === 0 ? (
            <p className={styles.noRisksText}>✓ No exposed secrets or private keys detected in paths.</p>
          ) : (
            <ul className={styles.riskList}>
              {securityRisks.map((risk, index) => (
                <li key={index} className={styles.riskItem}>
                  <span className={`${styles.badge} ${styles.badgeCritical}`}>{risk.label}</span>
                  <p className={styles.riskDesc}>{risk.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Maintainability Risks */}
        <div className={`${styles.riskCard} ${styles.maintainabilityCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>⚙️</span>
            <h3>MAINTAINABILITY RISKS ({maintainabilityRisks.length})</h3>
          </div>
          {maintainabilityRisks.length === 0 ? (
            <p className={styles.noRisksText}>✓ Directory structure and ignore configs conform to standards.</p>
          ) : (
            <ul className={styles.riskList}>
              {maintainabilityRisks.map((risk, index) => (
                <li key={index} className={styles.riskItem}>
                  <span className={`${styles.badge} ${styles.badgeWarning}`}>{risk.label}</span>
                  <p className={styles.riskDesc}>{risk.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Test Suite Issues */}
        <div className={`${styles.riskCard} ${styles.testCard}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>🧪</span>
            <h3>TESTING SUITE ({testIssues.length})</h3>
          </div>
          {testIssues.length === 0 ? (
            <p className={styles.noRisksText}>✓ Testing frameworks and suites successfully located.</p>
          ) : (
            <ul className={styles.riskList}>
              {testIssues.map((risk, index) => (
                <li key={index} className={styles.riskItem}>
                  <span className={`${styles.badge} ${styles.badgeInfo}`}>{risk.label}</span>
                  <p className={styles.riskDesc}>{risk.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.section>
  );
}
