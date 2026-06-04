import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import styles from './ArchitectureAnalysis.module.css';

export default function ArchitectureAnalysis() {
  const { state } = useApp();
  const { repoData, analysisResult } = state;
  const [expandedDirs, setExpandedDirs] = useState(new Set(['']));

  if (!repoData?.contents) return null;

  const tree = repoData.contents?.tree || [];
  const analysis = analysisResult?.analysis?.fileTreeAnalysis || {};

  const toggleDir = (path) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  // Build tree structure from flat list
  const treeStructure = buildTree(tree);

  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.header}>
        <span className={styles.prefix}>{'>'} ARCHITECTURE ANALYSIS</span>
        <span className={styles.sub}>file structure inspection</span>
      </div>

      <div className={styles.content}>
        {/* Stats Row */}
        <div className={styles.stats}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{analysis.totalFiles || tree.filter(t => t.type === 'blob').length}</span>
            <span className={styles.statLabel}>files</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{analysis.totalDirs || tree.filter(t => t.type === 'tree').length}</span>
            <span className={styles.statLabel}>directories</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{analysis.maxDepth || '—'}</span>
            <span className={styles.statLabel}>max depth</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${analysis.hasTests ? styles.good : styles.bad}`}>
              {analysis.hasTests ? '✓' : '✗'}
            </span>
            <span className={styles.statLabel}>tests</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${analysis.hasCI ? styles.good : styles.bad}`}>
              {analysis.hasCI ? '✓' : '✗'}
            </span>
            <span className={styles.statLabel}>CI/CD</span>
          </div>
          <div className={styles.statBox}>
            <span className={`${styles.statValue} ${analysis.hasDocker ? styles.good : styles.bad}`}>
              {analysis.hasDocker ? '✓' : '✗'}
            </span>
            <span className={styles.statLabel}>Docker</span>
          </div>
        </div>

        {/* File Tree */}
        <div className={styles.treeContainer}>
          <div className={styles.treeHeader}>
            <span className={styles.treeTitle}>📁 Repository Structure</span>
            <span className={styles.treeHint}>click to expand</span>
          </div>
          <div className={styles.tree}>
            {renderTree(treeStructure, 0, expandedDirs, toggleDir, styles)}
          </div>
        </div>

        {/* AI Commentary */}
        {analysisResult?.aiReview?.architectureNotes && (
          <div className={styles.commentary}>
            <span className={styles.commentaryLabel}>ARCHITECTURE NOTES:</span>
            <p className={styles.commentaryText}>{analysisResult.aiReview.architectureNotes}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function buildTree(flatTree) {
  const root = { name: '', children: {}, type: 'tree' };

  for (const item of flatTree.slice(0, 200)) {
    const parts = item.path.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          type: i === parts.length - 1 ? item.type : 'tree',
          children: {},
          size: item.size,
        };
      }
      current = current.children[part];
    }
  }

  return root;
}

function renderTree(node, depth, expandedDirs, toggleDir, styles) {
  const children = Object.values(node.children);
  
  // Sort: directories first, then alphabetical
  children.sort((a, b) => {
    if (a.type === 'tree' && b.type !== 'tree') return -1;
    if (a.type !== 'tree' && b.type === 'tree') return 1;
    return a.name.localeCompare(b.name);
  });

  return children.map((child) => {
    const isDir = child.type === 'tree' || Object.keys(child.children).length > 0;
    const isExpanded = expandedDirs.has(child.path);
    const hasChildren = Object.keys(child.children).length > 0;
    const icon = isDir ? (isExpanded ? '📂' : '📁') : getFileIcon(child.name);
    const isHighlight = isImportantFile(child.name);

    return (
      <div key={child.path}>
        <div
          className={`${styles.treeItem} ${isHighlight ? styles.treeItemHighlight : ''}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => isDir && toggleDir(child.path)}
          role={isDir ? 'button' : undefined}
        >
          <span className={styles.treeIcon}>{icon}</span>
          <span className={`${styles.treeName} ${isDir ? styles.treeNameDir : ''}`}>
            {child.name}
          </span>
          {isDir && hasChildren && (
            <span className={styles.treeChevron}>{isExpanded ? '▾' : '▸'}</span>
          )}
        </div>
        {isDir && isExpanded && hasChildren && (
          <div className={styles.treeChildren}>
            {renderTree(child, depth + 1, expandedDirs, toggleDir, styles)}
          </div>
        )}
      </div>
    );
  });
}

function getFileIcon(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const icons = {
    js: '🟨', jsx: '⚛️', ts: '🔷', tsx: '⚛️',
    py: '🐍', rb: '💎', go: '🔵', rs: '🦀',
    html: '🌐', css: '🎨', scss: '🎨',
    json: '📋', yaml: '📋', yml: '📋', toml: '📋',
    md: '📝', txt: '📄',
    png: '🖼️', jpg: '🖼️', svg: '🖼️', gif: '🖼️',
    sh: '🐚', bash: '🐚',
    lock: '🔒',
    env: '🔐',
    gitignore: '🙈',
  };
  if (name === 'Dockerfile') return '🐳';
  if (name === 'LICENSE') return '📜';
  if (name === 'README.md') return '📖';
  return icons[ext] || '📄';
}

function isImportantFile(name) {
  const important = ['README.md', 'LICENSE', 'package.json', 'Dockerfile', '.gitignore', 'CONTRIBUTING.md'];
  return important.includes(name);
}
