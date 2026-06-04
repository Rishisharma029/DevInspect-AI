/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — PERSONA REVIEW ENGINE
   Five distinct, opinionated reviewers.
   ═══════════════════════════════════════════════════════ */

import { PERSONAS } from '../utils/constants';

// ─── PERSONA DEFINITIONS ─────────────────────────────────

/**
 * Full persona objects with AI system prompts and rule-based fallback generators.
 * Each persona has a unique voice, focus, and set of opinions.
 */
export const PERSONA_CONFIGS = {
  seniorEngineer: {
    ...PERSONAS.SENIOR_ENGINEER,
    systemPrompt: `You are a senior software engineer with 12+ years of experience. You've reviewed thousands of PRs and have strong opinions about architecture, code organization, and maintainability. You are practical, direct, and occasionally sarcastic. You notice structural issues immediately. You care about:
- Directory structure and separation of concerns
- Test coverage and CI/CD pipelines
- Dependency management and version pinning
- Whether the README actually explains how to run the project
- Commit message quality (you silently judge "fixed stuff")
You speak like a tired but experienced mentor who has seen it all. Your tone is dry humor mixed with genuine helpfulness. You do NOT use corporate speak.`,

    /**
     * Generate a fallback rule-based review.
     * @param {Object} analysis - Full analysis data
     * @param {Object} metrics - All calculated metrics
     * @returns {Object} Review with summary, keyPoints, verdict, score
     */
    fallbackGenerator(analysis, metrics) {
      const points = [];
      let score = 50;

      // Architecture assessment
      if (analysis.fileTreeAnalysis?.hasSrc) {
        points.push('Source directory structure exists. Someone read a "best practices" article. Good.');
        score += 8;
      } else if (analysis.fileTreeAnalysis?.totalFiles > 5) {
        points.push('No src/ directory. All files coexist in the root like a freshman dorm room.');
        score -= 5;
      }

      // Test assessment
      if (analysis.fileTreeAnalysis?.hasTests) {
        points.push('Tests detected. You are already better than 60% of repos I review.');
        score += 12;
      } else {
        points.push('No tests found. "It works on my machine" is not a testing strategy.');
        score -= 10;
      }

      // CI/CD
      if (analysis.fileTreeAnalysis?.hasCI) {
        points.push('CI/CD pipeline exists. Automated quality gates. I can almost respect this.');
        score += 10;
      }

      // Commit quality
      if (analysis.commitAnalysis?.hasConventionalCommits) {
        points.push('Conventional commits detected. Disciplined. Rare. Appreciated.');
        score += 8;
      } else if (analysis.commitAnalysis?.averageMessageLength < 15) {
        points.push('Average commit message is shorter than a tweet. We need to talk.');
        score -= 8;
      }

      // Organization
      if (metrics.technicalDebtForecast?.score >= 70) {
        points.push('Technical debt is manageable. Future maintainers will merely dislike you, not despise you.');
        score += 5;
      } else if (metrics.technicalDebtForecast?.score < 40) {
        points.push('Technical debt is compounding. This codebase will need therapy in 6 months.');
        score -= 5;
      }

      // README
      if (analysis.readmeAnalysis?.hasSetupInstructions) {
        points.push('Setup instructions in README. I can actually run this. Novel concept.');
        score += 5;
      }

      score = Math.max(0, Math.min(100, score));

      const summaries = {
        high: 'Structurally sound. Not perfect, but I\'ve seen far worse in production. You clearly have some engineering discipline.',
        mid: 'Average engineering quality. There are foundations here, but also some decisions that will haunt you at 2 AM during an incident.',
        low: 'This needs significant structural work. The bones are there, but the architecture is held together by optimism and string.',
      };

      return {
        summary: score >= 65 ? summaries.high : score >= 40 ? summaries.mid : summaries.low,
        keyPoints: points,
        verdict: score >= 70 ? 'Would approve the PR (with comments).' : score >= 45 ? 'Request changes. Come back when tests exist.' : 'Declined. Start over with a README that has setup instructions.',
        score,
      };
    },
  },

  recruiter: {
    ...PERSONAS.RECRUITER,
    systemPrompt: `You are a tech recruiter who has screened thousands of GitHub profiles. You are realistic, business-focused, and care about presentation. You know what hiring managers actually look for. You focus on:
- Whether this project stands out on a resume
- The presentation quality (README, screenshots, live demo)
- How this compares to the 500 other candidates' repos
- Red flags that would make a hiring manager skip this
- Whether the tech stack is relevant and marketable
You are honest but not cruel. You have seen too many todo apps. Your tone is professional with a dash of "let me be real with you."`,

    fallbackGenerator(analysis) {
      const points = [];
      let score = 50;

      // Presentation
      if (analysis.readmeAnalysis?.hasScreenshots) {
        points.push('Screenshots in README. Visual proof exists. This already beats 70% of candidates.');
        score += 12;
      } else {
        points.push('No screenshots. Hiring managers spend 30 seconds per repo. A wall of text won\'t cut it.');
        score -= 8;
      }

      // Live demo
      if (analysis.repo?.homepage) {
        points.push('Live demo link present. This is the #1 thing that makes a repo stand out. Smart move.');
        score += 15;
      } else {
        points.push('No live demo link. If I can\'t click and see it work, it didn\'t happen.');
        score -= 10;
      }

      // Clone detection
      if (analysis.cloneDetection?.isClone) {
        points.push(`This looks like a ${analysis.cloneDetection.cloneType || 'tutorial'} project. Every bootcamp grad has one. It won't differentiate you.`);
        score -= 15;
      } else {
        points.push('Original project concept. That alone puts you in the top 30% of candidates I see.');
        score += 10;
      }

      // Description
      if (analysis.repo?.description && analysis.repo.description.length > 30) {
        points.push('Good repo description. Shows you can communicate what you built — critical for interviews.');
        score += 5;
      }

      // Stars
      if (analysis.repo?.stars >= 10) {
        points.push(`${analysis.repo.stars} stars. Social proof matters. This shows real interest.`);
        score += 8;
      }

      // Topics
      if (analysis.repo?.topics?.length >= 3) {
        points.push('Topics/tags are set. Searchability matters. Attention to detail noted.');
        score += 3;
      }

      score = Math.max(0, Math.min(100, score));

      const summaries = {
        high: 'Strong portfolio piece. This would catch a hiring manager\'s eye. Clean, demonstrable, original.',
        mid: 'Serviceable portfolio project. Not bad, but needs polish to stand out in a competitive market.',
        low: 'As a recruiter, I\'d scroll past this. It needs significant presentation upgrades to be resume-worthy.',
      };

      return {
        summary: score >= 65 ? summaries.high : score >= 40 ? summaries.mid : summaries.low,
        keyPoints: points,
        verdict: score >= 70 ? 'Would forward to hiring manager.' : score >= 45 ? 'Needs work before putting on resume.' : 'Private this repo before your next job search.',
        score,
      };
    },
  },

  devopsVeteran: {
    ...PERSONAS.DEVOPS_VETERAN,
    systemPrompt: `You are a DevOps engineer who has been on-call for 8 years. You have PTSD from production incidents. You are suspicious of everything and trust nothing. You immediately look for:
- Deployment configuration (Docker, CI/CD, cloud configs)
- Environment variable management
- Health checks and monitoring
- Whether this thing can actually run anywhere besides localhost
- Security red flags (exposed secrets, no .gitignore, etc.)
- Infrastructure as code
You speak like someone who has been paged at 3 AM too many times. Your humor is dark and infrastructure-flavored. You assume everything will break because it usually does.`,

    fallbackGenerator(analysis) {
      const points = [];
      let score = 50;

      // Docker
      if (analysis.fileTreeAnalysis?.hasDocker) {
        points.push('Dockerfile detected. At least I can containerize this disaster. That\'s something.');
        score += 15;
      } else {
        points.push('No Docker. So this runs on your machine. Cool. Will it run on mine? On the server? In prod? No.');
        score -= 12;
      }

      // CI/CD
      if (analysis.fileTreeAnalysis?.hasCI) {
        points.push('CI/CD pipeline exists. Someone has experienced the pain of manual deploys. Respect.');
        score += 12;
      } else {
        points.push('No CI/CD. So we\'re FTP-ing to production? Sending ZIPs via email? Carrier pigeon?');
        score -= 10;
      }

      // Deployment files
      const deployCount = analysis.fileTreeAnalysis?.deploymentFiles?.length || 0;
      if (deployCount >= 2) {
        points.push(`${deployCount} deployment configs found. This person has deployed before. I can sleep tonight.`);
        score += 10;
      } else if (deployCount === 0) {
        points.push('Zero deployment configuration. This project lives on localhost and dies on localhost.');
        score -= 8;
      }

      // .gitignore
      const hasGitignore = analysis.fileTreeAnalysis?.totalFiles > 0 &&
        analysis.contents?.tree?.some((f) => f.path === '.gitignore');
      if (hasGitignore) {
        points.push('.gitignore present. At least we\'re not committing node_modules. Small victories.');
        score += 3;
      } else {
        points.push('No .gitignore detected. *checks nervously for committed secrets*');
        score -= 8;
      }

      // Tests
      if (analysis.fileTreeAnalysis?.hasTests) {
        points.push('Tests exist. If they pass, maybe — just maybe — this won\'t page me at 3 AM.');
        score += 8;
      }

      // Homepage (deployment evidence)
      if (analysis.repo?.homepage) {
        points.push('Live URL detected. It\'s deployed somewhere. I\'m cautiously optimistic (which is my maximum emotion).');
        score += 10;
      }

      score = Math.max(0, Math.min(100, score));

      const summaries = {
        high: 'Deployment-ready by my standards, which are unreasonably high because production has hurt me. This could survive real traffic.',
        mid: 'Some deployment maturity, but gaps that would keep me up at night. Which is saying something because everything keeps me up at night.',
        low: 'This project is a localhost resident with no ambition of deployment. I\'ve seen production incidents caused by repos with more maturity than this.',
      };

      return {
        summary: score >= 65 ? summaries.high : score >= 40 ? summaries.mid : summaries.low,
        keyPoints: points,
        verdict: score >= 70 ? 'Would cautiously deploy to staging. Not prod. Never prod on a Friday.' : score >= 45 ? 'Needs containerization and CI before I touch any server with this.' : 'Localhost Veteran. This project has never seen a server and probably shouldn\'t.',
        score,
      };
    },
  },

  opensourceMaintainer: {
    ...PERSONAS.OPENSOURCE_MAINTAINER,
    systemPrompt: `You are an open source maintainer who manages several popular packages. You are tired. You receive 50 issues a day, half of them are "it doesn't work" with no reproduction steps. You care deeply about:
- Documentation quality and completeness
- Contributing guidelines and issue templates
- License clarity
- Whether a newcomer could understand and contribute
- README structure (you have opinions about every heading)
- Code of conduct and community standards
You are irritated but fair. You appreciate effort but have zero tolerance for laziness in documentation. Your tone is a tired parent who still wants to teach.`,

    fallbackGenerator(analysis) {
      const points = [];
      let score = 50;

      // README
      if (analysis.readmeAnalysis?.exists) {
        if (analysis.readmeAnalysis.wordCount > 300) {
          points.push('README has substance. More than 300 words. Someone actually explained what this does.');
          score += 10;
        } else {
          points.push('README exists but is thin. I maintain packages with more words in the error messages.');
          score -= 5;
        }
      } else {
        points.push('No README. None. I maintain a package with 10,000 downloads/week and even I have a README. Come on.');
        score -= 20;
      }

      // License
      if (analysis.repo?.license) {
        points.push(`Licensed under ${analysis.repo.license}. Thank you. You wouldn't believe how many repos forget this.`);
        score += 12;
      } else {
        points.push('No license. Legally, nobody can use this. Including you, technically. Add a LICENSE file.');
        score -= 15;
      }

      // Contributing
      if (analysis.readmeAnalysis?.hasContributing) {
        points.push('Contributing guidelines exist. Bless you. My issue queue is slightly less painful because of people like you.');
        score += 10;
      } else {
        points.push('No contributing guidelines. So when someone wants to help, they just... guess? Cool.');
        score -= 5;
      }

      // Setup instructions
      if (analysis.readmeAnalysis?.hasSetupInstructions) {
        points.push('Setup instructions present. A contributor could actually get this running. Revolutionary.');
        score += 8;
      } else {
        points.push('No setup instructions. "Just clone and run" — run what? With what? Where?');
        score -= 8;
      }

      // Code blocks
      if (analysis.readmeAnalysis?.codeBlockCount >= 2) {
        points.push('Code examples in README. You show, not just tell. I wish more projects did this.');
        score += 5;
      }

      // Badges
      if (analysis.readmeAnalysis?.hasBadges) {
        points.push('Badges present. Build status, coverage, version — the holy trinity of OSS credibility.');
        score += 5;
      }

      score = Math.max(0, Math.min(100, score));

      const summaries = {
        high: 'Well-documented and contributor-friendly. As a maintainer, this is the kind of project I\'d actually accept PRs from.',
        mid: 'Documentation effort is visible but incomplete. It\'s like a house with walls but no doors — you can see the potential but can\'t quite get in.',
        low: 'Documentation is critically lacking. I receive better-documented bug reports than this entire repository.',
      };

      return {
        summary: score >= 65 ? summaries.high : score >= 40 ? summaries.mid : summaries.low,
        keyPoints: points,
        verdict: score >= 70 ? 'Would accept PRs from this project.' : score >= 45 ? 'Needs docs improvement before community growth is possible.' : 'This project will die alone without better documentation.',
        score,
      };
    },
  },

  startupCTO: {
    ...PERSONAS.STARTUP_CTO,
    systemPrompt: `You are a startup CTO who has raised Series A and now evaluates technical talent and projects. You think in terms of product, growth, and market fit. You care about:
- Product potential and market viability
- Technical execution quality
- Whether this could scale
- The gap between ambition and execution
- Whether the tech stack choices make business sense
- Buzzword-to-substance ratio
You speak like someone who reads Hacker News, attends YC demo days, and has strong opinions about developer tools. Your tone is enthusiastic but analytical. You can smell vaporware from a mile away.`,

    fallbackGenerator(analysis) {
      const points = [];
      let score = 50;

      // Product evidence
      if (analysis.repo?.homepage) {
        points.push('Live product URL. This isn\'t just code — it\'s a deployed product. That\'s the minimum bar and you cleared it.');
        score += 15;
      } else {
        points.push('No live product link. In startup terms: you have an idea, not a product. Ship it.');
        score -= 10;
      }

      // Buzzword assessment
      if (analysis.buzzwordAnalysis?.severity === 'dangerous' || analysis.buzzwordAnalysis?.severity === 'high') {
        points.push('Buzzword density is off the charts. This reads like a pitch deck, not a README. Show, don\'t tell.');
        score -= 15;
      } else if (analysis.buzzwordAnalysis?.count === 0) {
        points.push('Zero buzzwords. Refreshingly honest. Though a little marketing wouldn\'t hurt.');
        score += 5;
      }

      // Stars & traction
      if (analysis.repo?.stars >= 100) {
        points.push(`${analysis.repo.stars} stars. Traction. Real users found this useful. That's product-market fit signal.`);
        score += 15;
      } else if (analysis.repo?.stars >= 10) {
        points.push('Some stars. Early traction. Not product-market fit, but there\'s a pulse.');
        score += 5;
      }

      // Clone check
      if (analysis.cloneDetection?.isClone) {
        points.push('This is a clone project. Clone projects don\'t get funded, don\'t get users, and don\'t get you hired at startups.');
        score -= 12;
      }

      // Multiple languages (complexity)
      if (analysis.languageCount >= 3) {
        points.push(`${analysis.languageCount} languages. Full-stack capability. This person can build an entire product, not just a component.`);
        score += 8;
      }

      // Description quality
      if (analysis.repo?.description && analysis.repo.description.length > 50) {
        points.push('Strong project description. You can articulate what you built — essential for fundraising and hiring.');
        score += 5;
      }

      // Forks (people want to build on this)
      if (analysis.repo?.forks >= 5) {
        points.push(`${analysis.repo.forks} forks. People are building on this. That's ecosystem potential.`);
        score += 8;
      }

      score = Math.max(0, Math.min(100, score));

      const summaries = {
        high: 'Product-quality execution. This demonstrates both technical skill and product thinking. Would discuss at a partner meeting.',
        mid: 'Decent technical execution, but the product story is unclear. Needs clearer value proposition and deployment.',
        low: 'This is a side project, not a product. Nothing wrong with that, but don\'t mistake one for the other.',
      };

      return {
        summary: score >= 65 ? summaries.high : score >= 40 ? summaries.mid : summaries.low,
        keyPoints: points,
        verdict: score >= 70 ? 'Would fund the person. Maybe not this exact product, but the builder.' : score >= 45 ? 'Promising builder, but this project needs a clearer product narrative.' : 'Side project energy. Ship something real, then let\'s talk.',
        score,
      };
    },
  },
};

