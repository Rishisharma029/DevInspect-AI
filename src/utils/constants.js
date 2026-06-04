/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — CONSTANTS
   ═══════════════════════════════════════════════════════ */

export const GITHUB_API_BASE = 'https://api.github.com';

export const SCAN_STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  ANALYZING: 'analyzing',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export const PERSONAS = {
  SENIOR_ENGINEER: {
    id: 'senior-engineer',
    name: 'Senior Engineer',
    emoji: '👨‍💻',
    tone: 'Experienced, practical, direct',
    color: '#00e5ff',
    focus: ['architecture', 'maintainability', 'technical debt', 'scalability'],
    tagline: 'Reviews code the way it deserves.',
  },
  RECRUITER: {
    id: 'recruiter',
    name: 'Recruiter',
    emoji: '👔',
    tone: 'Realistic, business-focused',
    color: '#b347d9',
    focus: ['portfolio impact', 'resume value', 'hiring attractiveness'],
    tagline: 'Would this get you hired?',
  },
  DEVOPS_VETERAN: {
    id: 'devops-veteran',
    name: 'DevOps Veteran',
    emoji: '🔧',
    tone: 'Traumatized, suspicious',
    color: '#ffb700',
    focus: ['deployment', 'infrastructure', 'production readiness', 'CI/CD'],
    tagline: 'Has seen things break at 3AM.',
  },
  OPENSOURCE_MAINTAINER: {
    id: 'opensource-maintainer',
    name: 'Open Source Maintainer',
    emoji: '📦',
    tone: 'Irritated but fair',
    color: '#ff6b9d',
    focus: ['contributor friendliness', 'documentation', 'project clarity'],
    tagline: 'Will anyone else understand this?',
  },
  STARTUP_CTO: {
    id: 'startup-cto',
    name: 'Startup CTO',
    emoji: '🚀',
    tone: 'Investor-minded, growth-focused',
    color: '#4488ff',
    focus: ['product potential', 'growth', 'marketability', 'monetization'],
    tagline: 'Is this a product or a side project?',
  },
};

export const METRICS = {
  DOCUMENTATION_DENSITY: {
    id: 'documentation-density',
    name: 'Documentation Density',
    description: 'Measures README depth, screenshots, and examples',
    icon: '📝',
  },
  DEPLOYMENT_CONFIDENCE: {
    id: 'deployment-confidence',
    name: 'Deployment Confidence',
    description: 'Measures live links and hosting evidence',
    icon: '🚀',
  },
  PORTFOLIO_VALUE: {
    id: 'portfolio-value',
    name: 'Portfolio Value',
    description: 'Measures uniqueness, presentation, and impact',
    icon: '💼',
  },
  TECHNICAL_DEBT_FORECAST: {
    id: 'technical-debt-forecast',
    name: 'Technical Debt Forecast',
    description: 'Predicts future maintenance problems',
    icon: '⚠️',
  },
  OPENSOURCE_FRIENDLINESS: {
    id: 'opensource-friendliness',
    name: 'Open Source Friendliness',
    description: 'Measures onboarding quality and contribution support',
    icon: '🤝',
  },
  PRODUCTION_READINESS: {
    id: 'production-readiness',
    name: 'Production Readiness',
    description: 'Measures deployment, architecture, and maturity',
    icon: '🏭',
  },
  TUTORIAL_DEPENDENCY: {
    id: 'tutorial-dependency',
    name: 'Tutorial Dependency',
    description: 'Detects weather apps, calculators, todo apps, clone projects',
    icon: '📺',
  },
  README_POWER_LEVEL: {
    id: 'readme-power-level',
    name: 'README Power Level',
    description: 'Measures professionalism, screenshots, and structure',
    icon: '⚡',
  },
  FOUNDER_HALLUCINATION: {
    id: 'founder-hallucination',
    name: 'Founder Hallucination Severity',
    description: 'Detects visionary/disruptive claims without product evidence',
    icon: '🫧',
  },
};

export const CLONE_PATTERNS = [
  'todo', 'todo-app', 'todoapp', 'to-do',
  'calculator', 'calc',
  'weather', 'weather-app',
  'netflix', 'netflix-clone',
  'spotify', 'spotify-clone',
  'twitter', 'twitter-clone',
  'instagram', 'instagram-clone',
  'facebook', 'facebook-clone',
  'tiktok', 'tiktok-clone',
  'youtube', 'youtube-clone',
  'amazon', 'amazon-clone',
  'uber', 'uber-clone',
  'airbnb', 'airbnb-clone',
  'whatsapp', 'whatsapp-clone',
  'discord', 'discord-clone',
  'slack', 'slack-clone',
  'clone',
];

