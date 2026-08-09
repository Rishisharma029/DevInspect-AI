import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './ExecutiveSecurityDashboard.module.css';

const MOCK_VULNERABILITIES = [
  {
    id: 'VULN-001',
    title: 'Hardcoded AWS Access Key ID',
    severity: 'CRITICAL',
    badgeClass: styles.badgeCritical,
    status: 'Verified Fix',
    evidence: {
      file: 'config/aws.js',
      line: 14,
      code: 'const ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";\nconst SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";',
    },
    reasoning: 'Committing credentials to version control exposes cloud environments to automated scraper bots. AWS keys committed to public or private repos are frequently compromised within minutes, leading to resource hijacking, data breaches, and massive cloud bills.',
    patch: 'Remove the hardcoded strings and reference standard AWS environment variables or use a secrets manager. Ensure the config file loads these parameters dynamically at startup.',
    diff: `-const ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
-const SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
+const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
+const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;`,
    verification: 'Command: `node -e "require(\'./config/aws\')"`\nResult: Successfully verified keys are retrieved from system environment variables. Local stub checks pass and no warning flag raised.',
  },
  {
    id: 'VULN-002',
    title: 'SQL Injection in User Login Controller',
    severity: 'HIGH',
    badgeClass: styles.badgeHigh,
    status: 'Verified Fix',
    evidence: {
      file: 'server/controllers/auth.js',
      line: 42,
      code: 'const query = `SELECT * FROM users WHERE email = \'${email}\' AND password = \'${password}\'`;\ndb.query(query, (err, result) => { ... });',
    },
    reasoning: 'Directly interpolating user variables into SQL query strings bypasses query structure parsing. Attackers can input payload strings (like "\' OR \'1\'=\'1") to bypass authentication entirely or extract database tables.',
    patch: 'Utilize parameterized queries or an ORM that safely escapes parameter inputs. Never concatenate or interpolate raw inputs into database commands.',
    diff: `-const query = \`SELECT * FROM users WHERE email = '\${email}' AND password = '\${password}'\`;
-db.query(query, (err, result) => { ... });
+const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
+db.query(query, [email, password], (err, result) => { ... });`,
    verification: 'Command: `npm run test:security -- --grep "SQL Injection"`\nResult: 5 test cases executed. Checked bypass payloads against username/password fields. All payloads correctly escaped; zero rows returned.',
  },
  {
    id: 'VULN-003',
    title: 'Insecure Deserialization via node-serialize',
    severity: 'HIGH',
    badgeClass: styles.badgeHigh,
    status: 'Verified Fix',
    evidence: {
      file: 'middleware/session.js',
      line: 28,
      code: 'const serialize = require(\'node-serialize\');\nconst session = serialize.unserialize(Buffer.from(req.cookies.sess, \'base64\').toString());',
    },
    reasoning: 'Using unsafe deserialization functions on user-controlled inputs (like cookies) allows remote code execution (RCE). An attacker can supply a serialized object containing a self-executing function payload to execute arbitrary shell commands inside the application environment.',
    patch: 'Replace node-serialize with standard JSON parsing or securely signed JWT cookies. Enable strict validation and cryptography signatures on session records.',
    diff: `-const serialize = require('node-serialize');
-const session = serialize.unserialize(Buffer.from(req.cookies.sess, 'base64').toString());
+const jwt = require('jsonwebtoken');
+const session = jwt.verify(req.cookies.sess, process.env.JWT_SECRET);`,
    verification: 'Command: `curl -b "sess=eyJfX05EX0ZVTkNfXyI6ICJmdW5jdGlvbi...}" http://localhost:8080/dashboard`\nResult: Server rejected request with `401 Unauthorized`. Exploit payload did not execute, confirming patch effectiveness.',
  },
  {
    id: 'VULN-004',
    title: 'Command Injection in Document Converter Utility',
    severity: 'HIGH',
    badgeClass: styles.badgeHigh,
    status: 'Failed Verification',
    evidence: {
      file: 'utils/converter.js',
      line: 18,
      code: 'const { exec } = require(\'child_process\');\nexec(`pandoc ${filename} -o ${outputPath}`, callback);',
    },
    reasoning: 'Invoking command shells (like exec) with raw string arguments that incorporate user input allows command separators (like ";", "&&", or "|") to run additional operating system commands.',
    patch: 'Avoid running subshells using exec. Use child_process.execFile or spawn, which pass arguments safely as an array directly to the executable without shell parsing.',
    diff: `-const { exec } = require('child_process');
-exec(\`pandoc \${filename} -o \${outputPath}\`, callback);
+const { execFile } = require('child_process');
+execFile('pandoc', [filename, '-o', outputPath], callback);`,
    verification: 'Command: `node utils/converter.js "doc.md; rm -rf /"`\nResult: Command execution failed because system is still processing raw input somewhere inside wrapper code. Remediation verification failed. Retest required.',
  },
  {
    id: 'VULN-005',
    title: 'Path Traversal in Public File Server',
    severity: 'MEDIUM',
    badgeClass: styles.badgeMedium,
    status: 'Verified Fix',
    evidence: {
      file: 'server/static.js',
      line: 12,
      code: 'const file = path.join(__dirname, \'public\', req.query.path);\nres.sendFile(file);',
    },
    reasoning: 'Joining user input query paths without restriction permits directory traversal using "../" notation. Attackers can read sensitive host configurations, packages, or code files from adjacent directories.',
    patch: 'Resolve the absolute path and explicitly check that the resolved path begins with the public assets base directory prefix. Throw an error if a violation is detected.',
    diff: `-const file = path.join(__dirname, 'public', req.query.path);
-res.sendFile(file);
+const safePath = path.resolve(__dirname, 'public', req.query.path);
+if (!safePath.startsWith(path.resolve(__dirname, 'public'))) {
+  return res.status(403).send('Forbidden: Path Traversal Blocked');
+}
+res.sendFile(safePath);`,
    verification: 'Command: `curl http://localhost:8080/static?path=../../package.json`\nResult: Server responded with `403 Forbidden: Path Traversal Blocked`. Verification logs recorded access denial.',
  },
  {
    id: 'VULN-006',
    title: 'Cross-Site Scripting (XSS) in Live Comment Thread',
    severity: 'MEDIUM',
    badgeClass: styles.badgeMedium,
    status: 'Verified Fix',
    evidence: {
      file: 'client/components/Comment.jsx',
      line: 15,
      code: 'return (\n  <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }} />\n);',
    },
    reasoning: 'Allowing raw HTML rendering (dangerouslySetInnerHTML) of user comments facilitates cross-site scripting (XSS). Malicious actors can publish comments with embedded script tags, stealing tokens or session cookies from other users viewing the thread.',
    patch: 'Sanitize the HTML using a robust library like DOMPurify or render the comment content as plain text node contents instead of dynamic HTML.',
    diff: `-  <div className="comment-text" dangerouslySetInnerHTML={{ __html: comment.text }} />
+  <div className="comment-text">{comment.text}</div>`,
    verification: 'Command: `npm run test:frontend -- --grep "Comment XSS"`\nResult: Front-end test renders input `<script>alert(1)</script>` as plain text rather than active script execution. DOM verification passed.',
  },
  {
    id: 'VULN-007',
    title: 'Weak Password Hashing (MD5)',
    severity: 'LOW',
    badgeClass: styles.badgeLow,
    status: 'Verified Fix',
    evidence: {
      file: 'services/crypto.js',
      line: 8,
      code: 'const hash = crypto.createHash(\'md5\').update(password).digest(\'hex\');',
    },
    reasoning: 'MD5 is a cryptographically broken hash function. It suffers from collision vulnerabilities and can be cracked almost instantaneously using pre-calculated rainbow tables. Compromised databases easily reveal all passwords.',
    patch: 'Migrate to a strong key-derivation function or hashing algorithm like bcrypt or argon2. Apply a high work factor/rounds setting.',
    diff: `-const hash = crypto.createHash('md5').update(password).digest('hex');
+const bcrypt = require('bcryptjs');
+const hash = await bcrypt.hash(password, 12);`,
    verification: 'Command: `node -e "require(\'./services/crypto\').verifyHashing()"`\nResult: Confirmed bcrypt is used for password digests with 12 rounds. Execution time per hash is ~320ms, conforming to safety parameters.',
  }
];

