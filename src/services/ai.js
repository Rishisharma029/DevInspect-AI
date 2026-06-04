/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — AI INSPECTION ENGINE
   Powered by Google Gemini 2.0 Flash.
   ═══════════════════════════════════════════════════════ */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PERSONA_CONFIGS, generateFallbackReview } from './personas';
import { HUMOR_LINES } from '../utils/constants';
import { randomItem } from '../utils/helpers';

// ─── CLIENT SETUP ────────────────────────────────────────

/**
 * Create a configured Gemini AI client.
 * @param {string} apiKey - Google AI API key
 * @returns {{ client: GoogleGenerativeAI, model: GenerativeModel }} Client and model instances
 */
export function createAIClient(apiKey) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('Valid Gemini API key is required.');
  }

  const client = new GoogleGenerativeAI(apiKey.trim());
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  return { client, model };
}

// ─── PROMPT CONSTRUCTION ─────────────────────────────────

/**
 * Build the main inspection prompt with all analysis data.
 * @param {Object} analysisData - From analyzeRepository()
 * @param {Object} metrics - From calculateAllMetrics()
 * @returns {string} Complete prompt for Gemini
 */
function buildInspectionPrompt(analysisData, metrics) {
  const { repo, readmeAnalysis, fileTreeAnalysis, commitAnalysis, cloneDetection, buzzwordAnalysis, languageCount, contributorCount } = analysisData;

  // Summarize file types (top 10)
  const fileTypeSummary = Object.entries(fileTreeAnalysis?.fileTypes || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ext, count]) => `${ext}: ${count}`)
    .join(', ');

  // Summarize metrics
  const metricsSummary = Object.entries(metrics)
    .filter(([key, val]) => key !== 'overallScore' && val && typeof val.score === 'number')
    .map(([key, val]) => `- ${key}: ${val.score}/100`)
    .join('\n');

  // Truncate README for prompt
  const readmeExcerpt = analysisData.readme
    ? analysisData.readme.substring(0, 1500) + (analysisData.readme.length > 1500 ? '\n...(truncated)' : '')
    : '(No README)';

  return `You are DevInspect AI — a brutally honest, developer-culture-aware GitHub repository inspector. You combine technical rigor with humor. You have the soul of a senior developer who reviews pull requests for fun and judges repos the way Gordon Ramsay judges food.

IMPORTANT: Respond with ONLY valid JSON. No markdown, no backticks, no explanations outside the JSON.

Analyze this repository and produce a comprehensive inspection report.

═══════════════════════════════════════
REPOSITORY: ${repo?.fullName || repo?.name || 'Unknown'}
═══════════════════════════════════════

Description: ${repo?.description || 'None'}
Primary Language: ${repo?.language || 'Unknown'}
Stars: ${repo?.stars || 0} | Forks: ${repo?.forks || 0} | Open Issues: ${repo?.openIssues || 0}
Contributors: ${contributorCount || 0}
Languages Used: ${languageCount || 0}
Created: ${repo?.createdAt || 'Unknown'}
Last Push: ${repo?.pushedAt || 'Unknown'}
License: ${repo?.license || 'None'}
Homepage: ${repo?.homepage || 'None'}
Topics: ${repo?.topics?.join(', ') || 'None'}
Is Fork: ${repo?.isFork ? 'Yes' : 'No'}
Archived: ${repo?.isArchived ? 'Yes' : 'No'}

═══ README ANALYSIS ═══
Exists: ${readmeAnalysis?.exists ? 'Yes' : 'No'}
Word Count: ${readmeAnalysis?.wordCount || 0}
Headings: ${readmeAnalysis?.headingCount || 0}
Code Blocks: ${readmeAnalysis?.codeBlockCount || 0}
Screenshots: ${readmeAnalysis?.hasScreenshots ? 'Yes' : 'No'}
Badges: ${readmeAnalysis?.hasBadges ? 'Yes' : 'No'}
Setup Instructions: ${readmeAnalysis?.hasSetupInstructions ? 'Yes' : 'No'}
Structure Score: ${readmeAnalysis?.structureScore || 0}/100

═══ FILE STRUCTURE ═══
Files: ${fileTreeAnalysis?.totalFiles || 0} | Dirs: ${fileTreeAnalysis?.totalDirs || 0}
Max Depth: ${fileTreeAnalysis?.maxDepth || 0}
Has Tests: ${fileTreeAnalysis?.hasTests ? 'Yes' : 'No'}
Has CI/CD: ${fileTreeAnalysis?.hasCI ? 'Yes' : 'No'}
Has Docker: ${fileTreeAnalysis?.hasDocker ? 'Yes' : 'No'}
Source Dir: ${fileTreeAnalysis?.hasSrc ? 'Yes' : 'No'}
Deployment Configs: ${fileTreeAnalysis?.deploymentFiles?.join(', ') || 'None'}
File Types: ${fileTypeSummary || 'None'}
Organization Score: ${fileTreeAnalysis?.organizationScore || 0}/100

═══ COMMIT ANALYSIS ═══
Recent Commits: ${commitAnalysis?.totalCount || 0}
Frequency: ${commitAnalysis?.frequency || 'unknown'}
Avg Message Length: ${commitAnalysis?.averageMessageLength || 0} chars
Conventional Commits: ${commitAnalysis?.hasConventionalCommits ? 'Yes' : 'No'}
Activity: ${commitAnalysis?.recentActivity || 'unknown'}
Commit Quality: ${commitAnalysis?.commitQuality || 0}/100

═══ SIGNALS ═══
Clone Detection: ${cloneDetection?.isClone ? `Yes — "${cloneDetection.cloneType}" (${cloneDetection.confidence}%)` : 'No'}
Buzzwords: ${buzzwordAnalysis?.count || 0} found (severity: ${buzzwordAnalysis?.severity || 'none'})${buzzwordAnalysis?.words?.length > 0 ? ` — [${buzzwordAnalysis.words.join(', ')}]` : ''}

═══ COMPUTED METRICS ═══
${metricsSummary}
Overall Score: ${metrics?.overallScore || 0}/100

═══ README EXCERPT ═══
${readmeExcerpt}

═══════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════

Produce a JSON object with this exact structure:

{
  "overallVerdict": "A one-sentence, witty, brutally honest summary of this repository. Make it memorable.",

  "personaReviews": {
    "seniorEngineer": {
      "summary": "2-3 sentence review from the perspective of a senior engineer. Focus on architecture, code quality, and maintainability. Be practical and direct.",
      "keyPoints": ["3-5 specific, actionable observations"],
      "verdict": "One-line final verdict in character",
      "score": 0-100
    },
    "recruiter": {
      "summary": "2-3 sentence review from a tech recruiter's perspective. Focus on portfolio value, presentation, and hire-ability.",
      "keyPoints": ["3-5 specific observations about resume impact"],
      "verdict": "One-line verdict about employability",
      "score": 0-100
    },
    "devopsVeteran": {
      "summary": "2-3 sentence review from a traumatized DevOps engineer. Focus on deployment, infrastructure, and production readiness. Be suspicious.",
      "keyPoints": ["3-5 infrastructure/deployment observations"],
      "verdict": "One-line verdict about production-readiness",
      "score": 0-100
    },
    "opensourceMaintainer": {
      "summary": "2-3 sentence review from a tired open source maintainer. Focus on documentation, contribution experience, and project clarity.",
      "keyPoints": ["3-5 documentation and contributor experience observations"],
      "verdict": "One-line verdict about open source readiness",
      "score": 0-100
    },
    "startupCTO": {
      "summary": "2-3 sentence review from a startup CTO. Focus on product potential, market viability, and execution quality.",
      "keyPoints": ["3-5 product and business observations"],
      "verdict": "One-line verdict about product viability",
      "score": 0-100
    }
  },

  "metricsExplanations": {
    "documentationDensity": ["2-3 specific bullet points justifying this documentation score"],
    "deploymentConfidence": ["2-3 specific bullet points justifying this deployment confidence score"],
    "portfolioValue": ["2-3 specific bullet points justifying this portfolio value score"],
    "technicalDebtForecast": ["2-3 specific bullet points justifying this technical debt score"],
    "openSourceFriendliness": ["2-3 specific bullet points justifying this open source friendliness score"],
    "productionReadiness": ["2-3 specific bullet points justifying this production readiness score"],
    "tutorialDependency": ["2-3 specific bullet points justifying this originality / tutorial dependency score"],
    "readmePowerLevel": ["2-3 specific bullet points justifying this README power level score"],
    "founderHallucination": ["2-3 specific bullet points justifying this founder hallucination score"]
  },

  "improvementRoadmap": [
    {
      "priority": 1,
      "title": "Short title",
      "description": "Specific, actionable improvement with clear steps",
      "effort": "low|medium|high"
    }
  ],

  "roastLine": "A single devastating but funny roast line about this specific repo. Like a comedy roast, not actual cruelty."
}

GUIDELINES:
- Be specific to THIS repo. Reference actual findings.
- Persona reviews should sound like real people with opinions, not corporate templates.
- Improvement roadmap should have 3-6 items, ranked by impact. Be genuinely useful.
- The roast line should be memorable and specific, not generic.
- Scores should roughly align with the computed metrics but can differ based on your analysis.
- Developer humor is encouraged. Corporate speak is forbidden.
- If the repo is genuinely impressive, acknowledge it. Don't force negativity.`;
}

