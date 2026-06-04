import { describe, it, expect } from 'vitest';
import { runAllDetections } from './detection';
import { PERSONA_CONFIGS, generateFallbackReview } from './personas';
import { getBurnoutLevel, shouldShowTouchGrass, generateGitLogRegret } from './easterEggs';

describe('DevInspect AI Extra Services', () => {
  describe('Detections Engine', () => {
    it('detects missing readme conditions', () => {
      const analysis = {
        readme: '',
        fileTreeAnalysis: { totalFiles: 0, deploymentFiles: [] },
        readmeAnalysis: { wordCount: 0 },
        cloneDetection: { isClone: false },
        buzzwordAnalysis: { count: 0 },
        repo: { homepage: null }
      };
      const res = runAllDetections(analysis, { overallScore: 10 });
      expect(res.some((d) => d.label.includes('Missing In Action'))).toBe(true);
    });

    it('detects no deployment condition', () => {
      const analysis = {
        readme: 'README exists',
        fileTreeAnalysis: { totalFiles: 5, deploymentFiles: [], hasCI: false, hasDocker: false },
        readmeAnalysis: { wordCount: 100 },
        cloneDetection: { isClone: false },
        buzzwordAnalysis: { count: 0 },
        repo: { homepage: null }
      };
      const res = runAllDetections(analysis, { overallScore: 30, deploymentConfidence: { score: 10 } });
      expect(res.some((d) => d.label.includes('Localhost Veteran'))).toBe(true);
    });
  });

  describe('Persona Engines', () => {
    it('creates fallbacks reflecting persona tone', () => {
      const analysis = {
        repo: { name: 'test-repo', description: 'test desc' },
        fileTreeAnalysis: { totalFiles: 20, maxDepth: 4, hasTests: false },
        readmeAnalysis: { exists: true, wordCount: 20 },
        commitAnalysis: { commitQuality: 50 },
      };
      const metrics = {
        technicalDebtForecast: { score: 45, verdict: 'Vaporware' },
        documentationDensity: { score: 30, verdict: 'Weak' },
        overall: 40,
        overallScore: 40,
      };

      const review = generateFallbackReview(PERSONA_CONFIGS.seniorEngineer, analysis, metrics);
      expect(review.score).toBeLessThan(60);
      expect(review.keyPoints.length).toBeGreaterThan(0);
    });
  });

  describe('Easter Eggs Engine', () => {
    it('resolves emotional burnout status names', () => {
      expect(getBurnoutLevel(1)).toBe('Intern');
      expect(getBurnoutLevel(10)).toBe('Junior');
      expect(getBurnoutLevel(30)).toBe('Mid-level');
      expect(getBurnoutLevel(50)).toBe('Senior Developer, Mentally');
    });

    it('determines if user needs to touch grass', () => {
      const sessionStart = Date.now() - 31 * 60 * 1000; // 31 minutes ago
      expect(shouldShowTouchGrass(sessionStart)).toBe(true);
      expect(shouldShowTouchGrass(Date.now() - 5 * 60 * 1000)).toBe(false); // 5 minutes ago
    });

    it('outputs Git log regrets', () => {
      const logs = generateGitLogRegret();
      expect(logs.length).toBeGreaterThan(0);
      expect(typeof logs[0]).toBe('object');
      expect(typeof logs[0].message).toBe('string');
    });
  });
});
