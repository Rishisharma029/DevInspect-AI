import { useCallback } from 'react';
import { useApp } from './context/AppContext';
import { SCAN_STATES, SCAN_MESSAGES, EASTER_EGG_KEYS } from './utils/constants';
import { parseGitHubUrl, delay, storage } from './utils/helpers';

/* Components */
import Hero from './components/Hero/Hero';
import RepoInput from './components/RepoInput/RepoInput';
import ScanPhase from './components/ScanPhase/ScanPhase';
import RepoOverview from './components/RepoOverview/RepoOverview';
import ExecutiveSecurityDashboard from './components/ExecutiveSecurityDashboard/ExecutiveSecurityDashboard';
import RiskBoard from './components/RiskBoard/RiskBoard';
import MetricsDashboard from './components/MetricsDashboard/MetricsDashboard';
import PersonaReviews from './components/PersonaReviews/PersonaReviews';
import ArchitectureAnalysis from './components/ArchitectureAnalysis/ArchitectureAnalysis';
import DocumentationAnalysis from './components/DocumentationAnalysis/DocumentationAnalysis';
import ImprovementRoadmap from './components/ImprovementRoadmap/ImprovementRoadmap';
import ExportCard from './components/ExportCard/ExportCard';
import Settings from './components/Settings/Settings';
import CRTOverlay from './components/common/CRTOverlay';

/* Easter Eggs */
import { RecruiterTyping, BurnoutMeter, TouchGrass, HumanityCheck } from './components/EasterEggs/EasterEggs';

/* Services */
import { fetchAllRepoData } from './services/github';
import { analyzeRepository } from './services/analyzer';
import { calculateAllMetrics } from './services/metrics';
import { runAllDetections } from './services/detection';
import { generateInspection, generateFallbackInspection } from './services/ai';

import './App.css';