// ─── JSON PARSING ────────────────────────────────────────

/**
 * Attempt to parse JSON from an AI response, handling markdown code blocks.
 * @param {string} text - Raw AI response text
 * @returns {Object|null} Parsed JSON or null
 */
function parseAIResponse(text) {
  if (!text) return null;

  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Continue to cleanup attempts
  }

  // Strip markdown code blocks
  let cleaned = text;
  const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1];
  }

  // Try parsing cleaned version
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue
  }

  // Try finding JSON object boundaries
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch {
      // Give up
    }
  }

  return null;
}

/**
 * Validate and normalize the parsed AI response.
 * @param {Object} parsed - Parsed JSON from AI
 * @param {Object} fallbackMetrics - Fallback metrics (with evidence) if AI explanations are missing
 * @returns {Object} Validated and normalized response
 */
function validateResponse(parsed, fallbackMetrics = {}) {
  const defaultReview = {
    summary: 'Review could not be generated.',
    keyPoints: [],
    verdict: 'No verdict available.',
    score: 50,
  };

  const personaKeys = ['seniorEngineer', 'recruiter', 'devopsVeteran', 'opensourceMaintainer', 'startupCTO'];

  // Ensure personaReviews exist
  const personaReviews = {};
  for (const key of personaKeys) {
    const review = parsed?.personaReviews?.[key];
    personaReviews[key] = {
      summary: review?.summary || defaultReview.summary,
      keyPoints: Array.isArray(review?.keyPoints) ? review.keyPoints : defaultReview.keyPoints,
      verdict: review?.verdict || defaultReview.verdict,
      score: typeof review?.score === 'number' ? Math.max(0, Math.min(100, review.score)) : defaultReview.score,
    };
  }

  // Ensure metricsExplanations exist
  const metricKeys = [
    'documentationDensity',
    'deploymentConfidence',
    'portfolioValue',
    'technicalDebtForecast',
    'openSourceFriendliness',
    'productionReadiness',
    'tutorialDependency',
    'readmePowerLevel',
    'founderHallucination',
  ];

  const metricsExplanations = {};
  for (const key of metricKeys) {
    let expl = parsed?.metricsExplanations?.[key];
    if (!expl) {
      expl = fallbackMetrics[key]?.evidence || ['No specific findings reported.'];
    } else if (typeof expl === 'string') {
      expl = [expl];
    }
    metricsExplanations[key] = Array.isArray(expl) ? expl : [String(expl)];
  }

  // Ensure improvement roadmap
  const improvementRoadmap = Array.isArray(parsed?.improvementRoadmap)
    ? parsed.improvementRoadmap.map((item, idx) => ({
        priority: item.priority || idx + 1,
        title: item.title || `Improvement ${idx + 1}`,
        description: item.description || 'No description provided.',
        effort: ['low', 'medium', 'high'].includes(item.effort) ? item.effort : 'medium',
      }))
    : [];

  return {
    overallVerdict: parsed?.overallVerdict || 'Analysis complete. Opinions were formed.',
    personaReviews,
    metricsExplanations,
    improvementRoadmap,
    roastLine: parsed?.roastLine || randomItem(HUMOR_LINES),
    source: 'ai',
  };
}

