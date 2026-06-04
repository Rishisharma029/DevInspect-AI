/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — DETECTION SYSTEM
   Special condition detectors with witty verdicts.
   ═══════════════════════════════════════════════════════ */

/**
 * @typedef {Object} Detection
 * @property {boolean} detected - Whether the condition was detected
 * @property {string} label - Short label for the detection
 * @property {string} description - Witty, opinionated description
 * @property {'info'|'warning'|'critical'|'legendary'} severity
 */

// ─── INDIVIDUAL DETECTORS ────────────────────────────────

/**
 * Detect if the README is missing entirely.
 * @param {string|null} readmeContent
 * @returns {Detection}
 */
export function detectMissingReadme(readmeContent) {
  const detected = !readmeContent || readmeContent.trim().length === 0;

  return {
    detected,
    label: 'README STATUS: Missing In Action',
    description: detected
      ? 'This repository has no README. The code speaks for itself, apparently. Spoiler: it does not. A README is the bare minimum social contract between you and anyone who stumbles upon this repo. Add one. Today.'
      : 'README exists. The bare minimum has been met.',
    severity: detected ? 'critical' : 'info',
  };
}

/**
 * Detect if there is zero evidence of deployment.
 * @param {Object} fileTreeAnalysis - From analyzeFileTree()
 * @param {string|null} homepageUrl
 * @returns {Detection}
 */
export function detectNoDeployment(fileTreeAnalysis, homepageUrl) {
  const hasDeployment =
    (fileTreeAnalysis?.deploymentFiles?.length > 0) ||
    fileTreeAnalysis?.hasCI ||
    fileTreeAnalysis?.hasDocker ||
    (homepageUrl && homepageUrl.trim().length > 0);

  const detected = !hasDeployment;

  return {
    detected,
    label: 'DEPLOYMENT STATUS: Localhost Veteran',
    description: detected
      ? 'Zero deployment evidence found. No Docker, no CI/CD, no hosting config, no live URL. This project was born on localhost and will die on localhost. "Works on my machine" is not a deployment strategy. It is a cry for help.'
      : 'Deployment artifacts detected. Someone intends for this to exist beyond their laptop.',
    severity: detected ? 'warning' : 'info',
  };
}

/**
 * Detect if the repository is essentially empty.
 * @param {Object} fileTreeAnalysis
 * @returns {Detection}
 */
export function detectEmptyRepo(fileTreeAnalysis) {
  const totalFiles = fileTreeAnalysis?.totalFiles || 0;
  const detected = totalFiles <= 1; // Just a README or nothing

  return {
    detected,
    label: 'EMPTINESS DETECTED',
    description: detected
      ? `Repository successfully analyzed. There is nothing here. ${totalFiles === 0 ? 'Zero files. A void. An existential statement.' : 'One file. Possibly a README promising great things that never materialized.'} This is the repo equivalent of an empty fridge with a magnet that says "Live, Laugh, Code."`
      : `Repository contains ${totalFiles} files. Something exists here.`,
    severity: detected ? 'critical' : 'info',
  };
}

/**
 * Detect if the README is disproportionately larger than the actual code.
 * @param {Object} readmeAnalysis
 * @param {Object} fileTreeAnalysis
 * @returns {Detection}
 */
export function detectReadmeBiggerThanCode(readmeAnalysis, fileTreeAnalysis) {
  const readmeWords = readmeAnalysis?.wordCount || 0;
  const totalFiles = fileTreeAnalysis?.totalFiles || 0;

  // Heuristic: if README has more than 500 words but there are fewer than 5 code files
  const detected = readmeWords > 500 && totalFiles < 5;

  return {
    detected,
    label: 'README > CODEBASE',
    description: detected
      ? `Documentation has become the product. The README has ${readmeWords} words but the repo only has ${totalFiles} file${totalFiles === 1 ? '' : 's'}. This is a whitepaper cosplaying as a software project. The README has more content than the code it describes. At some point, you need to stop writing about the code and write the code.`
      : 'Code-to-documentation ratio is within normal parameters.',
    severity: detected ? 'warning' : 'info',
  };
}