export default function App() {
  const { state, dispatch } = useApp();
  const { scanState, analysisResult } = state;

  // The core scan + analysis pipeline
  const runInspection = useCallback(async (url) => {
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid GitHub URL. Try: https://github.com/owner/repo' });
      return;
    }

    dispatch({ type: 'START_SCAN', payload: url });

    try {
      // Phase 1: Scan — Fetch all GitHub data
      const token = state.settings.githubToken;
      let messageIndex = 0;

      // Simulate scan messages while fetching
      const messageInterval = setInterval(() => {
        if (messageIndex < SCAN_MESSAGES.length - 1) {
          const msg = SCAN_MESSAGES[messageIndex];
          dispatch({
            type: 'UPDATE_SCAN_PROGRESS',
            payload: {
              progress: Math.min(95, ((messageIndex + 1) / SCAN_MESSAGES.length) * 100),
              message: msg,
            },
          });
          messageIndex++;
        }
      }, 400);

      const repoData = await fetchAllRepoData(parsed.owner, parsed.repo, token);
      clearInterval(messageInterval);

      // Fire remaining messages quickly
      while (messageIndex < SCAN_MESSAGES.length) {
        dispatch({
          type: 'UPDATE_SCAN_PROGRESS',
          payload: {
            progress: Math.min(99, ((messageIndex + 1) / SCAN_MESSAGES.length) * 100),
            message: SCAN_MESSAGES[messageIndex],
          },
        });
        messageIndex++;
        await delay(100);
      }

      dispatch({ type: 'SCAN_COMPLETE', payload: repoData });

      // Phase 2: Analysis
      const analysis = analyzeRepository(repoData);
      const metrics = calculateAllMetrics(analysis, repoData);
      const detections = runAllDetections(analysis, metrics, repoData);

      // Phase 3: AI Inspection (or fallback)
      let aiReview = null;
      let personaReviews = {};
      let improvementRoadmap = [];
      let roastLine = '';

      const geminiKey = state.settings.geminiApiKey;
      if (geminiKey) {
        try {
          const aiResult = await generateInspection(geminiKey, analysis, metrics, repoData);
          personaReviews = aiResult.personaReviews || {};
          improvementRoadmap = aiResult.improvementRoadmap || [];
          roastLine = aiResult.roastLine || '';
          aiReview = aiResult;
        } catch (err) {
          console.warn('AI inspection failed, using fallback:', err);
          const fallback = generateFallbackInspection(analysis, metrics);
          personaReviews = fallback.personaReviews;
          improvementRoadmap = fallback.improvementRoadmap;
          roastLine = fallback.roastLine;
        }
      } else {
        const fallback = generateFallbackInspection(analysis, metrics);
        personaReviews = fallback.personaReviews;
        improvementRoadmap = fallback.improvementRoadmap;
        roastLine = fallback.roastLine;
      }

      // Save run results to history runs in localStorage
      const latestCommitSha = repoData?.commits?.[0]?.sha?.substring(0, 7) || 'unknown';
      const overallScore = metrics.overallScore;
      const fullUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
      const history = storage.get(EASTER_EGG_KEYS.SCAN_HISTORY, []);
      const filtered = history.filter((h) => h.url.toLowerCase() !== fullUrl.toLowerCase());
      const existingEntry = history.find((h) => h.url.toLowerCase() === fullUrl.toLowerCase());
      const runs = existingEntry?.runs || [];
      const newRun = {
        score: overallScore,
        sha: latestCommitSha,
        date: new Date().toISOString(),
      };
      const updatedEntry = {
        url: fullUrl,
        owner: parsed.owner,
        repo: parsed.repo,
        time: Date.now(),
        runs: [...runs, newRun].slice(-10), // keep last 10 runs
      };
      const updatedHistory = [updatedEntry, ...filtered].slice(0, 8);
      storage.set(EASTER_EGG_KEYS.SCAN_HISTORY, updatedHistory);

      dispatch({
        type: 'ANALYSIS_COMPLETE',
        payload: {
          analysis,
          metrics,
          detections,
          personaReviews,
          improvementRoadmap,
          roastLine,
          aiReview,
        },
      });

    } catch (err) {
      console.error('Inspection failed:', err);
      dispatch({
        type: 'SET_ERROR',
        payload: err.message || 'Something went wrong during inspection.',
      });
    }
  }, [dispatch, state.settings.githubToken, state.settings.geminiApiKey]);


  const isSettingsOpen = state.easterEggs._settingsOpen || false;

  const overallScore = analysisResult?.metrics?.overall ?? 0;

  return (
    <div className="app">
      <CRTOverlay />
      
      {/* Idle state: Hero + Input */}
      {scanState === SCAN_STATES.IDLE && (
        <>
          <Hero />
          <RepoInput
            onSubmit={runInspection}
            onSettingsClick={() => dispatch({ type: 'SET_EASTER_EGG', payload: { _settingsOpen: true } })}
          />
        </>
      )}

      {/* Scanning state */}
      {scanState === SCAN_STATES.SCANNING && (
        <ScanPhase />
      )}

      {/* Analyzing state */}
      {scanState === SCAN_STATES.ANALYZING && (
        <ScanPhase analyzing />
      )}

      {/* Complete state: Full results */}
      {scanState === SCAN_STATES.COMPLETE && analysisResult && (
        <div className="results">
          {/* Back / New Scan button */}
          <div className="results-nav">
            <button
              className="nav-btn"
              onClick={() => dispatch({ type: 'RESET_SCAN' })}
            >
              ← NEW SCAN
            </button>
          </div>

          <RepoOverview />
          <div className="section-divider" />
          <ExecutiveSecurityDashboard />
          <div className="section-divider" />
          <RiskBoard />
          <div className="section-divider" />
          <MetricsDashboard />
          <div className="section-divider" />
          <PersonaReviews />
          <div className="section-divider" />
          <ArchitectureAnalysis />
          <div className="section-divider" />
          <DocumentationAnalysis />
          <div className="section-divider" />
          <ImprovementRoadmap />
          <div className="section-divider" />
          <ExportCard />

          {/* Easter Eggs */}
          <RecruiterTyping />
          <BurnoutMeter />
          <TouchGrass />
          <HumanityCheck score={overallScore} />
        </div>
      )}

      {/* Error state */}
      {scanState === SCAN_STATES.ERROR && (
        <div className="error-screen">
          <div className="error-content">
            <span className="error-icon">💥</span>
            <h2 className="error-title">INSPECTION FAILED</h2>
            <p className="error-message">{state.error}</p>
            <p className="error-humor">
              {state.error?.includes('404')
                ? 'This repository exists only in your imagination.'
                : state.error?.includes('rate')
                ? 'GitHub has rate-limited your enthusiasm.'
                : 'Even senior engineers fail sometimes.'}
            </p>
            <button
              className="btn"
              onClick={() => dispatch({ type: 'RESET_SCAN' })}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => dispatch({ type: 'SET_EASTER_EGG', payload: { _settingsOpen: false } })}
      />

      {/* Footer */}
      <footer className="app-footer">
        <span className="footer-text">
          DEVINSPECT AI — built by a sleep-deprived developer at 3AM
        </span>
        <span className="footer-version">v1.0.0</span>
      </footer>
    </div>
  );
}
