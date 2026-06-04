/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — REPOSITORY ANALYZER
   Pre-AI signal extraction from raw GitHub data.
   ═══════════════════════════════════════════════════════ */

import {
  CLONE_PATTERNS,
  BUZZWORDS,
  DEPLOYMENT_FILES,
  TEST_PATTERNS,
} from '../utils/constants';

// ─── README ANALYSIS ─────────────────────────────────────

/**
 * Analyze the README content for quality signals.
 * @param {string|null} readmeContent - Raw README markdown
 * @returns {Object} README analysis metrics
 */
export function analyzeReadme(readmeContent) {
  if (!readmeContent) {
    return {
      exists: false,
      length: 0,
      hasScreenshots: false,
      hasBadges: false,
      hasSetupInstructions: false,
      hasContributing: false,
      hasLicense: false,
      structureScore: 0,
      wordCount: 0,
      headingCount: 0,
      codeBlockCount: 0,
    };
  }

  const content = readmeContent;
  const lower = content.toLowerCase();

  // Screenshots: markdown image syntax ![
  const hasScreenshots = /!\[/.test(content);

  // Badges: shield.io or badge URLs
  const hasBadges =
    /shields\.io|badge|img\.shields|badgen\.net|github\.com\/.*\/workflows\/.*\/badge/i.test(content);

  // Setup / installation instructions
  const hasSetupInstructions =
    /#{1,3}\s*(install|setup|getting\s*started|quick\s*start|usage|how\s*to\s*(use|run|install))/i.test(content);

  // Contributing section
  const hasContributing =
    /#{1,3}\s*(contribut|how\s*to\s*contribute)/i.test(content) ||
    /CONTRIBUTING\.md/i.test(content);

  // License mention
  const hasLicense =
    /#{1,3}\s*licen[cs]e/i.test(content) || /LICENSE/i.test(content);

  // Word count (strip markdown syntax)
  const stripped = content.replace(/[#*`>[\]()!-]/g, ' ');
  const wordCount = stripped.split(/\s+/).filter(Boolean).length;

  // Heading count
  const headings = content.match(/^#{1,6}\s+.+/gm) || [];
  const headingCount = headings.length;

  // Code blocks
  const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
  const codeBlockCount = codeBlocks.length;

  // Structure score (0-100): rewards comprehensive READMEs
  let structureScore = 0;
  if (wordCount > 50) structureScore += 10;
  if (wordCount > 200) structureScore += 10;
  if (wordCount > 500) structureScore += 5;
  if (headingCount >= 3) structureScore += 15;
  if (headingCount >= 6) structureScore += 10;
  if (hasScreenshots) structureScore += 15;
  if (hasBadges) structureScore += 10;
  if (hasSetupInstructions) structureScore += 15;
  if (hasContributing) structureScore += 5;
  if (hasLicense) structureScore += 5;
  if (codeBlockCount >= 1) structureScore += 5;
  if (codeBlockCount >= 3) structureScore += 5;
  // Bonus for having a table of contents
  if (/table\s*of\s*contents|toc/i.test(lower)) structureScore += 5;

  // Security Checks for hardcoded secrets in documentation
  const exposedSecrets = [];

  if (/-----BEGIN [A-Z]+ PRIVATE KEY-----/.test(content)) {
    exposedSecrets.push({
      type: 'hardcoded_private_key',
      label: 'Exposed Private Key',
      description: 'A private key block (e.g. -----BEGIN RSA PRIVATE KEY-----) was found hardcoded in the README documentation.',
      severity: 'critical'
    });
  }

  if (/\b(AKIA|ASCA|AGPA|AIDA)[0-9A-Z]{16}\b/.test(content)) {
    exposedSecrets.push({
      type: 'hardcoded_aws_key',
      label: 'Exposed AWS Key',
      description: 'An AWS Access Key ID (AKIA...) was found hardcoded in the README documentation.',
      severity: 'critical'
    });
  }

  if (/\bey[hG][a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\b/.test(content)) {
    exposedSecrets.push({
      type: 'hardcoded_jwt',
      label: 'Exposed JWT Secret',
      description: 'A JSON Web Token (JWT) structure was found hardcoded in the README documentation.',
      severity: 'critical'
    });
  }

  const apiKeyRegex = /\b(api_key|apikey|session_secret|client_secret|db_password|database_url)\s*=\s*['"][a-zA-Z0-9-_]{10,}['"]/i;
  if (apiKeyRegex.test(content)) {
    exposedSecrets.push({
      type: 'hardcoded_secret_assignment',
      label: 'Hardcoded Credential',
      description: 'A secret key assignment (e.g. api_key = "...") was found hardcoded in the README documentation.',
      severity: 'critical'
    });
  }

  return {
    exists: true,
    length: content.length,
    hasScreenshots,
    hasBadges,
    hasSetupInstructions,
    hasContributing,
    hasLicense,
    structureScore: Math.min(100, structureScore),
    wordCount,
    headingCount,
    codeBlockCount,
    exposedSecrets,
  };
}

// ─── FILE TREE ANALYSIS ──────────────────────────────────

/**
 * Analyze the repository file tree for structure and quality signals.
 * @param {{ tree: Array<{ path: string, type: string, size: number }> }} treeData
 * @returns {Object} File tree analysis metrics
 */
export function analyzeFileTree(treeData) {
  const tree = treeData?.tree || [];

  if (tree.length === 0) {
    return {
      totalFiles: 0,
      totalDirs: 0,
      maxDepth: 0,
      hasTests: false,
      hasCI: false,
      hasDocker: false,
      hasConfig: false,
      hasSrc: false,
      deploymentFiles: [],
      fileTypes: {},
      organizationScore: 0,
    };
  }

  const files = tree.filter((item) => item.type === 'blob');
  const dirs = tree.filter((item) => item.type === 'tree');

  // Max depth
  const maxDepth = tree.reduce((max, item) => {
    const depth = item.path.split('/').length;
    return depth > max ? depth : max;
  }, 0);

  // Test detection
  const hasTests = tree.some((item) =>
    TEST_PATTERNS.some((pattern) => item.path.toLowerCase().includes(pattern)),
  );

  // CI/CD detection
  const hasCI = tree.some((item) => {
    const p = item.path.toLowerCase();
    return (
      p.includes('.github/workflows') ||
      p.includes('.gitlab-ci') ||
      p.includes('.circleci') ||
      p.includes('jenkinsfile') ||
      p.includes('.travis.yml') ||
      p.includes('azure-pipelines')
    );
  });

  // Docker detection
  const hasDocker = tree.some((item) => {
    const p = item.path.toLowerCase();
    return p.includes('dockerfile') || p.includes('docker-compose');
  });

  // Config files detection (package.json, tsconfig, etc.)
  const hasConfig = tree.some((item) => {
    const p = item.path.toLowerCase();
    return (
      p === 'package.json' ||
      p.includes('tsconfig') ||
      p.includes('.eslintrc') ||
      p.includes('.prettierrc') ||
      p.includes('webpack.config') ||
      p.includes('vite.config')
    );
  });

  // Source directory
  const hasSrc = tree.some((item) => {
    const firstDir = item.path.split('/')[0].toLowerCase();
    return firstDir === 'src' || firstDir === 'lib' || firstDir === 'app';
  });

  // Deployment files detection
  const deploymentFiles = [];
  for (const item of tree) {
    for (const deployFile of DEPLOYMENT_FILES) {
      if (item.path.toLowerCase().includes(deployFile.toLowerCase())) {
        if (!deploymentFiles.includes(deployFile)) {
          deploymentFiles.push(deployFile);
        }
      }
    }
  }

  // File type distribution
  const fileTypes = {};
  for (const file of files) {
    const ext = file.path.includes('.')
      ? '.' + file.path.split('.').pop().toLowerCase()
      : '(no extension)';
    fileTypes[ext] = (fileTypes[ext] || 0) + 1;
  }

  // Organization score (0-100)
  let organizationScore = 0;
  if (hasSrc) organizationScore += 20;
  if (hasConfig) organizationScore += 10;
  if (hasTests) organizationScore += 20;
  if (hasCI) organizationScore += 15;
  if (maxDepth >= 2 && maxDepth <= 8) organizationScore += 10;
  if (files.length > 3) organizationScore += 5;
  if (dirs.length >= 2) organizationScore += 10;
  if (hasDocker) organizationScore += 10;
  // Penalty for flat structure with many files
  if (dirs.length === 0 && files.length > 10) organizationScore -= 10;
  // Bonus for having a .gitignore
  if (tree.some((item) => item.path === '.gitignore')) organizationScore += 5;

  // Risk assessment lists
  const securityRisks = [];
  const maintainabilityRisks = [];
  const testIssues = [];

  // Expose key detections
  for (const item of tree) {
    const pathLower = item.path.toLowerCase();
    const name = item.path.split('/').pop().toLowerCase();

    // 1. Security Check
    if (
      name.endsWith('.pem') ||
      name.endsWith('.key') ||
      name === 'id_rsa' ||
      name === 'id_dsa' ||
      name === 'id_ecdsa' ||
      name === 'id_ed25519'
    ) {
      securityRisks.push({
        type: 'exposed_key',
        label: 'Exposed Private Key',
        description: `Exposed key file detected: "${item.path}". Private keys should never be committed to git history.`,
        severity: 'critical',
      });
    }

    if (
      name === '.env' ||
      name.startsWith('.env.') ||
      name === 'secrets.yml' ||
      name === 'secrets.json' ||
      name === 'jwt.key' ||
      name === 'jwt.secret'
    ) {
      securityRisks.push({
        type: 'exposed_env',
        label: 'Exposed Env Config',
        description: `Environment configuration/secret file committed: "${item.path}". Secret tokens and settings must be kept out of version control.`,
        severity: 'critical',
      });
    }

    if (
      pathLower.includes('.aws/credentials') ||
      pathLower.includes('.aws/config') ||
      name === 'aws_credentials'
    ) {
      securityRisks.push({
        type: 'exposed_aws_creds',
        label: 'Exposed AWS Credentials',
        description: `AWS configuration/credential file committed: "${item.path}". Cloud provider credentials should never be committed.`,
        severity: 'critical',
      });
    }
  }

  // 2. Maintainability Check
  if (maxDepth > 7) {
    maintainabilityRisks.push({
      type: 'deep_folders',
      label: 'Deep Directory Nesting',
      description: `Maximum structural depth reached ${maxDepth} layers. Deep nesting makes code navigation and refactoring difficult.`,
      severity: 'warning',
    });
  }

  if (dirs.length === 0 && files.length > 10) {
    maintainabilityRisks.push({
      type: 'flat_layout',
      label: 'Flat Project Layout',
      description: 'Multiple files are co-located in the root directory without folders. Project organization is messy.',
      severity: 'warning',
    });
  }

  const hasGitignore = tree.some((item) => item.path === '.gitignore');
  if (!hasGitignore) {
    maintainabilityRisks.push({
      type: 'missing_gitignore',
      label: 'Missing .gitignore',
      description: 'No .gitignore file detected. You risk committing temporary files, node_modules, build directories, or sensitive parameters.',
      severity: 'warning',
    });
  }

  // 3. Testing Check
  if (!hasTests) {
    testIssues.push({
      type: 'missing_tests',
      label: 'No Test Suite',
      description: 'No test suite folders, spec patterns, or testing configs detected. Lack of coverage makes updates risky.',
      severity: 'warning',
    });
  }

  return {
    totalFiles: files.length,
    totalDirs: dirs.length,
    maxDepth,
    hasTests,
    hasCI,
    hasDocker,
    hasConfig,
    hasSrc,
    deploymentFiles,
    fileTypes,
    organizationScore: Math.max(0, Math.min(100, organizationScore)),
    securityRisks,
    maintainabilityRisks,
    testIssues,
  };
}

// ─── COMMIT ANALYSIS ─────────────────────────────────────

/**
 * Analyze recent commit history for quality signals.
 * @param {Array<{ sha: string, message: string, date: string }>} commits
 * @returns {Object} Commit analysis metrics
 */
export function analyzeCommits(commits) {
  if (!commits || commits.length === 0) {
    return {
      totalCount: 0,
      frequency: 'none',
      averageMessageLength: 0,
      hasConventionalCommits: false,
      recentActivity: 'dead',
      commitQuality: 0,
    };
  }

  const totalCount = commits.length;

  // Average message length (first line only)
  const messageLengths = commits.map(
    (c) => (c.message || '').split('\n')[0].length,
  );
  const averageMessageLength = Math.round(
    messageLengths.reduce((sum, len) => sum + len, 0) / totalCount,
  );

  // Conventional commits detection (feat:, fix:, chore:, etc.)
  const conventionalPattern = /^(feat|fix|chore|docs|style|refactor|perf|test|ci|build|revert)(\(.+\))?:/i;
  const conventionalCount = commits.filter((c) =>
    conventionalPattern.test((c.message || '').split('\n')[0]),
  ).length;
  const hasConventionalCommits = conventionalCount / totalCount > 0.3;

  // Commit frequency
  const dates = commits
    .map((c) => (c.date ? new Date(c.date) : null))
    .filter(Boolean)
    .sort((a, b) => b - a);

  let frequency = 'unknown';
  if (dates.length >= 2) {
    const spanDays =
      (dates[0] - dates[dates.length - 1]) / (1000 * 60 * 60 * 24);
    const avgDaysPerCommit = spanDays / (dates.length - 1);

    if (avgDaysPerCommit <= 1) frequency = 'daily';
    else if (avgDaysPerCommit <= 3) frequency = 'frequent';
    else if (avgDaysPerCommit <= 7) frequency = 'weekly';
    else if (avgDaysPerCommit <= 30) frequency = 'monthly';
    else frequency = 'sporadic';
  }

  // Recent activity
  let recentActivity = 'dead';
  if (dates.length > 0) {
    const daysSinceLastCommit =
      (Date.now() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastCommit <= 7) recentActivity = 'active';
    else if (daysSinceLastCommit <= 30) recentActivity = 'recent';
    else if (daysSinceLastCommit <= 90) recentActivity = 'stale';
    else if (daysSinceLastCommit <= 365) recentActivity = 'dormant';
    else recentActivity = 'dead';
  }

  // Commit quality score (0-100)
  let commitQuality = 0;
  if (averageMessageLength > 10) commitQuality += 15;
  if (averageMessageLength > 30) commitQuality += 10;
  if (averageMessageLength > 50) commitQuality += 5;
  if (hasConventionalCommits) commitQuality += 20;
  if (frequency === 'daily' || frequency === 'frequent') commitQuality += 15;
  else if (frequency === 'weekly') commitQuality += 10;
  if (recentActivity === 'active') commitQuality += 20;
  else if (recentActivity === 'recent') commitQuality += 10;
  // Penalty for lazy messages
  const lazyMessages = commits.filter((c) => {
    const msg = (c.message || '').split('\n')[0].toLowerCase();
    return (
      msg === 'update' ||
      msg === 'fix' ||
      msg === 'changes' ||
      msg === 'commit' ||
      msg === 'wip' ||
      msg === '.' ||
      msg === 'initial commit' ||
      msg.length < 5
    );
  }).length;
  const lazyRatio = lazyMessages / totalCount;
  if (lazyRatio > 0.5) commitQuality -= 15;
  else if (lazyRatio > 0.3) commitQuality -= 5;
  // Bonus for multiple contributors in commits
  const uniqueAuthors = new Set(commits.map((c) => c.author)).size;
  if (uniqueAuthors > 1) commitQuality += 10;
  if (uniqueAuthors > 3) commitQuality += 5;

  return {
    totalCount,
    frequency,
    averageMessageLength,
    hasConventionalCommits,
    recentActivity,
    commitQuality: Math.max(0, Math.min(100, commitQuality)),
  };
}

// ─── CLONE / TUTORIAL DETECTION ──────────────────────────

/**
 * Detect whether a repo is likely a clone / tutorial project.
 * @param {string} repoName
 * @param {string|null} description
 * @param {string[]} topics
 * @returns {{ isClone: boolean, cloneType: string|null, confidence: number }}
 */
export function detectCloneProject(repoName, description, topics) {
  const nameLower = (repoName || '').toLowerCase().replace(/[-_]/g, ' ');
  const descLower = (description || '').toLowerCase();
  const topicStr = (topics || []).join(' ').toLowerCase();
  const combined = `${nameLower} ${descLower} ${topicStr}`;

  let maxConfidence = 0;
  let matchedType = null;

  for (const pattern of CLONE_PATTERNS) {
    const patternLower = pattern.toLowerCase();

    // Exact name match → high confidence
    if (nameLower.includes(patternLower)) {
      const confidence = patternLower.includes('clone') ? 90 : 70;
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        matchedType = pattern;
      }
    }

    // Description / topic match → moderate confidence
    if (descLower.includes(patternLower) || topicStr.includes(patternLower)) {
      const confidence = patternLower.includes('clone') ? 75 : 50;
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        matchedType = pattern;
      }
    }
  }

  // Extra signals that boost confidence
  if (maxConfidence > 0) {
    if (/tutorial|course|bootcamp|practice|learning|exercise/i.test(combined)) {
      maxConfidence = Math.min(100, maxConfidence + 15);
    }
    if (/follow[- ]?along|step[- ]?by[- ]?step|guided/i.test(combined)) {
      maxConfidence = Math.min(100, maxConfidence + 10);
    }
  }

  return {
    isClone: maxConfidence >= 50,
    cloneType: matchedType,
    confidence: maxConfidence,
  };
}

// ─── BUZZWORD DETECTION ──────────────────────────────────

/**
 * Detect buzzword density in README and description.
 * @param {string|null} readmeContent
 * @param {string|null} description
 * @returns {{ count: number, words: string[], severity: string }}
 */
export function detectBuzzwords(readmeContent, description) {
  const combined = `${readmeContent || ''} ${description || ''}`.toLowerCase();
  const foundWords = [];

  for (const buzzword of BUZZWORDS) {
    const escaped = buzzword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = combined.match(regex);
    if (matches) {
      foundWords.push(buzzword);
    }
  }

  const count = foundWords.length;

  let severity;
  if (count === 0) severity = 'none';
  else if (count <= 2) severity = 'low';
  else if (count <= 5) severity = 'medium';
  else if (count <= 10) severity = 'high';
  else severity = 'dangerous';

  return { count, words: foundWords, severity };
}

// ─── MASTER ANALYSIS ─────────────────────────────────────

/**
 * Run the complete pre-AI analysis pipeline on all fetched repository data.
 * @param {Object} allData - Combined data from fetchAllRepoData()
 * @returns {Object} Comprehensive analysis result
 */
export function analyzeRepository(allData) {
  const { repo, readme, contents, languages, contributors, commits } = allData;

  const readmeAnalysis = analyzeReadme(readme);
  const fileTreeAnalysis = analyzeFileTree(contents);
  const commitAnalysis = analyzeCommits(commits);
  const cloneDetection = detectCloneProject(
    repo.name,
    repo.description,
    repo.topics,
  );
  const buzzwordAnalysis = detectBuzzwords(readme, repo.description);

  // Merge security risks from file tree and document scanner
  const securityRisks = [
    ...fileTreeAnalysis.securityRisks,
    ...(readmeAnalysis.exposedSecrets || []),
  ];

  return {
    repo,
    readme,
    contents,
    readmeAnalysis,
    fileTreeAnalysis,
    commitAnalysis,
    cloneDetection,
    buzzwordAnalysis,
    languages,
    contributors,
    commits,
    languageCount: Object.keys(languages || {}).length,
    contributorCount: (contributors || []).length,
    timestamp: new Date().toISOString(),
    securityRisks,
    maintainabilityRisks: fileTreeAnalysis.maintainabilityRisks,
    testIssues: fileTreeAnalysis.testIssues,
  };
}
