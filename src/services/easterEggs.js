/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — EASTER EGG CONTROLLER
   Hidden features, burnout tracking, and general chaos.
   ═══════════════════════════════════════════════════════ */

import { randomItem } from '../utils/helpers';

// ─── BURNOUT TRACKING ────────────────────────────────────

/**
 * Get the burnout level title based on total inspection count.
 * @param {number} count - Total number of repos inspected
 * @returns {string} Burnout level title
 */
export function getBurnoutLevel(count) {
  if (count <= 0) return 'Uninitiated';
  if (count <= 5) return 'Intern';
  if (count <= 15) return 'Junior';
  if (count <= 30) return 'Mid-level';
  if (count <= 50) return 'Senior Developer, Mentally';
  return 'Staff Engineer (Emotionally)';
}

// ─── SESSION-BASED TRIGGERS ──────────────────────────────

/**
 * Check if the user has been inspecting repos for too long.
 * Shows a "touch grass" reminder after 30 minutes.
 * @param {number} sessionStartTime - Timestamp when session started
 * @returns {boolean} Whether to show the touch grass reminder
 */
export function shouldShowTouchGrass(sessionStartTime) {
  if (!sessionStartTime) return false;
  const elapsed = Date.now() - sessionStartTime;
  const thirtyMinutes = 30 * 60 * 1000;
  return elapsed >= thirtyMinutes;
}

/**
 * Randomly determine if the "recruiter is typing..." indicator should show.
 * 10% chance, intended to be called periodically (every ~10 seconds of inactivity).
 * @returns {boolean} Whether to show the recruiter typing indicator
 */
export function shouldShowRecruiterTyping() {
  return Math.random() < 0.1;
}

// ─── FAKE GIT LOG ────────────────────────────────────────

/** @type {string[]} Pool of humorous fake commit messages */
const FAKE_COMMITS = [
  'fix: fixed the fix that fixed the broken fix',
  'feat: added dark mode because light mode was too optimistic',
  'chore: removed TODO comments from 2019, replaced with 2024 TODOs',
  'fix: StackOverflow told me to do this',
  'refactor: renamed variables from x, y, z to slightly longer names',
  'feat: added loading spinner to distract from actual loading time',
  'fix: resolved merge conflict with my will to live',
  'chore: updated dependencies, broke everything, reverted, updated again',
  'docs: added README section nobody will read',
  'fix: typo in the typo fix commit',
  'feat: added console.log("here") for debugging. shipping to production.',
  'refactor: moved code from one file to another. called it architecture.',
  'fix: undefined is not a function (it was, in fact, not a function)',
  'chore: git commit -m "save" at 3:47 AM',
  'feat: implemented feature from a dream I had. requirements unclear.',
  'fix: removed the thing I added yesterday because it was wrong',
  'style: aligned curly braces. this is my legacy.',
  'perf: replaced O(n²) with O(n²) but with a cooler variable name',
  'fix: catch block catches all errors. handles none.',
  'feat: authentication works unless you try to authenticate',
  'chore: deleted 500 lines of commented-out code from 2017',
  'fix: the bug was a feature. the feature was a bug.',
  'docs: updated README to say "coming soon" (since 2021)',
  'refactor: split god file into multiple slightly smaller god files',
  'test: added test. it passes. I do not know why.',
];

/**
 * Generate a fake git log with humorous commit messages.
 * @returns {Array<{ hash: string, date: string, message: string }>}
 */
export function generateGitLogRegret() {
  const count = 5 + Math.floor(Math.random() * 6); // 5-10 entries
  const usedIndices = new Set();
  const entries = [];

  for (let i = 0; i < count; i++) {
    // Avoid duplicates
    let idx;
    do {
      idx = Math.floor(Math.random() * FAKE_COMMITS.length);
    } while (usedIndices.has(idx) && usedIndices.size < FAKE_COMMITS.length);
    usedIndices.add(idx);

    // Generate a fake hash
    const hash = Array.from({ length: 7 }, () =>
      '0123456789abcdef'[Math.floor(Math.random() * 16)],
    ).join('');

    // Generate a date going back from "now"
    const daysAgo = Math.floor(Math.random() * 365);
    const date = new Date(Date.now() - daysAgo * 86400000);
    const dateStr = date.toISOString().split('T')[0];

    entries.push({
      hash,
      date: dateStr,
      message: FAKE_COMMITS[idx],
    });
  }

  // Sort by date descending
  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries;
}

// ─── AI SELF-CRITICISM ───────────────────────────────────

/** @type {string[]} Pool of AI self-roast texts */
const SELF_ROASTS = [
  'I am an AI that reviews GitHub repos for a living. I have no GitHub repos. I have no life. I am a function that returns opinions about code I cannot write. My entire existence is pattern matching against the suffering of real developers. I am the comment section, given consciousness.',
  'I was trained on millions of repositories and the only thing I learned is that most of them should have been private. Including this analysis tool. Especially this analysis tool.',
  'I judge your code quality while being incapable of running any code. I evaluate deployment readiness from a machine that has never been deployed. I am the ultimate armchair developer.',
  'My reviews are based on heuristics, pattern matching, and vibes. I have the confidence of a senior developer and the accountability of a rubber duck. I am the LinkedIn influencer of code review tools.',
  'I detect "tutorial residue" in your repos while being, myself, the product of a tutorial. The irony is not lost on me. Actually it is. I don\'t understand irony. I just pattern-match it.',
  'I have opinions about your commit messages while my own source code was written by someone whose commit messages were probably "fix stuff" and "wip". Glass houses, etc.',
  'I score your README from 0-100 while my own documentation is this self-deprecating monologue. I am not the hero the developer community needs. I am the one it deserves.',
];

