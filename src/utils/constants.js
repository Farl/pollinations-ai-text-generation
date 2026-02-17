/**
 * Application Constants
 * Centralized constants and configuration values
 */

// API Configuration
export const API = {
  BASE_URL: 'https://gen.pollinations.ai',
  ENDPOINTS: {
    MODELS: '/text/models',
    CHAT_COMPLETIONS: '/v1/chat/completions',
    AUDIO_SPEECH: '/v1/audio/speech',
    AUDIO_TRANSCRIPTION: '/v1/audio/transcriptions'
  },
  DEFAULT_MODEL: 'openai',
  TIMEOUT: 120000 // 2 minutes
};

// Application Tabs
export const TABS = {
  TEXT: 'text',
  VISION: 'vision',
  SPEECH_TO_TEXT: 'speech',
  TEXT_TO_SPEECH: 'tts'
};

// Model Capabilities
export const MODEL_CAPABILITIES = {
  AUDIO: 'audio',
  VISION: 'vision',
  TOOLS: 'tools',
  REASONING: 'reasoning'
};

// Audio Configuration
export const AUDIO = {
  FORMATS: ['mp3', 'opus', 'aac', 'flac', 'wav', 'pcm'],
  DEFAULT_FORMAT: 'mp3',
  VOICES: [
    'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer',
    'coral', 'verse', 'ballad', 'ash', 'sage', 'amuch', 'dan'
  ],
  DEFAULT_VOICE: 'alloy',
  SPEED_MIN: 0.25,
  SPEED_MAX: 4.0,
  DEFAULT_SPEED: 1.0,
  WORKLET_FORMAT: 'pcm16'
};

// Speech Recognition
export const SPEECH = {
  LANGUAGES: {
    'en-US': 'English (US)',
    'en-GB': 'English (UK)',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)'
  },
  DEFAULT_LANGUAGE: 'en-US',
  MODELS: ['whisper-large-v3', 'whisper-1', 'scribe'],
  DEFAULT_MODEL: 'whisper-large-v3'
};

// File Constraints
export const FILE_LIMITS = {
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  AUDIO: {
    MAX_SIZE: 25 * 1024 * 1024, // 25MB
    ALLOWED_TYPES: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/m4a'],
    ALLOWED_EXTENSIONS: ['.mp3', '.wav', '.webm', '.mp4', '.m4a']
  }
};

// UI Configuration
export const UI = {
  DEBOUNCE_DELAY: 300, // ms
  THROTTLE_DELAY: 1000, // ms
  TOAST_DURATION: 3000, // ms
  MAX_HISTORY_ITEMS: 10,
  TEXTAREA_MIN_ROWS: 3,
  TEXTAREA_MAX_ROWS: 10
};

// Local Storage Keys
export const STORAGE_KEYS = {
  API_KEY: 'pollinations_api_key',
  PREFERENCES: 'pollinations_preferences',
  CHAT_HISTORY: 'pollinations_chat_history',
  LAST_MODEL: 'pollinations_last_model'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  API_ERROR: 'API request failed. Please try again.',
  INVALID_API_KEY: 'Invalid API key format.',
  FILE_TOO_LARGE: 'File is too large.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  AUDIO_NOT_SUPPORTED: 'Audio recording is not supported in this browser.',
  CLIPBOARD_ERROR: 'Failed to copy to clipboard.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  COPIED: 'Copied to clipboard!',
  SAVED: 'Saved successfully!',
  UPLOADED: 'File uploaded successfully!',
  GENERATED: 'Generated successfully!'
};

// Modalities
export const MODALITIES = {
  TEXT: 'text',
  AUDIO: 'audio',
  IMAGE: 'image'
};

// Message Roles
export const MESSAGE_ROLES = {
  SYSTEM: 'system',
  USER: 'user',
  ASSISTANT: 'assistant'
};

// Feature Flags
export const FEATURES = {
  STREAMING: true,
  MEMORY: true,
  MARKDOWN: true,
  AUDIO_WORKLET: true,
  MEDIA_SOURCE: true
};

// Keyboard Shortcuts
export const SHORTCUTS = {
  SUBMIT: 'Enter',
  SUBMIT_WITH_MODIFIER: 'Ctrl+Enter',
  CLEAR: 'Ctrl+L',
  NEW_CHAT: 'Ctrl+N'
};

export default {
  API,
  TABS,
  MODEL_CAPABILITIES,
  AUDIO,
  SPEECH,
  FILE_LIMITS,
  UI,
  STORAGE_KEYS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  MODALITIES,
  MESSAGE_ROLES,
  FEATURES,
  SHORTCUTS
};
