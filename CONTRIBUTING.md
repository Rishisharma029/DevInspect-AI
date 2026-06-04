# Contributing to DevInspect AI 👨‍💻🔧

Welcome! If you are a developer, maintainer, or DevOps veteran who wants to help improve DevInspect AI, we would love your help! 

As an educational and opinionated project, we encourage contributions that add more humor, better heuristics, and premium designs.

---

## 🎨 Design Philosophy
* **Obsessively Handcrafted**: Avoid clean, generic Bootstrap/Tailwind layouts. Use asymmetric layouts, micro-rotations (`transform: rotate(0.4deg)`), terminal prompt symbols, and glowing text.
* **Developer Culture Aware**: The reviews, alerts, and verdicts should read like they were written by a senior engineer who has had too much coffee and too little sleep.
* **Responsive**: Make sure components render cleanly on widescreen monitors down to mobile.

---

## 🛠️ How to Add a New...

### 1. Developer Persona
If you want to add a new character (e.g., *Product Manager*, *Security Analyst*, or *Junior Developer who copies everything from ChatGPT*):
1. Open [src/utils/constants.js](file:///c:/Users/Rishi%20Sharma/.gemini/antigravity/scratch/DEVINSPECT%20AI/src/utils/constants.js) and add your persona details to the `PERSONAS` configuration.
2. Update [src/services/personas.js](file:///c:/Users/Rishi%20Sharma/.gemini/antigravity/scratch/DEVINSPECT%20AI/src/services/personas.js) to define the fallback generation rules and unique tones.
3. Update [src/components/PersonaReviews/PersonaReviews.jsx](file:///c:/Users/Rishi%20Sharma/.gemini/antigravity/scratch/DEVINSPECT%20AI/src/components/PersonaReviews/PersonaReviews.jsx) if any custom colors/icons are needed.

### 2. Easter Egg
To add a new easter egg (e.g. keypress combinations, secret commands, mouse hover triggers):
1. Implement your physics or state checks in [src/services/easterEggs.js](file:///c:/Users/Rishi%20Sharma/.gemini/antigravity/scratch/DEVINSPECT%20AI/src/services/easterEggs.js).
2. Wire up the state transitions in the [AppContext.jsx](file:///c:/Users/Rishi%20Sharma/.gemini/antigravity/scratch/DEVINSPECT%20AI/src/context/AppContext.jsx) reducer.
3. Add a visual component in [src/components/EasterEggs/EasterEggs.jsx](file:///c:/Users/Rishi%20Sharma/.gemini/antigravity/scratch/DEVINSPECT%20AI/src/components/EasterEggs/EasterEggs.jsx) wrapped in `AnimatePresence` and `motion` transitions.

---

## 📝 Code Guidelines
* **CSS Modules**: All components must use CSS Modules (`import styles from './MyComponent.module.css'`) instead of global style leakage.
* **Pure Reducers**: Do not perform local storage calls or math calculations directly in `appReducer` in `AppContext.jsx`. Synchronize side effects via react hooks (`useEffect` or callbacks).
* **Framer Motion**: Always specify entrance transitions (`initial`, `animate`, `exit`) and respect `prefers-reduced-motion` settings.

---

## 🚀 Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Run verification check before submitting:
   ```bash
   npm run build
   ```