// ─── PUBLIC API ──────────────────────────────────────────

/**
 * Get all persona config objects.
 * @returns {Object} All persona configs keyed by persona ID
 */
export function getAllPersonas() {
  return PERSONA_CONFIGS;
}

/**
 * Construct a prompt string for AI-driven persona review.
 * @param {Object} persona - Persona config object
 * @param {Object} analysisData - Full analysis data
 * @returns {string} Constructed prompt for the AI
 */
export function generatePersonaPrompt(persona, analysisData) {
  const { repo, readmeAnalysis, fileTreeAnalysis, commitAnalysis, cloneDetection, buzzwordAnalysis } = analysisData;

  return `${persona.systemPrompt}

You are reviewing the GitHub repository "${repo?.fullName || repo?.name || 'Unknown'}".

Repository Overview:
- Description: ${repo?.description || 'None provided'}
- Primary Language: ${repo?.language || 'Unknown'}
- Stars: ${repo?.stars || 0} | Forks: ${repo?.forks || 0} | Open Issues: ${repo?.openIssues || 0}
- Created: ${repo?.createdAt || 'Unknown'} | Last pushed: ${repo?.pushedAt || 'Unknown'}
- License: ${repo?.license || 'None'}
- Homepage: ${repo?.homepage || 'None'}
- Topics: ${repo?.topics?.join(', ') || 'None'}
- Is Fork: ${repo?.isFork ? 'Yes' : 'No'}

README Analysis:
- Exists: ${readmeAnalysis?.exists ? 'Yes' : 'No'}
- Word Count: ${readmeAnalysis?.wordCount || 0}
- Headings: ${readmeAnalysis?.headingCount || 0}
- Code Blocks: ${readmeAnalysis?.codeBlockCount || 0}
- Has Screenshots: ${readmeAnalysis?.hasScreenshots ? 'Yes' : 'No'}
- Has Badges: ${readmeAnalysis?.hasBadges ? 'Yes' : 'No'}
- Has Setup Instructions: ${readmeAnalysis?.hasSetupInstructions ? 'Yes' : 'No'}
- Structure Score: ${readmeAnalysis?.structureScore || 0}/100

File Structure:
- Total Files: ${fileTreeAnalysis?.totalFiles || 0} | Directories: ${fileTreeAnalysis?.totalDirs || 0}
- Max Depth: ${fileTreeAnalysis?.maxDepth || 0}
- Has Tests: ${fileTreeAnalysis?.hasTests ? 'Yes' : 'No'}
- Has CI/CD: ${fileTreeAnalysis?.hasCI ? 'Yes' : 'No'}
- Has Docker: ${fileTreeAnalysis?.hasDocker ? 'Yes' : 'No'}
- Has Source Dir: ${fileTreeAnalysis?.hasSrc ? 'Yes' : 'No'}
- Deployment Files: ${fileTreeAnalysis?.deploymentFiles?.join(', ') || 'None'}
- Organization Score: ${fileTreeAnalysis?.organizationScore || 0}/100

Commit Analysis:
- Recent Commits: ${commitAnalysis?.totalCount || 0}
- Frequency: ${commitAnalysis?.frequency || 'unknown'}
- Avg Message Length: ${commitAnalysis?.averageMessageLength || 0}
- Conventional Commits: ${commitAnalysis?.hasConventionalCommits ? 'Yes' : 'No'}
- Recent Activity: ${commitAnalysis?.recentActivity || 'unknown'}

Signals:
- Clone Detection: ${cloneDetection?.isClone ? `Yes (${cloneDetection.cloneType}, ${cloneDetection.confidence}% confidence)` : 'No'}
- Buzzwords Found: ${buzzwordAnalysis?.count || 0} (${buzzwordAnalysis?.severity || 'none'})${buzzwordAnalysis?.words?.length > 0 ? ` — ${buzzwordAnalysis.words.join(', ')}` : ''}

Your focus areas: ${persona.focus?.join(', ') || 'general review'}

Provide your review focusing on your specific expertise and personality. Be opinionated, specific, and genuinely useful. Include humor that matches your character.`;
}

/**
 * Generate a complete fallback review using rule-based generators (no AI).
 * @param {Object} persona - Persona config object
 * @param {Object} analysisData - Full analysis data
 * @param {Object} metrics - All calculated metrics
 * @returns {Object} Review object with summary, keyPoints, verdict, score
 */
export function generateFallbackReview(persona, analysisData, metrics) {
  if (typeof persona.fallbackGenerator === 'function') {
    return persona.fallbackGenerator(analysisData, metrics);
  }

  // Ultimate fallback if somehow generator is missing
  return {
    summary: 'Analysis complete. This repository exists. That is confirmed.',
    keyPoints: ['Repository was analyzed.', 'Results are inconclusive due to missing persona logic.'],
    verdict: 'No opinion formed.',
    score: 50,
  };
}
