/**
 * useModelSelection Hook
 * Manages model fetching, filtering, and selection state
 */

const { useState, useEffect, useCallback } = window.React;

/**
 * Filter models based on the active tab
 * @param {Array} allModels - All available models
 * @param {string} tab - Active tab name
 * @returns {Array} Filtered models
 */
function filterModelsByTab(allModels, tab) {
  return allModels.filter(model => {
    switch (tab) {
      case 'vision':
        return model.vision === true;
      case 'audio':
      case 'speech':
        return model.audio === true;
      default:
        return true;
    }
  });
}

/**
 * Custom hook for model selection and management
 * @param {Object} options - Hook options
 * @param {string} options.activeTab - Current active tab
 * @param {string} options.apiKey - API key for fetching models
 * @param {boolean} options.voiceToAudio - Whether audio output is enabled
 * @param {Function} options.setVoiceToAudio - Setter for voiceToAudio
 * @returns {Object} Model selection state and functions
 */
export function useModelSelection({ activeTab, apiKey, voiceToAudio, setVoiceToAudio }) {
  const [models, setModels] = useState([]);
  const [model, setModel] = useState('openai');
  const [lastSelectedModels, setLastSelectedModels] = useState(() => {
    try {
      const saved = localStorage.getItem('lastSelectedModels');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return {};
    }
  });

  // Get filtered models based on active tab and audio preference
  const getFilteredModels = useCallback(() => {
    let filtered = filterModelsByTab(models, activeTab);
    if (voiceToAudio) {
      filtered = filtered.filter(model => model.audio === true);
    }
    return filtered;
  }, [models, activeTab, voiceToAudio]);

  // Fetch models when tab or API key changes
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const formattedModels = await window.PollinationsAPI.fetchModels(apiKey);

        const defaultModels = [{
          id: 'default',
          name: 'default',
          description: ''
        }];
        const loadedModels = formattedModels.filter(m =>
          !defaultModels.some(def => def.id === m.id));

        const combinedModels = loadedModels.length > 0
          ? [...formattedModels.filter(m => !defaultModels.some(def => def.id === m.id))]
          : [...defaultModels];

        setModels(combinedModels);

        const filteredModels = filterModelsByTab(combinedModels, activeTab);

        if (filteredModels.length > 0) {
          const lastSelected = lastSelectedModels[activeTab];
          if (lastSelected && filteredModels.some(m => m.name === lastSelected)) {
            setModel(lastSelected);
          } else {
            setModel(filteredModels[0].name || 'default');
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        const defaultModels = [{ id: 'default', name: 'Default Model' }];
        setModels(defaultModels);
        setModel(defaultModels[0].name);
      }
    };

    fetchModels();
  }, [activeTab, apiKey]);

  // Re-filter models when tab, models, or voiceToAudio changes
  useEffect(() => {
    const filteredModels = getFilteredModels();

    if (filteredModels.length > 0) {
      const currentModelIsValid = filteredModels.some(m => m.name === model);
      if (currentModelIsValid) return;

      const lastSelected = lastSelectedModels[activeTab];
      if (lastSelected && filteredModels.some(m => m.name === lastSelected)) {
        setModel(lastSelected);
      } else {
        setModel(filteredModels[0].name || 'default');
      }
    }
  }, [activeTab, models, voiceToAudio, getFilteredModels]);

  // Persist lastSelectedModels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lastSelectedModels', JSON.stringify(lastSelectedModels));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [lastSelectedModels]);

  // Auto-disable audio response if model doesn't support it
  useEffect(() => {
    const currentModel = models.find(m => m.name === model);
    if (voiceToAudio && currentModel && !currentModel.audio) {
      setVoiceToAudio(false);
    }
  }, [model, models, voiceToAudio]);

  return {
    models,
    model,
    setModel,
    lastSelectedModels,
    setLastSelectedModels,
    getFilteredModels,
    filterModelsByTab
  };
}

export default { useModelSelection };
