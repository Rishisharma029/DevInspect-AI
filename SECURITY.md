# Security Policy

## Supported Versions

Only the latest release (v1.0.x and above) is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Token Management & Privacy

DevInspect AI is built to analyze repositories securely:
1. **Zero Long-Term Token Storage**: Personal Access Tokens (PATs) and Gemini API Keys are stored exclusively in **`sessionStorage`** on the client. They are never saved to `localStorage` or transmitted to any third-party analytics provider.
2. **Tab Life Cycle Binding**: Secrets are immediately deleted when you close the browser tab or finish the analysis session.
3. **Optional Multi-User Mode**: If hosting a public instance, setting `DEVINSPECT_PASSWORD` restricts dashboard access. Sessions are protected via secure, HTTP-only, cryptographically signed cookies via Express sessions.

## Built-In Secrets Scanner

DevInspect AI includes a built-in pre-analysis heuristics engine (`src/services/analyzer.js`) that automatically scans your repository directories and documentation content for:
- Environment Configuration Files (`.env`, `secrets.json`, etc.)
- Committed Private Cryptographic Keys (`.pem`, `.key`, `id_rsa`)
- Cloud Credentials (AWS Access Key patterns)
- API Keys, database strings, and JWT signatures (`ey...`)

If any of these are committed, the scan will immediately trigger a critical severity indicator, lower the repository score, and highlight the exact files that must be cleaned using `git filter-repo`.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please do **NOT** open a public issue. Instead, report it using one of the following methods:

1. Email the maintainer team (see maintainer contacts in `CONTRIBUTING.md`).
2. Provide a detailed write-up with reproduction steps (and ideally a Proof of Concept).

We will acknowledge receipt within 48 hours and work to provide a patch within 7 days.