// ─── FALLBACK INSPECTION ─────────────────────────────────

/**
 * Generate a complete inspection using rule-based fallback generators.
 * Used when AI is unavailable or fails.
 * @param {Object} analysisData - From analyzeRepository()
 * @param {Object} metrics - From calculateAllMetrics()
 * @returns {Object} Complete inspection result
 */
export function generateFallbackInspection(analysisData, metrics) {
  const overallScore = metrics?.overallScore || 50;

  // Generate persona reviews using fallback generators
  const personaReviews = {
    seniorEngineer: generateFallbackReview(PERSONA_CONFIGS.seniorEngineer, analysisData, metrics),
    recruiter: generateFallbackReview(PERSONA_CONFIGS.recruiter, analysisData, metrics),
    devopsVeteran: generateFallbackReview(PERSONA_CONFIGS.devopsVeteran, analysisData, metrics),
    opensourceMaintainer: generateFallbackReview(PERSONA_CONFIGS.opensourceMaintainer, analysisData, metrics),
    startupCTO: generateFallbackReview(PERSONA_CONFIGS.startupCTO, analysisData, metrics),
  };

  // Generate improvement roadmap from metrics
  const improvementRoadmap = generateFallbackRoadmap(analysisData, metrics);

  // Generate metricsExplanations from metrics evidence
  const metricKeys = [
    'documentationDensity',
    'deploymentConfidence',
    'portfolioValue',
    'technicalDebtForecast',
    'openSourceFriendliness',
    'productionReadiness',
    'tutorialDependency',
    'readmePowerLevel',
    'founderHallucination',
  ];
  const metricsExplanations = {};
  for (const key of metricKeys) {
    metricsExplanations[key] = metrics[key]?.evidence || ['No specific findings reported.'];
  }

  // Generate overall verdict
  let overallVerdict;
  if (overallScore >= 80) {
    overallVerdict = 'Impressive work. This repo has structure, documentation, and evidence of actual engineering discipline.';
  } else if (overallScore >= 60) {
    overallVerdict = 'Decent repo with room for improvement. The foundations are here, but the polish is missing.';
  } else if (overallScore >= 40) {
    overallVerdict = 'Below average. This repo needs significant work in documentation, testing, and deployment to be taken seriously.';
  } else {
    overallVerdict = 'This repository is a work in progress. And by "in progress," I mean it has not progressed.';
  }

  return {
    overallVerdict,
    personaReviews,
    metricsExplanations,
    improvementRoadmap,
    roastLine: randomItem(HUMOR_LINES),
    source: 'fallback',
  };
}

