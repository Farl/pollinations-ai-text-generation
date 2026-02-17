/**
 * Configuration Management
 * Handles API configuration and environment settings
 */

/**
 * Get configuration from window object or environment
 * @returns {Object} Configuration object
 */
export function getConfig() {
  const defaultConfig = {
    API_KEY: '',
    API_BASE_URL: 'https://gen.pollinations.ai',
    DEFAULT_MODEL: 'openai',
    ENABLE_STREAMING: true,
    ENABLE_MEMORY: false,
    MAX_HISTORY_LENGTH: 10
  };

  // Try to load from window.POLLINATIONS_CONFIG (injected by GitHub Actions)
  if (typeof window !== 'undefined' && window.POLLINATIONS_CONFIG) {
    return {
      ...defaultConfig,
      ...window.POLLINATIONS_CONFIG
    };
  }

  return defaultConfig;
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if valid
 */
export function isValidApiKey(apiKey) {
  if (!apiKey) return false;

  // Pollinations API keys start with pk_ (publishable) or sk_ (secret)
  return apiKey.startsWith('pk_') || apiKey.startsWith('sk_');
}

/**
 * Get API key from config or localStorage
 * @returns {string} API key or empty string
 */
export function getApiKey() {
  const config = getConfig();

  // Try config first
  if (config.API_KEY) {
    return config.API_KEY;
  }

  // Try localStorage as fallback
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('pollinations_api_key') || '';
  }

  return '';
}

/**
 * Save API key to localStorage
 * @param {string} apiKey - API key to save
 */
export function saveApiKey(apiKey) {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (apiKey) {
      localStorage.setItem('pollinations_api_key', apiKey);
    } else {
      localStorage.removeItem('pollinations_api_key');
    }
  }
}

/**
 * Get user preferences from localStorage
 * @returns {Object} User preferences
 */
export function getPreferences() {
  const defaults = {
    lastModel: 'openai',
    enableMemory: false,
    enableStreaming: true,
    ttsVoice: 'alloy',
    ttsFormat: 'mp3',
    ttsSpeed: 1.0,
    renderMarkdown: true
  };

  if (typeof window === 'undefined' || !window.localStorage) {
    return defaults;
  }

  try {
    const stored = localStorage.getItem('pollinations_preferences');
    if (stored) {
      return {
        ...defaults,
        ...JSON.parse(stored)
      };
    }
  } catch (e) {
    console.warn('Failed to load preferences:', e);
  }

  return defaults;
}

/**
 * Save user preferences to localStorage
 * @param {Object} preferences - Preferences to save
 */
export function savePreferences(preferences) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem('pollinations_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
  }
}

export default {
  getConfig,
  isValidApiKey,
  getApiKey,
  saveApiKey,
  getPreferences,
  savePreferences
};
