import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import html2canvas from 'html2canvas';
import { useApp } from '../../context/AppContext';
import styles from './ExportCard.module.css';
import { getScoreColor, getScoreLabel, formatNumber } from '../../utils/helpers';

const SECURITY_FINDINGS = [
  {
    id: 'SEC-001',
    vuln: 'Hardcoded AWS Access Key ID',
    cwe: 'CWE-798: Use of Hard-coded Credentials',
    cvss: '9.8 (Critical)',
    file: 'config/aws.js',
    func: 'initializeAWS()',
    evidence: 'const ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";',
    attackPath: '1. Access repository code ➔ 2. Scan for high-entropy strings ➔ 3. Extract active credentials ➔ 4. Gain full AWS console access.',
    remediation: 'Extract keys to environment variables and utilize dotenv configurations.',
    diff: `-const ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
+const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;`,
    patchHash: 'sha256-a19f2b87c093a18e24c29188e404b901a',
    testResults: 'PASS: Security checklist "AWS credential checks" completed successfully.',
    verification: 'PASS: Verified dynamic secret extraction via mock STS client.'
  },
  {
    id: 'SEC-002',
    vuln: 'SQL Injection in User Login',
    cwe: 'CWE-89: Improper Neutralization of Special Elements used in an SQL Command',
    cvss: '8.8 (High)',
    file: 'server/controllers/auth.js',
    func: 'loginUser()',
    evidence: 'const query = `SELECT * FROM users WHERE email = \'${email}\'`;',
    attackPath: '1. Input malicious email string ➔ 2. Subvert SQL query boundaries ➔ 3. Bypass authorization gates ➔ 4. Dump entire user database.',
    remediation: 'Use parameterized/prepared SQL statement arguments instead of direct concatenation.',
    diff: `-const query = \`SELECT * FROM users WHERE email = '\${email}'\`;
+const query = "SELECT * FROM users WHERE email = ?";`,
    patchHash: 'sha256-d7a228f8f9024ab7720d18b2f1501c34a',
    testResults: 'PASS: 8 SQL Inject fuzzing cases passed with rejection status.',
    verification: 'PASS: DB client syntax validator confirms parameter bindings.'
  }
];