/**
 * Generate a prioritized improvement roadmap from analysis data.
 * @param {Object} analysisData
 * @param {Object} metrics
 * @returns {Array<{ priority: number, title: string, description: string, effort: string }>}
 */
function generateFallbackRoadmap(analysisData, metrics) {
  const roadmap = [];
  let priority = 1;

  // Missing README
  if (!analysisData.readmeAnalysis?.exists) {
    roadmap.push({
      priority: priority++,
      title: 'Add a README',
      description: 'Create a comprehensive README with project description, installation steps, usage examples, and screenshots. This is the single highest-impact change you can make.',
      effort: 'low',
    });
  } else if ((metrics.documentationDensity?.score || 0) < 50) {
    roadmap.push({
      priority: priority++,
      title: 'Improve README Quality',
      description: 'Add setup instructions, code examples, screenshots, and badges. A strong README is the front door of your project.',
      effort: 'low',
    });
  }

  // No tests
  if (!analysisData.fileTreeAnalysis?.hasTests) {
    roadmap.push({
      priority: priority++,
      title: 'Add Tests',
      description: 'Set up a testing framework and write tests for core functionality. Even basic smoke tests dramatically improve confidence and catch regressions.',
      effort: 'medium',
    });
  }

  // No deployment
  if ((metrics.deploymentConfidence?.score || 0) < 30) {
    roadmap.push({
      priority: priority++,
      title: 'Set Up Deployment',
      description: 'Add deployment configuration (Docker, Vercel, Netlify, etc.) and deploy the project. A live URL is the strongest proof your project works.',
      effort: 'medium',
    });
  }

  // No CI/CD
  if (!analysisData.fileTreeAnalysis?.hasCI) {
    roadmap.push({
      priority: priority++,
      title: 'Add CI/CD Pipeline',
      description: 'Set up GitHub Actions or similar CI/CD to run tests and linting on every push. Automate quality gates to catch issues before they merge.',
      effort: 'low',
    });
  }

  // No license
  if (!analysisData.repo?.license) {
    roadmap.push({
      priority: priority++,
      title: 'Add a License',
      description: 'Choose and add a LICENSE file. Without one, your code is legally ambiguous. MIT or Apache 2.0 are safe defaults for most projects.',
      effort: 'low',
    });
  }

  // Buzzword overload
  if (analysisData.buzzwordAnalysis?.severity === 'high' || analysisData.buzzwordAnalysis?.severity === 'dangerous') {
    roadmap.push({
      priority,
      title: 'Reduce Buzzword Density',
      description: 'Replace marketing language with specific technical descriptions. Show what your project does, don\'t tell people it\'s "revolutionary." Evidence beats adjectives.',
      effort: 'low',
    });
  }

  return roadmap.slice(0, 6); // Cap at 6 items
}

