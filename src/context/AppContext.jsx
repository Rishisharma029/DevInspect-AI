/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { SCAN_STATES, EASTER_EGG_KEYS } from '../utils/constants';
import { storage, session } from '../utils/helpers';

const AppContext = createContext(null);

const initialState = {
  // Scan state
  scanState: SCAN_STATES.IDLE,
  repoUrl: '',
  repoData: null,
  analysisResult: null,
  scanProgress: 0,
  scanMessages: [],
  error: null,

  // Settings (stored in sessionStorage for security)
  settings: session.get(EASTER_EGG_KEYS.SETTINGS, {
    githubToken: '',
    geminiApiKey: '',
  }),

  // Easter eggs
  easterEggs: {
    burnoutCount: storage.get(EASTER_EGG_KEYS.BURNOUT_COUNT, 0),
    sessionStart: Date.now(),
    unlockedEggs: storage.get(EASTER_EGG_KEYS.UNLOCKED_EGGS, []),
    recruiterTyping: false,
    showDVD: false,
    touchGrass: false,
    humanityCheck: false,
  },
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_REPO_URL':
      return { ...state, repoUrl: action.payload };

    case 'START_SCAN':
      return {
        ...state,
        scanState: SCAN_STATES.SCANNING,
        repoUrl: action.payload,
        repoData: null,
        analysisResult: null,
        scanProgress: 0,
        scanMessages: [],
        error: null,
      };

    case 'UPDATE_SCAN_PROGRESS':
      return {
        ...state,
        scanProgress: action.payload.progress,
        scanMessages: [...state.scanMessages, action.payload.message],
      };

    case 'SCAN_COMPLETE':
      return {
        ...state,
        scanState: SCAN_STATES.ANALYZING,
        repoData: action.payload,
      };

    case 'ANALYSIS_COMPLETE':
      return {
        ...state,
        scanState: SCAN_STATES.COMPLETE,
        analysisResult: action.payload,
        easterEggs: {
          ...state.easterEggs,
          burnoutCount: state.easterEggs.burnoutCount + 1,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        scanState: SCAN_STATES.ERROR,
        error: action.payload,
      };

    case 'RESET_SCAN':
      return {
        ...state,
        scanState: SCAN_STATES.IDLE,
        repoUrl: '',
        repoData: null,
        analysisResult: null,
        scanProgress: 0,
        scanMessages: [],
        error: null,
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_EASTER_EGG':
      return {
        ...state,
        easterEggs: { ...state.easterEggs, ...action.payload },
      };

    case 'UNLOCK_EASTER_EGG':
      if (state.easterEggs.unlockedEggs.includes(action.payload)) return state;
      return {
        ...state,
        easterEggs: {
          ...state.easterEggs,
          unlockedEggs: [...state.easterEggs.unlockedEggs, action.payload],
        },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist settings to sessionStorage when they change
  const updateSettings = useCallback((newSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    const merged = { ...state.settings, ...newSettings };
    session.set(EASTER_EGG_KEYS.SETTINGS, merged);
  }, [state.settings]);

  // Auto-persist burnout count
  useEffect(() => {
    storage.set(EASTER_EGG_KEYS.BURNOUT_COUNT, state.easterEggs.burnoutCount);
  }, [state.easterEggs.burnoutCount]);

  // Persist burnout count manually
  const incrementBurnout = useCallback(() => {
    dispatch({
      type: 'SET_EASTER_EGG',
      payload: { burnoutCount: state.easterEggs.burnoutCount + 1 }
    });
  }, [state.easterEggs.burnoutCount]);

  // Persist unlocked eggs
  const unlockEasterEgg = useCallback((eggId) => {
    dispatch({ type: 'UNLOCK_EASTER_EGG', payload: eggId });
    const updated = [...state.easterEggs.unlockedEggs, eggId];
    storage.set(EASTER_EGG_KEYS.UNLOCKED_EGGS, updated);
  }, [state.easterEggs.unlockedEggs]);

  const value = {
    state,
    dispatch,
    updateSettings,
    incrementBurnout,
    unlockEasterEgg,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
