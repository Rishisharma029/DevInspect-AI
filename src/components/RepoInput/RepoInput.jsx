import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { parseGitHubUrl, storage } from '../../utils/helpers';
import { EASTER_EGG_KEYS } from '../../utils/constants';
import styles from './RepoInput.module.css';

export default function RepoInput({ onSubmit, onSettingsClick }) {
  const { state } = useApp();
  const [url, setUrl] = useState('');
  const [shaking, setShaking] = useState(false);
  const [recentScans] = useState(() => storage.get(EASTER_EGG_KEYS.SCAN_HISTORY, []));

  const handleSubmit = useCallback(
    (inputUrl) => {
      const targetUrl = inputUrl || url;
      const parsed = parseGitHubUrl(targetUrl);

      if (!parsed) {
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
        return;
      }

      // Save to recent scans
      const fullUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
      const history = storage.get(EASTER_EGG_KEYS.SCAN_HISTORY, []);
      const filtered = history.filter((h) => h.url !== fullUrl);
      const existingEntry = history.find((h) => h.url === fullUrl);
      const updated = [
        { 
          url: fullUrl, 
          owner: parsed.owner, 
          repo: parsed.repo, 
          time: Date.now(),
          runs: existingEntry?.runs || []
        },
        ...filtered,
      ].slice(0, 8);
      storage.set(EASTER_EGG_KEYS.SCAN_HISTORY, updated);

      onSubmit(fullUrl);
    },
    [url, onSubmit]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = useCallback((e) => {
    const pastedText = e.clipboardData.getData('text');
    const parsed = parseGitHubUrl(pastedText);
    if (parsed) {
      setUrl(pastedText);
      handleSubmit(pastedText);
    }
  }, [handleSubmit]);

  const handleRecentClick = (scanUrl) => {
    setUrl(scanUrl);
    handleSubmit(scanUrl);
  };

  const hasToken = !!state.settings.githubToken;
  const isValidUrl = !!parseGitHubUrl(url);

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={styles.inputWrapper}>
        {/* Terminal-styled input */}
        <div
          className={`${styles.terminalInputRow} ${shaking ? styles.shakeRow : ''}`}
        >
          <span className={styles.prompt}>
            <span className={styles.promptUser}>devinspect</span>
            <span className={styles.promptAt}>@</span>
            <span className={styles.promptHost}>ai</span>
            <span className={styles.promptAt}>:</span>
            <span className={styles.promptPath}>~</span>
            <span className={styles.promptAt}>$ </span>
            <span className={styles.promptCmd}>inspect </span>
          </span>
          <input
            type="text"
            className={`${styles.input} ${shaking ? styles.shake : ''}`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="https://github.com/username/repository"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Submit button */}
        <motion.button
          className={`${styles.submitBtn} ${isValidUrl ? styles.submitBtnReady : ''}`}
          onClick={() => handleSubmit()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          INITIATE SCAN
        </motion.button>

        {/* Status line */}
        <div className={styles.statusLine}>
          <div className={styles.tokenStatus}>
            <span
              className={`${styles.tokenDot} ${
                hasToken ? styles.tokenDotGreen : styles.tokenDotRed
              }`}
            />
            <span>
              {hasToken
                ? 'GitHub token configured'
                : 'No GitHub token configured — rate limits apply'}
            </span>
          </div>

          <button
            className={styles.settingsBtn}
            onClick={onSettingsClick}
            type="button"
          >
            ⚙ config
          </button>
        </div>
      </div>

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <motion.div
          className={styles.recentScans}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className={styles.recentTitle}>// recent scans</div>
          <div className={styles.recentList}>
            {recentScans.map((scan) => (
              <button
                key={scan.url}
                className={styles.recentItem}
                onClick={() => handleRecentClick(scan.url)}
                type="button"
              >
                <span>
                  {scan.owner}/{scan.repo}
                </span>
                <span className={styles.recentTime}>
                  {getRelativeTime(scan.time)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}

function getRelativeTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