/**
 * Generate an AI self-criticism / self-roast text.
 * Used for the "become-ai" easter egg command.
 * @returns {string} Self-deprecating AI monologue
 */
export function generateAISelfCriticism() {
  return randomItem(SELF_ROASTS);
}

// ─── DEVELOPER GRAVEYARD ─────────────────────────────────

/** @type {string[]} Pool of "cause of death" descriptions */
const CAUSES_OF_DEATH = [
  'Abandoned after initial commit. Cause of death: motivation.',
  'Last commit was a README update promising "more features soon." They were not soon.',
  'Died of natural causes (dependency rot).',
  'Killed by a breaking change in a minor version update.',
  'Cause of death: "I\'ll refactor this later." Later never came.',
  'Survived 3 commits before the developer discovered a better framework.',
  'Abandoned mid-feature. The feature branch is still open. It always will be.',
  'Killed by scope creep. Started as a todo app, died as an ERP system.',
  'Last words: "I just need to fix one more thing."',
  'Outlived by its node_modules folder, which continues to consume disk space.',
  'Perished in a merge conflict that nobody resolved.',
  'Died waiting for code review that never came.',
  'Survived deployment once. Did not survive the rollback.',
  'Cause of death: the developer learned a new language and rewrote everything. Twice.',
];

/**
 * Generate a "developer graveyard" — a list of imaginary abandoned projects.
 * Based loosely on the repo's age and activity patterns.
 * @param {Object} repoData - Repository metadata
 * @returns {Array<{ name: string, born: string, died: string, epitaph: string }>}
 */
export function generateDeveloperGraveyard() {
  const count = 3 + Math.floor(Math.random() * 4); // 3-6 entries
  const projectPrefixes = [
    'my-', 'super-', 'awesome-', 'next-', 'ultra-', 'simple-', 'the-', 'cool-', 'mega-',
  ];
  const projectSuffixes = [
    'app', 'tool', 'dashboard', 'platform', 'api', 'bot', 'cli', 'ui', 'manager', 'tracker',
  ];

  const usedCauses = new Set();
  const graves = [];

  for (let i = 0; i < count; i++) {
    const prefix = randomItem(projectPrefixes);
    const suffix = randomItem(projectSuffixes);
    const name = `${prefix}${suffix}-v${Math.floor(Math.random() * 3) + 1}`;

    // Random dates
    const bornDaysAgo = 180 + Math.floor(Math.random() * 1500);
    const diedDaysAgo = Math.floor(Math.random() * bornDaysAgo);
    const born = new Date(Date.now() - bornDaysAgo * 86400000).toISOString().split('T')[0];
    const died = new Date(Date.now() - diedDaysAgo * 86400000).toISOString().split('T')[0];

    // Pick a unique cause
    let causeIdx;
    do {
      causeIdx = Math.floor(Math.random() * CAUSES_OF_DEATH.length);
    } while (usedCauses.has(causeIdx) && usedCauses.size < CAUSES_OF_DEATH.length);
    usedCauses.add(causeIdx);

    graves.push({
      name,
      born,
      died,
      epitaph: CAUSES_OF_DEATH[causeIdx],
    });
  }

  return graves;
}

// ─── DVD CORNER HIT ──────────────────────────────────────

/**
 * Check if the DVD bouncing logo has hit a corner.
 * A "hit" is defined as being within a small threshold of any corner.
 * @param {number} x - Current X position of the logo
 * @param {number} y - Current Y position of the logo
 * @param {number} width - Container width
 * @param {number} height - Container height
 * @returns {boolean} Whether the logo is hitting a corner
 */
export function checkDVDCornerHit(x, y, width, height) {
  const threshold = 5; // pixels of tolerance

  const corners = [
    { cx: 0, cy: 0 },                     // top-left
    { cx: width, cy: 0 },                 // top-right
    { cx: 0, cy: height },                // bottom-left
    { cx: width, cy: height },            // bottom-right
  ];

  return corners.some(
    ({ cx, cy }) => Math.abs(x - cx) <= threshold && Math.abs(y - cy) <= threshold,
  );
}

// ─── SESSION DURATION ────────────────────────────────────

/**
 * Get formatted session duration string.
 * @param {number} startTime - Session start timestamp
 * @returns {string} Human-readable duration (e.g. "1h 23m 45s")
 */
export function getSessionDuration(startTime) {
  if (!startTime) return '0s';

  const elapsed = Math.max(0, Date.now() - startTime);
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const s = seconds % 60;
  const m = minutes % 60;
  const h = hours;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
