import { describe, it, expect } from 'vitest';
import {
  calculateDocumentationDensity,
  calculateDeploymentConfidence,
  calculatePortfolioValue,
  calculateOpenSourceFriendliness,
  calculateAllMetrics,
  runRuleEngine,
} from './metrics';

describe('DevInspect AI Metrics Engine', () => {
  describe('Documentation Density', () => {
    it('returns score of 0 when README does not exist', () => {
      const res = calculateDocumentationDensity({ exists: false }, false, false);
      expect(res.score).toBe(0);
      expect(res.verdict).toBe('README is a myth here.');
    });

    it('calculates deterministic score based on README details and checklists', () => {
      const readmeAnalysis = {
        exists: true,
        wordCount: 300, // +20 points
        structureScore: 80, // +20 points (80/100 * 25)
        headingCount: 4, // +7 points
        codeBlockCount: 2, // +5 points
        hasScreenshots: true, // +10 points
        hasBadges: true, // +5 points
      };

      const res = calculateDocumentationDensity(readmeAnalysis, true, true);
      // Expected: 20 + 20 + 7 + 5 + 10 + 5 + 5 (contributing) + 5 (changelog) = 77
      expect(res.score).toBe(77);
      expect(res.verdict).toBe('Documentation so good it could onboard an alien.');
    });
  });

  describe('Deployment Confidence', () => {
    it('calculates deterministic deployment confidence based on workspace indicators', () => {
      const fileTree = {
        deploymentFiles: ['vercel.json', 'netlify.toml'], // +15 points
        hasCI: true, // +15 points
        hasDocker: true, // +10 points
        hasSrc: true, // +5 points
        hasTests: true, // +10 points
      };

      const res = calculateDeploymentConfidence(fileTree, 'https://my-live-demo.com'); // +35 points
      // Total Expected: 15 + 15 + 10 + 5 + 10 + 35 = 90
      expect(res.score).toBe(90);
      expect(res.evidence).toContain('Live homepage URL defined: https://my-live-demo.com');
      expect(res.evidence).toContain('Docker configuration (Dockerfile or docker-compose) detected');
    });

    it('returns low score for Localhost Veteran path', () => {
      const fileTree = {
        deploymentFiles: [],
        hasCI: false,
        hasDocker: false,
        hasSrc: true,
        hasTests: false,
      };
      const res = calculateDeploymentConfidence(fileTree, null);
      expect(res.score).toBe(5); // 5 (hasSrc)
      expect(res.verdict).toBe('Deployment confidence: 404.');
    });
  });

  describe('Portfolio Value', () => {
    it('calculates value factoring stars, description, and clone status', () => {
      const repo = {
        stars: 12, // +8
        description: 'A very cool portfolio project that will show off skills.', // +8
        topics: ['react', 'node', 'security'], // +7
        homepage: 'https://demo.com', // +10
        isFork: false,
        isArchived: false,
      };
      const clone = { isClone: false };
      const res = calculatePortfolioValue(repo, clone, 3); // 3 languages (+8)
      // Base: 50. Add: 8 + 8 + 7 + 8 (lang) + 10 = 91
      expect(res.score).toBe(91);
    });
  });

  describe('Open Source Friendliness', () => {
    it('awards points for license, contributing guide, and issue configurations', () => {
      const readme = {
        exists: true,
        hasSetupInstructions: true, // +15
        wordCount: 150, // +5
      };
      const res = calculateOpenSourceFriendliness(readme, true, true, true);
      // Base: 25 (license) + 10 (readme exists) + 15 (setup) + 5 (wordcount) + 15 (contributing) + 10 (issue templates) = 80
      expect(res.score).toBe(80);
    });
  });

  describe('Deterministic Rule Engine Scores', () => {
    it('applies exact point allocations for key files', () => {
      // 1. Minimum baseline (nothing present)
      const dataEmpty = {
        readmeAnalysis: { exists: false },
        fileTreeAnalysis: { hasDocker: false, hasCI: false, hasTests: false },
        commitAnalysis: { totalCount: 0 },
        cloneDetection: { isClone: false },
        repo: {},
        securityRisks: [],
      };
      const resultEmpty = runRuleEngine(dataEmpty);
      expect(resultEmpty.score).toBe(25); // project_originality = +15, security_health = +10, everything else 0

      // 2. Add README (+15) -> total score should increase by 15
      const dataReadme = {
        ...dataEmpty,
        readmeAnalysis: { exists: true },
      };
      const resultReadme = runRuleEngine(dataReadme);
      expect(resultReadme.score).toBe(40); // 15 (originality) + 10 (security) + 15 (readme) = 40
      
      const readmeRule = resultReadme.rules.find(r => r.id === 'readme_present');
      expect(readmeRule.points).toBe(15);

      // 3. Add Dockerfile (+10) -> total score increases by 10
      const dataDocker = {
        ...dataReadme,
        fileTreeAnalysis: { ...dataReadme.fileTreeAnalysis, hasDocker: true },
      };
      const resultDocker = runRuleEngine(dataDocker);
      expect(resultDocker.score).toBe(50); // 40 + 10 = 50

      const dockerRule = resultDocker.rules.find(r => r.id === 'dockerfile_present');
      expect(dockerRule.points).toBe(10);

      // 4. Add CI workflow (+10) -> total score increases by 10
      const dataCI = {
        ...dataDocker,
        fileTreeAnalysis: { ...dataDocker.fileTreeAnalysis, hasCI: true },
      };
      const resultCI = runRuleEngine(dataCI);
      expect(resultCI.score).toBe(60); // 50 + 10 = 60

      const ciRule = resultCI.rules.find(r => r.id === 'ci_workflow_present');
      expect(ciRule.points).toBe(10);

      // 5. Add Tests (+15) -> total score increases by 15
      const dataTests = {
        ...dataCI,
        fileTreeAnalysis: { ...dataCI.fileTreeAnalysis, hasTests: true },
      };
      const resultTests = runRuleEngine(dataTests);
      expect(resultTests.score).toBe(75); // 60 + 15 = 75

      const testsRule = resultTests.rules.find(r => r.id === 'tests_present');
      expect(testsRule.points).toBe(15);
    });

    it('deducts points for security risks', () => {
      const dataSecurity = {
        readmeAnalysis: { exists: true },
        fileTreeAnalysis: { hasDocker: true, hasCI: true, hasTests: true },
        commitAnalysis: { totalCount: 0 },
        cloneDetection: { isClone: false },
        repo: {},
        securityRisks: [
          { type: 'exposed_key' },
          { type: 'exposed_env' },
        ],
      };
      const res = runRuleEngine(dataSecurity);
      const securityRule = res.rules.find(r => r.id === 'security_health');
      expect(securityRule.points).toBe(0); // 10 - 2*5 = 0 points
      expect(res.score).toBe(65); // 15 (originality) + 15 (readme) + 10 (docker) + 10 (ci) + 15 (tests) + 0 (security) = 65
    });
  });

  describe('Overall Deterministic Computations', () => {
    it('always outputs same score for identical input data', () => {
      const mockAnalysis = {
        repo: { stars: 5, description: 'Desc', license: 'MIT', homepage: 'https://demo.com' },
        readmeAnalysis: { exists: true, wordCount: 300, structureScore: 80, headingCount: 4, codeBlockCount: 2, hasScreenshots: true },
        fileTreeAnalysis: { deploymentFiles: ['vercel.json'], hasCI: true, hasDocker: true, hasSrc: true, hasTests: true, organizationScore: 85 },
        commitAnalysis: { hasConventionalCommits: true, commitQuality: 80, recentActivity: 'active' },
        cloneDetection: { isClone: false },
        buzzwordAnalysis: { count: 0, words: [] },
        languageCount: 2,
      };

      const result1 = calculateAllMetrics(mockAnalysis);
      const result2 = calculateAllMetrics(mockAnalysis);

      expect(result1.overallScore).toBe(result2.overallScore);
      expect(result1.overall).toBe(result2.overall);
      expect(typeof result1.overallScore).toBe('number');
    });
  });
});
