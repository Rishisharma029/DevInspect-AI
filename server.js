import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Helmet headers with custom CSP enabling GitHub API and Gemini API connections
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://api.github.com",
          "https://generativelanguage.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://github.com",
          "https://*.githubusercontent.com",
          "https://*.shields.io",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());
app.use(cookieParser());

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Session setup
const sessionSecret = process.env.SESSION_SECRET || 'devinspect-ai-super-secret-key';
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Secure Multi-User Login (Optional based on DEVINSPECT_PASSWORD environment variable)
const INSTANCE_PASSWORD = process.env.DEVINSPECT_PASSWORD;

app.get('/api/auth/status', (req, res) => {
  if (!INSTANCE_PASSWORD) {
    return res.json({ required: false, authenticated: true });
  }
  return res.json({ required: true, authenticated: !!req.session.authenticated });
});

app.post('/api/auth/login', async (req, res) => {
  const { password } = req.body;
  if (!INSTANCE_PASSWORD) {
    return res.json({ success: true, message: 'No authentication required' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  try {
    const match = await bcrypt.compare(password, INSTANCE_PASSWORD);
    if (match) {
      req.session.authenticated = true;
      return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Invalid password' });
  } catch (err) {
    console.error('[Auth Error] check failed:', err);
    return res.status(500).json({ error: 'Authentication check failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Serve frontend assets
app.use(express.static(path.join(__dirname, 'dist')));

// SPA route fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[DevInspect AI] Server listening on port ${PORT}`);
});
