/* ═══════════════════════════════════════════════════════
   DEVINSPECT AI — HELPERS
   ═══════════════════════════════════════════════════════ */

/**
 * Parse a GitHub URL into owner and repo.
 * Supports: https://github.com/owner/repo, github.com/owner/repo, owner/repo
 */
export function parseGitHubUrl(url) {
  if (!url) return null;
  
  const cleaned = url.trim().replace(/\/+$/, '');
  
  // Try full URL pattern
  const urlMatch = cleaned.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, '') };
  }
  
  // Try owner/repo pattern
  const shortMatch = cleaned.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2] };
  }
  
  return null;
}

/**
 * Format a number with K/M suffix.
 */
export function formatNumber(num) {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format bytes to human-readable size.
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Format a date string to relative time.
 */
export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get a score color based on the value (0-100).
 */
export function getScoreColor(score) {
  if (score >= 75) return 'var(--score-high)';
  if (score >= 40) return 'var(--score-mid)';
  return 'var(--score-low)';
}

/**
 * Get a score label based on the value (0-100).
 */
export function getScoreLabel(score) {
  if (score >= 90) return 'Exceptional';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Decent';
  if (score >= 40) return 'Needs Work';
  if (score >= 20) return 'Concerning';
  return 'Critical';
}

/**
 * Decode base64 content (for GitHub API responses) with UTF-8 support.
 */
export function decodeBase64(encoded) {
  if (!encoded) return '';
  try {
    const cleaned = encoded.replace(/\s/g, '');
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    try {
      // Handle URL-safe base64 fallback
      const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
      const binary = atob(normalized);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return '';
    }
  }
}

/**
 * Generate a random float between min and max.
 */
export function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate slight random rotation for "handcrafted" feel.
 */
export function randomRotation(maxDeg = 0.8) {
  return `${randomBetween(-maxDeg, maxDeg)}deg`;
}

/**
 * Delay utility for animations.
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Count occurrences of a pattern in text (case-insensitive).
 */
export function countOccurrences(text, patterns) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  return patterns.reduce((count, pattern) => {
    const regex = new RegExp(`\\b${pattern.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
}

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Get a random item from an array.
 */
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Calculate language percentages from GitHub language bytes.
 */
export function calculateLanguagePercentages(languages) {
  if (!languages || Object.keys(languages).length === 0) return [];
  
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  
  return Object.entries(languages)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: ((bytes / total) * 100).toFixed(1),
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

/**
 * Check if a file path matches any patterns.
 */
export function matchesPatterns(path, patterns) {
  const lower = path.toLowerCase();
  return patterns.some(pattern => lower.includes(pattern.toLowerCase()));
}

/**
 * Generate ASCII progress bar.
 */
export function asciiProgressBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * localStorage helper with JSON parsing.
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage might be full or disabled
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};

/**
 * sessionStorage helper with JSON parsing for secure, transient data.
 */
export const session = {
  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sessionStorage might be full or disabled
    }
  },
  remove(key) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};
