/**
 * Application configuration constants
 */

export const APP_NAME = 'PhonoPlay';
export const APP_DESCRIPTION = 'A fun phonics learning tool for kids';

// Session configuration
export const SESSION_CONFIG = {
  // Number of recent attempts to consider for adaptive learning
  RECENT_ATTEMPTS_WINDOW: 5,
  // Maximum number of words per session
  MAX_WORDS_PER_SESSION: 10,
  // Minimum number of phonemes to select
  MIN_PHONEMES_SELECTED: 1,
  // Maximum number of phonemes to select
  MAX_PHONEMES_SELECTED: 5,
};

// Audio configuration
export const AUDIO_CONFIG = {
  // Timeout for recording in milliseconds
  RECORDING_TIMEOUT: 5000,
  // Audio sample rate for recording
  SAMPLE_RATE: 16000,
  // Audio bitrate for recording
  BITRATE: 128000,
};

// Feedback messages
export const FEEDBACK_MESSAGES = {
  CORRECT: [
    'Great job!',
    'Well done!',
    'Perfect!',
    'Awesome!',
    'You\'re amazing!',
    'Brilliant!',
  ],
  INCORRECT: [
    'Try again!',
    'Almost there!',
    'Give it another go!',
    'Keep trying!',
    'You can do it!',
  ],
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN: '/api/auth/signin',
    SIGN_OUT: '/api/auth/signout',
    SESSION: '/api/auth/session',
  },
  PRACTICE: {
    START: '/api/practice/start',
    SUBMIT: '/api/practice/submit',
    NEXT: '/api/practice/next',
  },
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_AI_SUGGESTIONS: true,
  ENABLE_VOICE_FEEDBACK: true,
  ENABLE_PROGRESS_SAVING: true,
};