export default function ExportCard() {
  const { state } = useApp();
  const { repoData, analysisResult } = state;
  const [activeView, setActiveView] = useState('report');
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef(null);

  if (!repoData || !analysisResult) return null;

  const repo = repoData.repo;
  const score = analysisResult.metrics?.overall ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  const metrics = analysisResult.metrics || {};

  const handleExport = async () => {
    if (!cardRef.current || exporting) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0a0a0f',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `devinspect-${repo.name}-${activeView}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
    setExporting(false);
  };

  const views = {
    report: { label: 'Report Card', emoji: '📊' },
    recruiter: { label: 'Recruiter View', emoji: '👔' },
    cto: { label: 'CTO View', emoji: '🚀' },
    security: { label: 'Security Audit', emoji: '🛡️' },
  };

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <span className={styles.prefix}>{'>'} EXPORT & SHARE</span>
        <span className={styles.sub}>shareable report cards</span>
      </div>

      <div className={styles.viewTabs}>
        {Object.entries(views).map(([key, view]) => (
          <button
            key={key}
            className={`${styles.viewTab} ${activeView === key ? styles.viewTabActive : ''}`}
            onClick={() => setActiveView(key)}
          >
            {view.emoji} {view.label}
          </button>
        ))}
      </div>

      {/* The exportable card */}
      <div className={styles.cardWrapper}>
        <div ref={cardRef} className={`${styles.card} ${activeView === 'security' ? styles.cardWide : ''}`}>
          <div className={styles.cardBrand}>
            <span className={styles.cardBrandName}>DEVINSPECT AI</span>
            <span className={styles.cardBrandSub}>repository inspection report</span>
          </div>

          <div className={styles.cardRepo}>
            <h3 className={styles.cardRepoName}>{repo.full_name}</h3>
            {repo.description && (
              <p className={styles.cardRepoDesc}>{repo.description}</p>
            )}
            <div className={styles.cardStats}>
              <span>⭐ {formatNumber(repo.stargazers_count)}</span>
              <span>🔱 {formatNumber(repo.forks_count)}</span>
              <span>📅 {new Date(repo.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className={styles.cardScore}>
            <div className={styles.cardScoreCircle} style={{ borderColor: scoreColor }}>
              <span className={styles.cardScoreValue} style={{ color: scoreColor }}>{score}</span>
            </div>
            <span className={styles.cardScoreLabel} style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>

          {activeView === 'report' && (
            <div className={styles.cardMetrics}>
              <MetricRow label="Documentation" score={metrics.documentationDensity?.score} />
              <MetricRow label="Deployment" score={metrics.deploymentConfidence?.score} />
              <MetricRow label="Portfolio Value" score={metrics.portfolioValue?.score} />
              <MetricRow label="Production Ready" score={metrics.productionReadiness?.score} />
              <MetricRow label="Open Source" score={metrics.openSourceFriendliness?.score} />
            </div>
          )}

          {activeView === 'recruiter' && (
            <div className={styles.cardMetrics}>
              <MetricRow label="Portfolio Value" score={metrics.portfolioValue?.score} />
              <MetricRow label="Documentation" score={metrics.documentationDensity?.score} />
              <MetricRow label="Deployment" score={metrics.deploymentConfidence?.score} />
              <MetricRow label="Originality" score={metrics.tutorialDependency?.score} />
              <MetricRow label="README Quality" score={metrics.readmePowerLevel?.score} />
            </div>
          )}

          {activeView === 'cto' && (
            <div className={styles.cardMetrics}>
              <MetricRow label="Production Ready" score={metrics.productionReadiness?.score} />
              <MetricRow label="Tech Debt" score={metrics.technicalDebtForecast?.score} />
              <MetricRow label="Architecture" score={metrics.openSourceFriendliness?.score} />
              <MetricRow label="Market Ready" score={metrics.founderHallucination?.score} />
              <MetricRow label="Deployment" score={metrics.deploymentConfidence?.score} />
            </div>
          )}

          {activeView === 'security' && (
            <div className={styles.securityReport}>
              <div className={styles.reportSectionTitle}>AUTOMATED SECURITY AUDIT REPORT</div>
              <div className={styles.scanMeta}>
                <span><strong>Scan ID:</strong> DI-SCAN-{(repo.id ?? 1849204).toString(16).toUpperCase()}</span>
                <span><strong>Timestamp:</strong> {new Date().toISOString()}</span>
              </div>

              {SECURITY_FINDINGS.map((finding) => (
                <div key={finding.id} className={styles.findingItem}>
                  <div className={styles.findingHeader}>
                    <span className={styles.findingId}>{finding.id}</span>
                    <span className={styles.findingCwe}>{finding.cwe}</span>
                    <span className={styles.findingCvss}>CVSS: {finding.cvss}</span>
                  </div>

                  <div className={styles.findingDescGrid}>
                    <div><strong>Vulnerability:</strong> {finding.vuln}</div>
                    <div><strong>Affected File:</strong> {finding.file}</div>
                    <div><strong>Affected Function:</strong> {finding.func}</div>
                  </div>

                  <div className={styles.findingTexts}>
                    <div><strong>Attack Path:</strong> {finding.attackPath}</div>
                    <div><strong>Remediation:</strong> {finding.remediation}</div>
                  </div>

                  {/* Evidence Chain Diagram */}
                  <div className={styles.chainContainer}>
                    <div className={styles.chainTitle}>EVIDENCE CHAIN</div>
                    <div className={styles.chainFlow}>
                      <div className={styles.chainNode}>
                        <div className={styles.nodeKey}>Finding ID</div>
                        <div className={styles.nodeValue}>{finding.id}</div>
                      </div>
                      <div className={styles.chainConnector}>➔</div>
                      <div className={styles.chainNode}>
                        <div className={styles.nodeKey}>Scanner Evidence</div>
                        <div className={styles.nodeValue}><code>{finding.evidence}</code></div>
                      </div>
                      <div className={styles.chainConnector}>➔</div>
                      <div className={styles.chainNode}>
                        <div className={styles.nodeKey}>AI Reasoning</div>
                        <div className={styles.nodeValue}>Active credentials exposure inside static source files.</div>
                      </div>
                      <div className={styles.chainConnector}>➔</div>
                      <div className={styles.chainNode}>
                        <div className={styles.nodeKey}>Patch Hash</div>
                        <div className={styles.nodeValue}><code>{finding.patchHash.substring(7, 19)}</code></div>
                      </div>
                      <div className={styles.chainConnector}>➔</div>
                      <div className={styles.chainNode}>
                        <div className={styles.nodeKey}>Test Results</div>
                        <div className={styles.nodeValue}>{finding.testResults}</div>
                      </div>
                      <div className={styles.chainConnector}>➔</div>
                      <div className={styles.chainNode}>
                        <div className={styles.nodeKey}>Verification Result</div>
                        <div className={styles.nodeValue}>{finding.verification}</div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.diffWrapper}>
                    <div className={styles.diffHeader}>Git Patch Diff</div>
                    <pre className={styles.diffPre}>
                      {finding.diff.split('\n').map((line, idx) => (
                        <div
                          key={idx}
                          className={line.startsWith('+') ? styles.diffAdd : line.startsWith('-') ? styles.diffRemove : ''}
                        >
                          {line}
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysisResult.roastLine && activeView !== 'security' && (
            <div className={styles.cardRoast}>
              "{analysisResult.roastLine}"
            </div>
          )}

          <div className={styles.cardFooter}>
            <span>devinspect.ai</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.exportBtn} onClick={handleExport} disabled={exporting}>
          {exporting ? '⏳ Exporting...' : '📥 Download as PNG'}
        </button>
        <button className={styles.printBtn} onClick={() => window.print()}>
          🖨️ Export PDF Report
        </button>
      </div>
    </motion.section>
  );
}

function MetricRow({ label, score }) {
  const s = score ?? 0;
  const color = getScoreColor(s);
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <div className={styles.metricBar}>
        <div
          className={styles.metricBarFill}
          style={{ width: `${s}%`, backgroundColor: color }}
        />
      </div>
      <span className={styles.metricValue} style={{ color }}>{s}</span>
    </div>
  );
}
