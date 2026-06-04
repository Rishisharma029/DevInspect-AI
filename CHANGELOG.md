# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-06-05

This release marks the transition of **DevInspect AI** from a client-side SPA prototype into a production-grade, containerized developer tool.

### Added
- **Deterministic Rule Engine Scoring**: Implemented a core scoring model rewarding key repository hygiene markers (README: +15, Dockerfile: +10, CI pipelines: +10, Automated Tests: +15, Commits: +15, Originality: +15, Presentation: +10, Security: +10).
- **Interactive Explanation Breakdowns**: Added a detailed points breakdown panel underneath the repository overview showing evidence and optimization suggestions.
- **Advanced Secrets Scanner**: Expanded content and filename scanning to flag committed private keys (`.pem`, `id_rsa`), configuration files (`.env`), AWS credentials, hardcoded API assignments, and JWT hashes.
- **Production Server (`server.js`)**: Implemented a secure static-serving Express framework.
- **Security Hardening**: Configured Helmet CSP policies, rate limiters, secure signed sessions, and bcrypt-protected multi-user portal locks.
- **Vitest Integration Suite**: Configured a unit and rendering test environment with jsdom supporting Jest-compatible syntax.
- **Test Coverage**: Achieved baseline coverage verifying metrics, scanner logic, components, and extra controllers.
- **Production Containerization**: Created a multi-stage `Dockerfile` and a `docker-compose.yml` local orchestration profile running under a non-root `node` user.
- **CI/CD Workflows**: Configured GitHub Actions CI configurations (`.github/workflows/ci.yml`) validating linting, testing, coverage, and Docker compiling gates automatically.
- **Open-Source Templates**: Added `SECURITY.md`, `CODE_OF_CONDUCT.md`, `ARCHITECTURE.md`, and this `CHANGELOG.md`.

### Changed
- **Transient Credentials**: Swapped API keys and personal tokens storage from browser `localStorage` to transient `sessionStorage` (cleared automatically on browser tab close) to minimize XSS exposure risks.
- **History Tracking**: Unified scan history limits to track up to 8 recent URLs and 10 score runs per repository.

### Fixed
- Improved text alignment and print layout stylesheet support.
- Corrected unit test assertions for the Git log and burnout levels controllers.