/**
 * Detect dangerous levels of buzzword usage.
 * @param {Object} buzzwordAnalysis
 * @returns {Detection}
 */
export function detectBuzzwordOverload(buzzwordAnalysis) {
  const detected = (buzzwordAnalysis?.severity === 'high' || buzzwordAnalysis?.severity === 'dangerous');
  const count = buzzwordAnalysis?.count || 0;
  const words = buzzwordAnalysis?.words || [];

  return {
    detected,
    label: 'Buzzword Radiation: Dangerous',
    description: detected
      ? `${count} buzzwords detected: ${words.slice(0, 8).join(', ')}${words.length > 8 ? '...' : ''}. This README reads like a LinkedIn post that went rogue. Every sentence is a VC pitch. The buzzword-to-substance ratio suggests this project was described before it was built. Reduce radiation levels before approaching investors or developers.`
      : count > 0
        ? `${count} buzzword${count === 1 ? '' : 's'} detected. Levels are within safe limits.`
        : 'No buzzwords detected. Refreshingly honest.',
    severity: detected ? 'warning' : 'info',
  };
}

/**
 * Detect if the project is a clone/tutorial project.
 * @param {Object} cloneDetection
 * @returns {Detection}
 */
export function detectCloneProject(cloneDetection) {
  const detected = cloneDetection?.isClone || false;
  const cloneType = cloneDetection?.cloneType || 'tutorial';
  const confidence = cloneDetection?.confidence || 0;

  return {
    detected,
    label: 'Tutorial Residue Detected',
    description: detected
      ? `Clone/tutorial project detected: "${cloneType}" (${confidence}% confidence). This smells like YouTube autoplay. There is nothing wrong with learning from tutorials — but there is something wrong with putting them on your portfolio as original work. If you learned from this, great. Now build something that didn't come with a 45-minute walkthrough video.`
      : 'No clone or tutorial patterns detected. This appears to be original work.',
    severity: detected ? (confidence >= 80 ? 'warning' : 'info') : 'info',
  };
}

/**
 * Detect a genuinely impressive repository that disables jokes.
 * @param {number} overallScore - Overall metric score
 * @param {Object} metrics - All metrics
 * @returns {Detection}
 */
export function detectGenuinelyImpressive(overallScore, metrics) {
  // Must score high across multiple categories
  const highScoreCount = Object.values(metrics)
    .filter((m) => m && typeof m.score === 'number' && m.score >= 80)
    .length;

  const detected = overallScore >= 85 && highScoreCount >= 6;

  return {
    detected,
    label: 'GENUINELY IMPRESSIVE',
    description: detected
      ? '⚡ HUMANITY CHECK TRIGGERED ⚡ This repository is genuinely impressive. Strong documentation, deployment evidence, original concept, clean structure, active maintenance. The roasting module has been temporarily disabled out of respect. This is what a well-maintained project looks like. Take notes, everyone else.'
      : 'Repository does not trigger the impressiveness threshold. Roasting module remains active.',
    severity: detected ? 'legendary' : 'info',
  };
}

// ─── MASTER DETECTION RUNNER ─────────────────────────────

/**
 * Run all detections and return only the triggered ones.
 * @param {Object} analysisData - From analyzeRepository()
 * @param {Object} metrics - From calculateAllMetrics()
 * @returns {Detection[]} Array of triggered detections
 */
export function runAllDetections(analysisData, metrics) {
  const {
    readme,
    readmeAnalysis,
    fileTreeAnalysis,
    cloneDetection,
    buzzwordAnalysis,
    repo,
  } = analysisData;

  const overallScore = metrics?.overallScore || 0;

  const allDetections = [
    detectMissingReadme(readme),
    detectNoDeployment(fileTreeAnalysis, repo?.homepage),
    detectEmptyRepo(fileTreeAnalysis),
    detectReadmeBiggerThanCode(readmeAnalysis, fileTreeAnalysis),
    detectBuzzwordOverload(buzzwordAnalysis),
    detectCloneProject(cloneDetection),
    detectGenuinelyImpressive(overallScore, metrics),
  ];

  // Return only the ones that were triggered
  return allDetections.filter((d) => d.detected);
}
