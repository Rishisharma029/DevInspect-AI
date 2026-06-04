import { describe, it, expect } from 'vitest';
import { analyzeFileTree, analyzeReadme } from './analyzer';

describe('DevInspect AI Security Heuristics Scanner', () => {
  describe('File Tree Scanner', () => {
    it('detects exposed env and configuration secrets', () => {
      const tree = {
        tree: [
          { path: '.env', type: 'blob', size: 100 },
          { path: 'config/secrets.json', type: 'blob', size: 200 },
          { path: 'jwt.secret', type: 'blob', size: 50 },
        ],
      };
      const res = analyzeFileTree(tree);
      expect(res.securityRisks.length).toBe(3);
      expect(res.securityRisks[0].type).toBe('exposed_env');
      expect(res.securityRisks[1].type).toBe('exposed_env');
    });

    it('detects exposed private key files', () => {
      const tree = {
        tree: [
          { path: 'keys/id_rsa', type: 'blob', size: 1000 },
          { path: 'auth/private.pem', type: 'blob', size: 800 },
        ],
      };
      const res = analyzeFileTree(tree);
      expect(res.securityRisks.length).toBe(2);
      expect(res.securityRisks[0].type).toBe('exposed_key');
      expect(res.securityRisks[0].label).toBe('Exposed Private Key');
    });

    it('detects exposed AWS credentials', () => {
      const tree = {
        tree: [
          { path: '.aws/credentials', type: 'blob', size: 150 },
        ],
      };
      const res = analyzeFileTree(tree);
      expect(res.securityRisks.length).toBe(1);
      expect(res.securityRisks[0].type).toBe('exposed_aws_creds');
    });

    it('flags structural maintainability issues', () => {
      const tree = {
        tree: [
          { path: 'a/b/c/d/e/f/g/h/i.js', type: 'blob', size: 100 },
        ],
      };
      const res = analyzeFileTree(tree);
      expect(res.maintainabilityRisks).toContainEqual(
        expect.objectContaining({ type: 'deep_folders' })
      );
      expect(res.maintainabilityRisks).toContainEqual(
        expect.objectContaining({ type: 'missing_gitignore' })
      );
    });
  });

  describe('README Content Security Scanner', () => {
    it('detects private key blocks in documentation', () => {
      const content = `# Project README\nHere is our key:\n-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----`;
      const res = analyzeReadme(content);
      expect(res.exposedSecrets.length).toBe(1);
      expect(res.exposedSecrets[0].type).toBe('hardcoded_private_key');
    });

    it('detects hardcoded AWS keys', () => {
      const content = `# Project README\nSet access key to AKIAIOSFODNN7EXAMPLE in your client.`;
      const res = analyzeReadme(content);
      expect(res.exposedSecrets.length).toBe(1);
      expect(res.exposedSecrets[0].type).toBe('hardcoded_aws_key');
    });

    it('detects generic API key assignments', () => {
      const content = `# README\n\`\`\`javascript\nconst db_password = "my-secret-password-12345"\n\`\`\``;
      const res = analyzeReadme(content);
      expect(res.exposedSecrets.length).toBe(1);
      expect(res.exposedSecrets[0].type).toBe('hardcoded_secret_assignment');
    });
  });
});