export const BUZZWORDS = [
  'revolutionary', 'disruptive', 'game-changing', 'game changer',
  'next-generation', 'next-gen', 'cutting-edge', 'cutting edge',
  'world-class', 'best-in-class', 'state-of-the-art',
  'ai-powered', 'ai powered', 'blockchain', 'web3',
  'metaverse', 'paradigm shift', 'synergy', 'leverage',
  'scalable', 'enterprise-grade', 'mission-critical',
  'transformative', 'innovative', 'groundbreaking',
  'industry-leading', 'first-of-its-kind', 'unique',
  'unprecedented', 'unparalleled', 'reimagine', 'reimagined',
  'democratize', 'democratizing', 'empower', 'empowering',
  '10x', '100x', 'moonshot', 'unicorn',
];

export const DEPLOYMENT_FILES = [
  'vercel.json', '.vercel',
  'netlify.toml', '_redirects',
  'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  '.github/workflows', '.gitlab-ci.yml',
  'Procfile', 'app.yaml', 'app.json',
  'fly.toml', 'railway.toml', 'render.yaml',
  'firebase.json', '.firebaserc',
  'serverless.yml', 'serverless.yaml',
  'Makefile',
  'kubernetes', 'k8s',
  'terraform',
  'ansible',
  'helm',
];

export const TEST_PATTERNS = [
  'test', 'tests', '__tests__', 'spec', 'specs',
  '__spec__', 'cypress', 'e2e', 'playwright',
  '.test.', '.spec.', '_test.', '_spec.',
  'jest.config', 'vitest.config', 'karma.conf',
  'mocha', 'pytest', 'phpunit',
];

export const SCAN_MESSAGES = [
  { text: 'Connecting to GitHub...', type: 'scan', delay: 300 },
  { text: 'Authenticating request...', type: 'scan', delay: 500 },
  { text: 'Fetching repository metadata...', type: 'scan', delay: 800 },
  { text: 'Downloading file tree...', type: 'scan', delay: 600 },
  { text: 'Reading README.md...', type: 'scan', delay: 700 },
  { text: 'Analyzing commit history...', type: 'scan', delay: 500 },
  { text: 'Mapping language distribution...', type: 'scan', delay: 400 },
  { text: 'Running buzzword spectrometer...', type: 'warn', delay: 600 },
  { text: 'Calibrating tutorial detector...', type: 'scan', delay: 500 },
  { text: 'Evaluating deployment artifacts...', type: 'scan', delay: 400 },
  { text: 'Measuring README power level...', type: 'scan', delay: 500 },
  { text: 'Checking founder hallucination severity...', type: 'warn', delay: 700 },
  { text: 'Computing technical debt forecast...', type: 'scan', delay: 400 },
  { text: 'Consulting Senior Engineer...', type: 'scan', delay: 600 },
  { text: 'Alerting Recruiter...', type: 'scan', delay: 500 },
  { text: 'Waking up DevOps Veteran...', type: 'warn', delay: 700 },
  { text: 'Bothering Open Source Maintainer...', type: 'scan', delay: 500 },
  { text: 'Emailing Startup CTO...', type: 'scan', delay: 400 },
  { text: 'Generating inspection report...', type: 'scan', delay: 800 },
  { text: 'Analysis complete.', type: 'done', delay: 300 },
];

export const HUMOR_LINES = [
  'Production-ready emotionally, not technically.',
  'Senior in bio. Junior in git history.',
  'This repository smells like YouTube autoplay.',
  'Deployment remains theoretical.',
  'README achieved consciousness.',
  'Works perfectly until another user arrives.',
  'Built different. Deployed never.',
  'Stack Overflow inheritance: 92%',
  'Code compiles. Standards do not.',
  'Minimum viable existential crisis.',
  'git commit -m "fixed it" — narrator: it was not fixed.',
  'This project has more ambition than commits.',
  'Tests: aspirational.',
  'Architecture: yes.',
  'Documentation: the code is self-documenting (it is not).',
];

export const EASTER_EGG_KEYS = {
  BURNOUT_COUNT: 'devinspect_burnout_count',
  SESSION_START: 'devinspect_session_start',
  SCAN_HISTORY: 'devinspect_scan_history',
  UNLOCKED_EGGS: 'devinspect_unlocked_eggs',
  SETTINGS: 'devinspect_settings',
};
