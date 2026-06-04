/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — METRIC CALCULATORS
   All scores are 0-100. All verdicts are opinionated.
   ═══════════════════════════════════════════════════════ */

/**
 * Clamp a value between 0 and 100.
 * @param {number} value
 * @returns {number}
 */
function clamp100(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

// ─── DOCUMENTATION DENSITY ───────────────────────────────

/**
 * Measure how thorough the project documentation is.
 * @param {Object} readmeAnalysis - From analyzeReadme()
 * @param {boolean} hasContributing - CONTRIBUTING.md present
 * @param {boolean} hasChangelog - CHANGELOG.md present
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateDocumentationDensity(readmeAnalysis, hasContributing, hasChangelog) {
  const evidence = [];
  if (!readmeAnalysis?.exists) {
    return { score: 0, verdict: 'README is a myth here.', evidence: ['No README file found in repository'] };
  }

  let score = 0;

  // Word count contribution (up to 30 points)
  if (readmeAnalysis.wordCount > 500) {
    score += 30;
    evidence.push(`Extensive README word count (${readmeAnalysis.wordCount} words)`);
  } else if (readmeAnalysis.wordCount > 200) {
    score += 20;
    evidence.push(`Moderate README word count (${readmeAnalysis.wordCount} words)`);
  } else if (readmeAnalysis.wordCount > 50) {
    score += 10;
    evidence.push(`Short README word count (${readmeAnalysis.wordCount} words)`);
  } else {
    evidence.push(`Very brief README (${readmeAnalysis.wordCount} words)`);
  }

  // Structure (up to 25 points)
  score += (readmeAnalysis.structureScore / 100) * 25;
  if (readmeAnalysis.structureScore > 70) {
    evidence.push('Well-structured markdown document layout');
  }

  // Headings (up to 10 points)
  if (readmeAnalysis.headingCount >= 5) {
    score += 10;
    evidence.push(`Contains multiple section headers (${readmeAnalysis.headingCount})`);
  } else if (readmeAnalysis.headingCount >= 3) {
    score += 7;
    evidence.push(`Contains a few section headers (${readmeAnalysis.headingCount})`);
  } else if (readmeAnalysis.headingCount >= 1) {
    score += 3;
    evidence.push(`Contains very few section headers (${readmeAnalysis.headingCount})`);
  }

  // Code blocks (up to 10 points)
  if (readmeAnalysis.codeBlockCount >= 3) {
    score += 10;
    evidence.push(`Includes several code examples (${readmeAnalysis.codeBlockCount} blocks)`);
  } else if (readmeAnalysis.codeBlockCount >= 1) {
    score += 5;
    evidence.push(`Includes code examples (${readmeAnalysis.codeBlockCount} blocks)`);
  }

  // Extras
  if (readmeAnalysis.hasScreenshots) {
    score += 10;
    evidence.push('Screenshots or images present in README');
  }
  if (readmeAnalysis.hasBadges) {
    score += 5;
    evidence.push('Status/quality badges present in README');
  }
  if (hasContributing) {
    score += 5;
    evidence.push('CONTRIBUTING guide detected in project');
  }
  if (hasChangelog) {
    score += 5;
    evidence.push('CHANGELOG history detected in project');
  }

  score = clamp100(score);

  // Verdicts
  let verdict;
  if (score >= 90) verdict = 'README is a novel. Respect.';
  else if (score >= 75) verdict = 'Documentation so good it could onboard an alien.';
  else if (score >= 60) verdict = 'Solid docs. Someone actually cared.';
  else if (score >= 40) verdict = 'Docs exist. Barely. Like most New Year resolutions.';
  else if (score >= 20) verdict = 'README entered the chat, then immediately left.';
  else verdict = 'Documentation: missing, presumed dead.';

  return { score, verdict, evidence };
}

// ─── DEPLOYMENT CONFIDENCE ───────────────────────────────

/**
 * Measure evidence that this project has been or can be deployed.
 * @param {Object} fileTreeAnalysis - From analyzeFileTree()
 * @param {string|null} homepageUrl - Repo homepage URL
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateDeploymentConfidence(fileTreeAnalysis, homepageUrl) {
  const evidence = [];
  let score = 0;

  // Homepage URL is strong evidence of deployment
  if (homepageUrl && homepageUrl.trim()) {
    score += 35;
    evidence.push(`Live homepage URL defined: ${homepageUrl}`);
  } else {
    evidence.push('No live URL / homepage link found in repository metadata');
  }

  // Deployment configuration files
  const deployCount = fileTreeAnalysis?.deploymentFiles?.length || 0;
  if (deployCount >= 3) {
    score += 25;
    evidence.push(`Multiple deployment configs: ${fileTreeAnalysis.deploymentFiles.join(', ')}`);
  } else if (deployCount >= 1) {
    score += 15;
    evidence.push(`Deployment config detected: ${fileTreeAnalysis.deploymentFiles.join(', ')}`);
  } else {
    evidence.push('No deployment configuration files (e.g. vercel.json, netlify.toml) detected');
  }

  // CI/CD pipeline
  if (fileTreeAnalysis?.hasCI) {
    score += 15;
    evidence.push('CI/CD pipeline configuration (e.g. GitHub Actions, GitLab CI) found');
  }

  // Docker
  if (fileTreeAnalysis?.hasDocker) {
    score += 10;
    evidence.push('Docker configuration (Dockerfile or docker-compose) detected');
  }

  // Has actual source code structure
  if (fileTreeAnalysis?.hasSrc) {
    score += 5;
    evidence.push('Structured source files under /src, /lib, or /app folder');
  }

  // Has tests (indirect deployment confidence)
  if (fileTreeAnalysis?.hasTests) {
    score += 10;
    evidence.push('Automated tests found in project');
  }

  score = clamp100(score);

  let verdict;
  if (score >= 90) verdict = 'Ship it. This thing is production-hardened.';
  else if (score >= 70) verdict = 'Deployment pipeline exists. Sleep slightly easier.';
  else if (score >= 50) verdict = 'Deployment is plausible. Proof is negotiable.';
  else if (score >= 30) verdict = 'Deployment? More like a theoretical exercise.';
  else if (score >= 10) verdict = 'Localhost Veteran.';
  else verdict = 'Deployment confidence: 404.';

  return { score, verdict, evidence };
}

// ─── PORTFOLIO VALUE ─────────────────────────────────────

/**
 * Measure how valuable this project is for a developer portfolio.
 * @param {Object} repoData - Repository metadata
 * @param {Object} cloneDetection - From detectCloneProject()
 * @param {number} languageCount - Number of languages used
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculatePortfolioValue(repoData, cloneDetection, languageCount) {
  const evidence = [];
  let score = 50; // Start at neutral

  // Stars
  if (repoData?.stars >= 100) {
    score += 15;
    evidence.push(`Popular repository (${repoData.stars} stars)`);
  } else if (repoData?.stars >= 10) {
    score += 8;
    evidence.push(`Some community traction (${repoData.stars} stars)`);
  } else if (repoData?.stars >= 1) {
    score += 3;
    evidence.push(`Has GitHub stars (${repoData.stars})`);
  } else {
    evidence.push('Zero GitHub stars (no public traction yet)');
  }

  // Description
  if (repoData?.description && repoData.description.length > 20) {
    score += 8;
    evidence.push('Good repository description provided');
  } else if (repoData?.description) {
    score += 3;
    evidence.push('Short repository description');
  } else {
    evidence.push('Missing repository description in metadata');
  }

  // Topics / tags
  if (repoData?.topics?.length >= 3) {
    score += 7;
    evidence.push(`Well-tagged with topics: ${repoData.topics.slice(0, 5).join(', ')}`);
  } else if (repoData?.topics?.length >= 1) {
    score += 3;
    evidence.push(`Has topics: ${repoData.topics.join(', ')}`);
  } else {
    evidence.push('No GitHub topics assigned to repository');
  }

  // Language diversity (but not too crazy)
  if (languageCount >= 2 && languageCount <= 6) {
    score += 8;
    evidence.push(`Multi-language footprint (${languageCount} languages)`);
  } else if (languageCount >= 1) {
    score += 3;
    evidence.push(`Single primary language detected`);
  }

  // Homepage
  if (repoData?.homepage) {
    score += 10;
    evidence.push('Homepage link present in settings');
  }

  // Clone penalty
  if (cloneDetection?.isClone) {
    const penalty = Math.round(cloneDetection.confidence * 0.4);
    score -= penalty;
    evidence.push(`Clone/Tutorial template penalty (-${penalty} pts) matching ${cloneDetection.cloneType}`);
  } else {
    evidence.push('Original project layout (not a recognized tutorial clone)');
  }

  // Fork penalty
  if (repoData?.isFork) {
    score -= 15;
    evidence.push('Flagged as a repository fork (-15 pts)');
  }

  // Archived penalty
  if (repoData?.isArchived) {
    score -= 10;
    evidence.push('Repository is archived/read-only (-10 pts)');
  }

  score = clamp100(score);

  let verdict;
  if (score >= 85) verdict = 'Portfolio-worthy. Recruiters will actually click this.';
  else if (score >= 70) verdict = 'Decent portfolio piece. Would survive a code review interview.';
  else if (score >= 50) verdict = 'Exists on your GitHub. That\'s… something.';
  else if (score >= 30) verdict = 'Portfolio filler. Recruiters have seen 10,000 of these.';
  else verdict = 'This actively hurts your portfolio. Consider private.';

  return { score, verdict, evidence };
}

// ─── TECHNICAL DEBT FORECAST ─────────────────────────────

/**
 * Predict future maintenance headaches (higher = less debt = better).
 * @param {Object} fileTreeAnalysis
 * @param {Object} commitAnalysis
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateTechnicalDebtForecast(fileTreeAnalysis, commitAnalysis) {
  const evidence = [];
  let score = 50; // Start neutral

  // Tests reduce debt risk
  if (fileTreeAnalysis?.hasTests) {
    score += 15;
    evidence.push('Automated tests present (reduces regression risk)');
  } else {
    evidence.push('No test suite detected (increases technical debt)');
  }

  // CI/CD reduces debt
  if (fileTreeAnalysis?.hasCI) {
    score += 10;
    evidence.push('CI/CD pipeline handles build and test checks');
  }

  // Good organization reduces debt
  if (fileTreeAnalysis?.hasSrc) {
    score += 5;
    evidence.push('Code structured in dedicated folders (src/lib/app)');
  }

  const orgScore = fileTreeAnalysis?.organizationScore || 0;
  score += orgScore * 0.1;
  if (orgScore > 70) {
    evidence.push('Highly organized file tree structure');
  }

  // Config files show tooling maturity
  if (fileTreeAnalysis?.hasConfig) {
    score += 5;
    evidence.push('Tooling configurations present (linter, formatter, or bundlers)');
  }

  // Conventional commits show discipline
  if (commitAnalysis?.hasConventionalCommits) {
    score += 10;
    evidence.push('Uses conventional commits (structured version history)');
  }

  // Good commit quality
  const commitQuality = commitAnalysis?.commitQuality || 0;
  score += commitQuality * 0.1;
  if (commitQuality > 70) {
    evidence.push('High commit quality and descriptive log history');
  }

  // Active development means someone is maintaining it
  if (commitAnalysis?.recentActivity === 'active') {
    score += 10;
    evidence.push('Highly active updates (last commit within 7 days)');
  } else if (commitAnalysis?.recentActivity === 'recent') {
    score += 5;
    evidence.push('Recent repository updates (last commit within 30 days)');
  } else if (commitAnalysis?.recentActivity === 'dead') {
    score -= 10;
    evidence.push('Stale repository (no recent activity, high legacy debt risk)');
  }

  // Too many files with no structure = smell
  if (
    (fileTreeAnalysis?.totalFiles || 0) > 50 &&
    (fileTreeAnalysis?.totalDirs || 0) < 3
  ) {
    score -= 10;
    evidence.push('Smell: flat root containing too many files without grouping');
  }

  score = clamp100(score);

  let verdict;
  if (score >= 85) verdict = 'Tech debt forecast: partly cloudy with a chance of shipping.';
  else if (score >= 70) verdict = 'Manageable debt. Future-you will only mildly curse present-you.';
  else if (score >= 50) verdict = 'Tech debt is accumulating. Interest rates are not favorable.';
  else if (score >= 30) verdict = 'Refactoring is not optional. It is imminent.';
  else verdict = 'Technical debt has achieved sentience. It files its own Jira tickets now.';

  return { score, verdict, evidence };
}

// ─── OPEN SOURCE FRIENDLINESS ────────────────────────────

/**
 * Measure how contributor-friendly the project is.
 * @param {Object} readmeAnalysis
 * @param {boolean} hasContributing
 * @param {boolean} hasLicense
 * @param {boolean} hasIssueTemplates
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateOpenSourceFriendliness(readmeAnalysis, hasContributing, hasLicense, hasIssueTemplates) {
  const evidence = [];
  let score = 0;

  // License is fundamental
  if (hasLicense) {
    score += 25;
    evidence.push('License file or metadata detected (essential for open source)');
  } else {
    evidence.push('No license file found (limits legal distribution and reuse)');
  }

  // README quality
  if (readmeAnalysis?.exists) {
    score += 10;
    evidence.push('README documentation exists');
    if (readmeAnalysis.hasSetupInstructions) {
      score += 15;
      evidence.push('Setup and installation instructions guide is detailed');
    }
    if (readmeAnalysis.wordCount > 100) {
      score += 5;
    }
  }

  // Contributing guide
  if (hasContributing) {
    score += 15;
    evidence.push('CONTRIBUTING guide exists to onboard new developers');
  } else {
    evidence.push('No CONTRIBUTING instructions found for prospective developers');
  }

  // Issue templates
  if (hasIssueTemplates) {
    score += 10;
    evidence.push('GitHub issue templates configured');
  }

  // Code of conduct (detected via README mention)
  if (readmeAnalysis?.exists && /code.of.conduct/i.test('')) {
    score += 5;
    evidence.push('Code of Conduct guidelines mentioned');
  }

  // Badges show OSS awareness
  if (readmeAnalysis?.hasBadges) {
    score += 5;
    evidence.push('Status badges indicate project health and updates');
  }

  // Screenshots help newcomers
  if (readmeAnalysis?.hasScreenshots) {
    score += 5;
    evidence.push('Screenshots or demo media provided for contributors');
  }

  // Setup instructions are critical for contributors
  if (readmeAnalysis?.codeBlockCount >= 2) {
    score += 5;
  }

  // Cap at 100 but also reward minimum viable contributor experience
  score = clamp100(score);

  let verdict;
  if (score >= 85) verdict = 'Open source nirvana. Contributors would weep with joy.';
  else if (score >= 65) verdict = 'Contributor-friendly. PRs welcome and they\'ll know how.';
  else if (score >= 45) verdict = 'Somewhat open source. The door is ajar, but unlabeled.';
  else if (score >= 25) verdict = 'Contributors will need a Ouija board to understand the setup.';
  else verdict = 'Open source in name only. Good luck, random stranger.';

  return { score, verdict, evidence };
}

// ─── PRODUCTION READINESS ────────────────────────────────

/**
 * How close is this to being production-ready?
 * @param {Object} fileTreeAnalysis
 * @param {Object} deploymentConfidence - From calculateDeploymentConfidence()
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateProductionReadiness(fileTreeAnalysis, deploymentConfidence) {
  const evidence = [];
  let score = 0;

  // Deployment confidence is the biggest factor
  const deployScore = deploymentConfidence?.score || 0;
  score += deployScore * 0.4;
  evidence.push(`Deployment pipelines/links rating is ${deployScore}/100`);

  // Tests
  if (fileTreeAnalysis?.hasTests) {
    score += 15;
    evidence.push('Testing suites detected (reduces bugs in production)');
  } else {
    evidence.push('No testing configuration found (high risk for production releases)');
  }

  // CI/CD
  if (fileTreeAnalysis?.hasCI) {
    score += 15;
    evidence.push('Continuous Integration rules are in place');
  } else {
    evidence.push('No automated CI pipeline set up to verify builds');
  }

  // Docker
  if (fileTreeAnalysis?.hasDocker) {
    score += 10;
    evidence.push('Docker configuration files present (portable containers)');
  }

  // Proper structure
  if (fileTreeAnalysis?.hasSrc) {
    score += 5;
    evidence.push('Standard file layout under a source folder (/src)');
  }

  // Config maturity
  if (fileTreeAnalysis?.hasConfig) {
    score += 5;
    evidence.push('Standard configs (eslint, tsconfig, etc.) present');
  }

  // Organization
  const orgScore = fileTreeAnalysis?.organizationScore || 0;
  score += orgScore * 0.1;

  score = clamp100(score);

  let verdict;
  if (score >= 85) verdict = 'Production-ready. The on-call team can breathe.';
  else if (score >= 65) verdict = 'Almost production-ready. Just a few existential crises away.';
  else if (score >= 45) verdict = 'Production-adjacent. Like a demo that got too real.';
  else if (score >= 25) verdict = 'Production-ready emotionally, not technically.';
  else verdict = '"Works on my machine" is the only SLA.';

  return { score, verdict, evidence };
}

// ─── TUTORIAL DEPENDENCY ─────────────────────────────────

/**
 * Detect tutorial/clone dependency (higher = more original = better).
 * @param {Object} cloneDetection
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateTutorialDependency(cloneDetection) {
  const evidence = [];
  if (!cloneDetection?.isClone) {
    evidence.push('No matches found for popular tutorial or bootcamp repositories');
    return { score: 90, verdict: 'Original work detected. A rare species in the wild.', evidence };
  }

  // Invert confidence: high clone confidence = low originality score
  const score = clamp100(100 - cloneDetection.confidence);
  evidence.push(`Matched known learning template: ${cloneDetection.cloneType} (${cloneDetection.confidence}% confidence)`);

  let verdict;
  if (score >= 60) verdict = 'Hints of tutorial DNA, but there\'s original thought here.';
  else if (score >= 40) verdict = 'Tutorial vibes detected. It\'s okay, we all start somewhere.';
  else if (score >= 20) verdict = 'Tutorial Residue Detected. This smells like YouTube autoplay.';
  else verdict = 'This is a tutorial with a different font. The tutorial is the product.';

  return { score, verdict, evidence };
}

// ─── README POWER LEVEL ──────────────────────────────────

/**
 * Measure the README's sheer impressiveness.
 * @param {Object} readmeAnalysis
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateReadmePowerLevel(readmeAnalysis) {
  const evidence = [];
  if (!readmeAnalysis?.exists) {
    evidence.push('No README file found in root directory');
    return { score: 0, verdict: 'README Power Level: It\'s under 9000. Way under. It\'s zero.', evidence };
  }

  let score = readmeAnalysis.structureScore;
  evidence.push(`Baseline README structure score: ${readmeAnalysis.structureScore}/100`);

  // Bonus for length
  if (readmeAnalysis.wordCount > 1000) {
    score += 10;
    evidence.push(`Gigachad document length (${readmeAnalysis.wordCount} words)`);
  } else if (readmeAnalysis.wordCount > 500) {
    score += 5;
    evidence.push(`Decent document length (${readmeAnalysis.wordCount} words)`);
  }

  // Bonus for visual richness
  if (readmeAnalysis.hasScreenshots && readmeAnalysis.hasBadges) {
    score += 10;
    evidence.push('Visual richness bonus: screenshots + status badges both present');
  } else if (readmeAnalysis.hasScreenshots) {
    evidence.push('Includes visual screenshots / diagrams');
  }

  score = clamp100(score);

  let verdict;
  if (score >= 90) verdict = 'README has achieved consciousness. It wrote itself.';
  else if (score >= 75) verdict = 'README Power Level: Over 9000. Genuinely impressive.';
  else if (score >= 55) verdict = 'README is solid. Not a masterpiece, but it gets the job done.';
  else if (score >= 35) verdict = 'README exists. It has words. Some of them are even useful.';
  else if (score >= 15) verdict = 'README is a sticky note. "It works. Trust me."';
  else verdict = 'README Power Level: It\'s under 9000. Way under. It\'s zero.';

  return { score, verdict, evidence };
}

// ─── FOUNDER HALLUCINATION SEVERITY ──────────────────────

/**
 * Detect gap between marketing claims and actual product evidence.
 * Higher score = less hallucination = better.
 * @param {Object} buzzwordAnalysis
 * @param {Object} deploymentConfidence
 * @returns {{ score: number, verdict: string, evidence: string[] }}
 */
export function calculateFounderHallucination(buzzwordAnalysis, deploymentConfidence) {
  const evidence = [];
  const buzzCount = buzzwordAnalysis?.count || 0;
  const deployScore = deploymentConfidence?.score || 0;

  // Start from 100 (no hallucination) and deduct for buzzwords
  let score = 100;

  if (buzzCount > 0) {
    evidence.push(`Detected marketing buzzwords: ${buzzwordAnalysis.words.slice(0, 5).join(', ')}`);
  } else {
    evidence.push('No VC-hype marketing buzzwords found in description or README');
  }

  // Buzzword penalty
  if (buzzCount >= 10) {
    score -= 50;
    evidence.push('Dangerous buzzword radiation level (-50 pts)');
  } else if (buzzCount >= 7) {
    score -= 35;
    evidence.push('High buzzword concentration level (-35 pts)');
  } else if (buzzCount >= 5) {
    score -= 25;
    evidence.push('Elevated buzzword density (-25 pts)');
  } else if (buzzCount >= 3) {
    score -= 15;
    evidence.push('Moderate buzzword usage (-15 pts)');
  } else if (buzzCount >= 1) {
    score -= 5;
    evidence.push('Negligible buzzword presence (-5 pts)');
  }

  // If lots of buzzwords but no deployment, the gap is real
  if (buzzCount >= 3 && deployScore < 30) {
    score -= 20;
    evidence.push('Vaporware gap: heavy marketing buzzwords but low deployment score (-20 pts)');
  }

  // If there IS deployment, partially redeem the buzzwords
  if (deployScore >= 70 && buzzCount <= 5) {
    score += 10;
    evidence.push('Buzzwords vindicated: solid deployment pipeline present (+10 pts)');
  }

  score = clamp100(score);

  let verdict;
  if (score >= 90) verdict = 'Grounded in reality. No VC pitch deck energy detected.';
  else if (score >= 70) verdict = 'Minor buzzword usage. Acceptable levels of optimism.';
  else if (score >= 50) verdict = 'Buzzword levels elevated. Consult a technical co-founder.';
  else if (score >= 30) verdict = 'Founder Hallucination: Moderate. The pitch deck is writing itself.';
  else if (score >= 15) verdict = 'Buzzword Radiation: Dangerous. Evacuate the README.';
  else verdict = 'This README is a pitch deck. The product is a GitHub repo. The valuation is imaginary.';

  return { score, verdict, evidence };
}

// ─── OVERALL SCORE ───────────────────────────────────────

/**
 * Calculate a weighted overall score from all metrics.
 * @param {Object} allMetrics - Object with all metric results
 * @returns {number} Weighted average 0-100
 */
export function calculateOverallScore(allMetrics) {
  const weights = {
    documentationDensity: 0.12,
    deploymentConfidence: 0.15,
    portfolioValue: 0.12,
    technicalDebtForecast: 0.12,
    openSourceFriendliness: 0.08,
    productionReadiness: 0.13,
    tutorialDependency: 0.10,
    readmePowerLevel: 0.08,
    founderHallucination: 0.10,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const metric = allMetrics[key];
    if (metric && typeof metric.score === 'number') {
      weightedSum += metric.score * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return clamp100(Math.round(weightedSum / totalWeight));
}

// ─── DETERMINISTIC RULE ENGINE ───────────────────────────

/**
 * Run the core rule engine for deterministic scoring and explanation.
 * @param {Object} analysisData
 * @returns {{ score: number, rules: Array<{ id: string, name: string, maxPoints: number, points: number, evidence: string, tip: string|null }> }}
 */
export function runRuleEngine(analysisData) {
  const readmeAnalysis = analysisData?.readmeAnalysis;
  const fileTreeAnalysis = analysisData?.fileTreeAnalysis;
  const commitAnalysis = analysisData?.commitAnalysis;
  const cloneDetection = analysisData?.cloneDetection;
  const repo = analysisData?.repo;
  const securityRisks = analysisData?.securityRisks || [];

  const rules = [];

  // 1. README present -> +15 points
  const readmePresent = !!readmeAnalysis?.exists;
  rules.push({
    id: 'readme_present',
    name: 'README documentation',
    maxPoints: 15,
    points: readmePresent ? 15 : 0,
    evidence: readmePresent ? 'README.md file detected in the repository root.' : 'No README.md file found in the repository root.',
    tip: readmePresent ? null : 'Create a README.md file to document your project setup and usage instructions.'
  });

  // 2. Dockerfile present -> +10 points
  const dockerPresent = !!fileTreeAnalysis?.hasDocker;
  rules.push({
    id: 'dockerfile_present',
    name: 'Containerization / Dockerfile',
    maxPoints: 10,
    points: dockerPresent ? 10 : 0,
    evidence: dockerPresent ? 'Dockerfile or docker-compose.yml configuration detected.' : 'No Dockerfile or docker-compose configuration files detected.',
    tip: dockerPresent ? null : 'Add a Dockerfile or docker-compose.yml to containerize the application.'
  });

  // 3. CI workflow present -> +10 points
  const ciPresent = !!fileTreeAnalysis?.hasCI;
  rules.push({
    id: 'ci_workflow_present',
    name: 'CI/CD Workflow Pipeline',
    maxPoints: 10,
    points: ciPresent ? 10 : 0,
    evidence: ciPresent ? 'CI/CD pipeline files (e.g., GitHub Actions, GitLab CI) detected.' : 'No CI/CD configuration files (workflows, pipeline configs) found.',
    tip: ciPresent ? null : 'Add a GitHub Actions workflow under `.github/workflows/` to run tests and linters.'
  });

  // 4. Tests present -> +15 points
  const testsPresent = !!fileTreeAnalysis?.hasTests;
  rules.push({
    id: 'tests_present',
    name: 'Automated Test Suite',
    maxPoints: 15,
    points: testsPresent ? 15 : 0,
    evidence: testsPresent ? 'Automated tests, spec files, or test configurations detected.' : 'No automated test files or test runner configs detected.',
    tip: testsPresent ? null : 'Implement a test suite using Vitest, Jest, or another framework, and place tests in a `test/` directory or name them `*.test.js`.'
  });

  // 5. Commit quality & activity -> +15 points
  let commitPoints = 0;
  const commitEvidences = [];
  if (commitAnalysis?.totalCount > 0) {
    if (commitAnalysis.frequency === 'daily' || commitAnalysis.frequency === 'frequent') {
      commitPoints += 5;
      commitEvidences.push('high frequency');
    }
    if (commitAnalysis.hasConventionalCommits) {
      commitPoints += 5;
      commitEvidences.push('conventional commit style');
    }
    if (commitAnalysis.recentActivity === 'active' || commitAnalysis.recentActivity === 'recent') {
      commitPoints += 5;
      commitEvidences.push('recent active updates');
    }
  }
  rules.push({
    id: 'commit_activity',
    name: 'Commit Quality & Activity',
    maxPoints: 15,
    points: commitPoints,
    evidence: commitEvidences.length > 0 
      ? `Commit history shows: ${commitEvidences.join(', ')}.` 
      : 'Commit frequency is low, stale, or lacks standard conventional naming format.',
    tip: commitPoints === 15 ? null : 'Commit regularly and adopt conventional commit tags like `feat:`, `fix:`, or `chore:`.'
  });

  // 6. Originality vs Tutorial Clone -> +15 points
  let originalityPoints = 15;
  if (cloneDetection?.isClone) {
    originalityPoints = Math.round(15 * (100 - cloneDetection.confidence) / 100);
  }
  rules.push({
    id: 'project_originality',
    name: 'Project Originality',
    maxPoints: 15,
    points: originalityPoints,
    evidence: cloneDetection?.isClone
      ? `Detected possible tutorial/clone residue with ${cloneDetection.confidence}% confidence (matched: ${cloneDetection.cloneType}).`
      : 'Original project layout (not recognized as a duplicate tutorial template).',
    tip: cloneDetection?.isClone ? 'Avoid submitting course/tutorial templates in your portfolio. Customize the project extensively or build unique features.' : null
  });

  // 7. Repository Presentation -> +10 points
  let presentationPoints = 0;
  const presEvidences = [];
  if (repo?.description) {
    presentationPoints += 3;
    if (repo.description.length > 20) {
      presentationPoints += 2;
      presEvidences.push('detailed description');
    } else {
      presEvidences.push('short description');
    }
  }
  if (repo?.topics && repo.topics.length > 0) {
    presentationPoints += 3;
    if (repo.topics.length >= 3) {
      presentationPoints += 2;
      presEvidences.push('multiple topics/tags');
    } else {
      presEvidences.push('some topics/tags');
    }
  }
  rules.push({
    id: 'repo_presentation',
    name: 'Repository Presentation',
    maxPoints: 10,
    points: presentationPoints,
    evidence: presEvidences.length > 0
      ? `Metadata contains: ${presEvidences.join(', ')}.`
      : 'Missing description and GitHub topics/tags in repository metadata.',
    tip: presentationPoints === 10 ? null : 'Fill in the repository description and add relevant topic tags on GitHub.'
  });

  // 8. Security Health -> +10 points
  const securityExposedCount = securityRisks?.length || 0;
  const securityPoints = Math.max(0, 10 - securityExposedCount * 5); // Deduct 5 points per risk
  rules.push({
    id: 'security_health',
    name: 'Security Health & Secrets Protection',
    maxPoints: 10,
    points: securityPoints,
    evidence: securityExposedCount === 0
      ? 'No committed private keys, config files, or secrets detected.'
      : `Detected ${securityExposedCount} potential credentials or config exposures.`,
    tip: securityExposedCount === 0 ? null : 'Remove any committed `.env` files, private keys, or API tokens from git history using git filter-repo.'
  });

  const totalScore = rules.reduce((sum, r) => sum + r.points, 0);

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    rules
  };
}

// ─── MASTER MASTER CALCULATOR ────────────────────────────

/**
 * Compute all metrics at once from the analysis data.
 * @param {Object} analysisData - From analyzeRepository()
 * @returns {Object} All metrics plus overall score
 */
export function calculateAllMetrics(analysisData) {
  const {
    repo,
    readmeAnalysis,
    fileTreeAnalysis,
    commitAnalysis,
    cloneDetection,
    buzzwordAnalysis,
    languageCount,
  } = analysisData;

  // Detect additional files for metric inputs
  const hasContributing =
    readmeAnalysis?.hasContributing ||
    fileTreeAnalysis?.fileTypes?.['.md'] > 1 ||
    (fileTreeAnalysis?.totalFiles > 0 &&
      analysisData.contents?.tree?.some((f) =>
        /contributing/i.test(f.path),
      )) ||
    false;

  const hasChangelog =
    analysisData.contents?.tree?.some((f) =>
      /changelog|changes/i.test(f.path),
    ) || false;

  const hasLicense = !!repo?.license;

  const hasIssueTemplates =
    analysisData.contents?.tree?.some((f) =>
      /\.github\/(issue_template|ISSUE_TEMPLATE)/i.test(f.path),
    ) || false;

  // Calculate each metric
  const documentationDensity = calculateDocumentationDensity(
    readmeAnalysis,
    hasContributing,
    hasChangelog,
  );

  const deploymentConfidence = calculateDeploymentConfidence(
    fileTreeAnalysis,
    repo?.homepage,
  );

  const portfolioValue = calculatePortfolioValue(
    repo,
    cloneDetection,
    languageCount,
  );

  const technicalDebtForecast = calculateTechnicalDebtForecast(
    fileTreeAnalysis,
    commitAnalysis,
  );

  const openSourceFriendliness = calculateOpenSourceFriendliness(
    readmeAnalysis,
    hasContributing,
    hasLicense,
    hasIssueTemplates,
  );

  const productionReadiness = calculateProductionReadiness(
    fileTreeAnalysis,
    deploymentConfidence,
  );

  const tutorialDependency = calculateTutorialDependency(cloneDetection);

  const readmePowerLevel = calculateReadmePowerLevel(readmeAnalysis);

  const founderHallucination = calculateFounderHallucination(
    buzzwordAnalysis,
    deploymentConfidence,
  );

  const allMetrics = {
    documentationDensity,
    deploymentConfidence,
    portfolioValue,
    technicalDebtForecast,
    openSourceFriendliness,
    productionReadiness,
    tutorialDependency,
    readmePowerLevel,
    founderHallucination,
  };

  const securityRisks = [
    ...(fileTreeAnalysis?.securityRisks || []),
    ...(readmeAnalysis?.exposedSecrets || []),
  ];

  const ruleResult = runRuleEngine({
    ...analysisData,
    securityRisks,
  });

  return {
    ...allMetrics,
    ruleResult,
    overall: ruleResult.score,
    overallScore: ruleResult.score,
  };
}