const FLOW_STEPS = ['Evidence', 'Reasoning', 'Patch', 'Diff', 'Verification'];

export default function ExecutiveSecurityDashboard() {
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const handleVulnClick = (vuln) => {
    setSelectedVuln(vuln);
    setActiveStep(0);
  };

  const handleStepClick = (idx) => {
    setActiveStep(idx);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.terminalPrefix}>{'>'} EXECUTIVE SECURITY DASHBOARD</span>
        <span className={styles.timestamp}>SYS STATUS: DEVIATIONS FOUND</span>
      </div>

      <div className={styles.dashboardContainer}>
        {/* Left Side: Summary Card */}
        <div className={styles.summaryCard}>
          <div className={styles.brandTitle}>
            <span>DEVINSPECT AI</span>
            <span className={styles.pulseDot}></span>
          </div>
          <div className={styles.divider}>────────────────────────────────</div>

          <div className={styles.scoreRow}>
            <span className={styles.scoreLabel}>Security Score</span>
            <span className={styles.scoreValue}>87/100</span>
          </div>

          <div className={styles.severityGrid}>
            <div className={`${styles.sevItem} ${styles.sevCritical}`}>
              <span>CRITICAL</span>
              <span className={styles.sevCount}>02</span>
            </div>
            <div className={`${styles.sevItem} ${styles.sevHigh}`}>
              <span>HIGH</span>
              <span className={styles.sevCount}>07</span>
            </div>
            <div className={`${styles.sevItem} ${styles.sevMedium}`}>
              <span>MEDIUM</span>
              <span className={styles.sevCount}>18</span>
            </div>
            <div className={`${styles.sevItem} ${styles.sevLow}`}>
              <span>LOW</span>
              <span className={styles.sevCount}>31</span>
            </div>
          </div>

          <div className={styles.trendContainer}>
            <div className={styles.trendTitle}>Vulnerability Trend</div>
            <pre className={styles.trendAscii}>
{`        Vulnerability Trend
       ╱╲
   ╱──╯  ╲────╮
──╯          ╰──`}
            </pre>
          </div>

          <div className={styles.remediationSection}>
            <div className={styles.remediationTitle}>REMEDIATION</div>
            <div className={styles.progressBarRow}>
              <span className={styles.asciiBar}>████████████░░</span>
              <span className={styles.barPercentage}>82%</span>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Verified Fixes</span>
              <span className={styles.statVal}>24</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Failed Verification</span>
              <span className={styles.statVal} style={{ color: 'var(--accent-red)' }}>3</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Active Scans</span>
              <span className={styles.statVal}>2</span>
            </div>
          </div>
        </div>

        {/* Right Side: Vulnerability List */}
        <div className={styles.vulnListContainer}>
          <div className={styles.listHeader}>ACTIVE SECURITY CONCERNS</div>
          <div className={styles.vulnList}>
            {MOCK_VULNERABILITIES.map((vuln) => (
              <button
                key={vuln.id}
                onClick={() => handleVulnClick(vuln)}
                className={`${styles.vulnItem} ${selectedVuln?.id === vuln.id ? styles.vulnItemActive : ''}`}
              >
                <div className={styles.vulnMeta}>
                  <span className={`${styles.badge} ${vuln.badgeClass}`}>{vuln.severity}</span>
                  <span className={styles.vulnId}>{vuln.id}</span>
                </div>
                <div className={styles.vulnTitle}>{vuln.title}</div>
                <div className={styles.vulnFooter}>
                  <span className={styles.vulnFile}>{vuln.evidence.file}</span>
                  <span className={`${styles.statusLabel} ${vuln.status.includes('Failed') ? styles.statusFailed : styles.statusVerified}`}>
                    ● {vuln.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vulnerability Drilldown Section */}
      <AnimatePresence>
        {selectedVuln && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className={styles.drilldownSection}
          >
            <div className={styles.drilldownHeader}>
              <div className={styles.drilldownTitleRow}>
                <span className={`${styles.badge} ${selectedVuln.badgeClass}`}>{selectedVuln.severity}</span>
                <h3>{selectedVuln.id}: {selectedVuln.title}</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedVuln(null)}>
                [x] CLOSE DETAILS
              </button>
            </div>

            {/* Step Flow Pipeline */}
            <div className={styles.flowPipeline}>
              {FLOW_STEPS.map((step, idx) => (
                <div key={step} className={styles.pipelineStepContainer}>
                  <button
                    onClick={() => handleStepClick(idx)}
                    className={`${styles.pipelineStep} ${activeStep === idx ? styles.pipelineStepActive : ''} ${activeStep > idx ? styles.pipelineStepCompleted : ''}`}
                  >
                    <span className={styles.stepNum}>0{idx + 1}</span>
                    <span className={styles.stepLabel}>{step}</span>
                  </button>
                  {idx < FLOW_STEPS.length - 1 && (
                    <div className={`${styles.pipelineConnector} ${activeStep > idx ? styles.connectorActive : ''}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Dynamic Content Area based on selected step */}
            <div className={styles.tabContentBlock}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                  className={styles.tabInnerContent}
                >
                  {activeStep === 0 && (
                    <div className={styles.tabPanel}>
                      <h4 className={styles.tabTitle}>VULNERABILITY EVIDENCE DETECTED</h4>
                      <div className={styles.evidenceMeta}>
                        <div><strong>Target File:</strong> <code>{selectedVuln.evidence.file}</code></div>
                        <div><strong>Line Reference:</strong> <code>L{selectedVuln.evidence.line}</code></div>
                      </div>
                      <div className={styles.codeTerminal}>
                        <div className={styles.terminalHeader}>
                          <span className={styles.termDot} style={{ background: '#ff5f56' }} />
                          <span className={styles.termDot} style={{ background: '#ffbd2e' }} />
                          <span className={styles.termDot} style={{ background: '#27c93f' }} />
                          <span className={styles.terminalTitle}>{selectedVuln.evidence.file}</span>
                        </div>
                        <pre className={styles.terminalBody}>
                          <code>{selectedVuln.evidence.code}</code>
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className={styles.tabPanel}>
                      <h4 className={styles.tabTitle}>THREAT MODEL REASONING</h4>
                      <p className={styles.reasoningText}>{selectedVuln.reasoning}</p>
                      <div className={styles.alertBox}>
                        <strong>RISK ANALYSIS:</strong> This vulnerability presents a high likelihood of exploitability if left unremediated in active deployments. Immediate mitigation is strongly recommended.
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className={styles.tabPanel}>
                      <h4 className={styles.tabTitle}>PROPOSED REMEDIATION PATCH</h4>
                      <p className={styles.patchText}>{selectedVuln.patch}</p>
                      <div className={styles.patchNotice}>
                        Ensure standard configurations are applied globally across all active branches.
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className={styles.tabPanel}>
                      <h4 className={styles.tabTitle}>PATCH GIT DIFF PREVIEW</h4>
                      <div className={styles.codeTerminal}>
                        <div className={styles.terminalHeader}>
                          <span className={styles.termDot} style={{ background: '#ff5f56' }} />
                          <span className={styles.termDot} style={{ background: '#ffbd2e' }} />
                          <span className={styles.termDot} style={{ background: '#27c93f' }} />
                          <span className={styles.terminalTitle}>git diff {selectedVuln.evidence.file}</span>
                        </div>
                        <pre className={styles.terminalBody}>
                          {selectedVuln.diff.split('\n').map((line, i) => (
                            <div
                              key={i}
                              className={line.startsWith('+') ? styles.diffAdd : line.startsWith('-') ? styles.diffRemove : ''}
                            >
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className={styles.tabPanel}>
                      <h4 className={styles.tabTitle}>AUTOMATED VERIFICATION LOGS</h4>
                      <pre className={styles.verificationLogs}>
                        {selectedVuln.verification}
                      </pre>
                      <div className={styles.verificationStatusRow}>
                        <span>VERIFICATION STATUS:</span>
                        <span className={selectedVuln.status.includes('Failed') ? styles.statusTextFailed : styles.statusTextSuccess}>
                          {selectedVuln.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons inside details card */}
              <div className={styles.tabNavRow}>
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((p) => p - 1)}
                  className={styles.navStepBtn}
                >
                  [← PREVIOUS STEP]
                </button>
                <button
                  disabled={activeStep === FLOW_STEPS.length - 1}
                  onClick={() => setActiveStep((p) => p + 1)}
                  className={styles.navStepBtn}
                >
                  [NEXT STEP →]
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
