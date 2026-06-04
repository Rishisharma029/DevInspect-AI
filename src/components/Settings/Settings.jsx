import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { storage } from '../../utils/helpers';
import { EASTER_EGG_KEYS } from '../../utils/constants';
import styles from './Settings.module.css';

export default function Settings({ isOpen, onClose }) {
  const { state, updateSettings } = useApp();
  const [githubToken, setGithubToken] = useState(state.settings.githubToken || '');
  const [geminiApiKey, setGeminiApiKey] = useState(state.settings.geminiApiKey || '');
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    updateSettings({ githubToken, geminiApiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [githubToken, geminiApiKey, updateSettings]);

  const handleClearHistory = useCallback(() => {
    storage.remove(EASTER_EGG_KEYS.SCAN_HISTORY);
    // Force a small UI feedback
    setSaved(false);
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={handleOverlayClick}
          onKeyDown={handleKeyDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            {/* Header */}
            <div className={styles.header}>
              <span className={styles.headerTitle}>CONFIGURATION</span>
              <button
                className={styles.closeBtn}
                onClick={onClose}
                type="button"
              >
                ESC
              </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
              {/* GitHub Token */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="gh-token">
                  GitHub Personal Access Token
                </label>
                <input
                  id="gh-token"
                  type="password"
                  className={styles.input}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  spellCheck={false}
                  autoComplete="off"
                />
                <span className={styles.helperText}>
                  Increases rate limit from 60 to 5,000 requests/hr. 
                  Generate at GitHub → Settings → Developer settings → Tokens.
                  No special scopes needed for public repos.
                </span>
              </div>

              {/* Gemini API Key */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="gemini-key">
                  Gemini API Key
                </label>
                <input
                  id="gemini-key"
                  type="password"
                  className={styles.input}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  spellCheck={false}
                  autoComplete="off"
                />
                <span className={styles.helperText}>
                  Powers the AI persona analysis. Get a free key from 
                  Google AI Studio (aistudio.google.com).
                </span>
              </div>

              {/* Saved message */}
              <AnimatePresence>
                {saved && (
                  <motion.div
                    className={styles.savedMsg}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ✓ Configuration saved
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className={styles.actions}>
                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  type="button"
                >
                  Save Config
                </button>
                <button
                  className={styles.clearBtn}
                  onClick={handleClearHistory}
                  type="button"
                >
                  Clear History
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