// ─── MAIN GENERATION ─────────────────────────────────────

/**
 * Generate a full AI-powered inspection report.
 * Falls back to rule-based generation if AI fails.
 * @param {string} apiKey - Google AI API key
 * @param {Object} analysisData - From analyzeRepository()
 * @param {Object} metrics - From calculateAllMetrics()
 * @returns {Promise<Object>} Complete inspection result
 */
export async function generateInspection(apiKey, analysisData, metrics) {
  // If no API key, go straight to fallback
  if (!apiKey || apiKey.trim().length === 0) {
    console.info('[DevInspect AI] No API key provided. Using fallback inspection.');
    return generateFallbackInspection(analysisData, metrics);
  }

  try {
    const { model } = createAIClient(apiKey);
    const prompt = buildInspectionPrompt(analysisData, metrics);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      console.warn('[DevInspect AI] Empty AI response. Falling back.');
      return generateFallbackInspection(analysisData, metrics);
    }

    const parsed = parseAIResponse(text);

    if (!parsed) {
      console.warn('[DevInspect AI] Failed to parse AI response. Falling back.');
      return generateFallbackInspection(analysisData, metrics);
    }

    return validateResponse(parsed, metrics);
  } catch (error) {
    console.error('[DevInspect AI] AI generation failed:', error.message);

    // Handle specific error types
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      throw new Error('Invalid Gemini API key. Check your key and try again.', { cause: error });
    }

    if (error.message?.includes('RATE_LIMIT') || error.message?.includes('429')) {
      console.warn('[DevInspect AI] Rate limited. Using fallback.');
      return {
        ...generateFallbackInspection(analysisData, metrics),
        rateLimited: true,
      };
    }

    if (error.message?.includes('SAFETY')) {
      console.warn('[DevInspect AI] Safety filter triggered. Using fallback.');
      return {
        ...generateFallbackInspection(analysisData, metrics),
        safetyFiltered: true,
      };
    }

    // For other errors, use fallback gracefully
    return generateFallbackInspection(analysisData, metrics);
  }
}
