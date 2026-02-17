/**
 * Pollinations AI API Service
 * Centralized API calls for the Pollinations AI platform
 */

const API_BASE_URL = 'https://gen.pollinations.ai';

/**
 * Get API headers with optional authentication
 * @param {string} apiKey - Optional API key for authentication
 * @returns {Object} Headers object
 */
function getHeaders(apiKey) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Handle API errors
 * @param {Response} response - Fetch response object
 * @throws {Error} Formatted error with details
 */
async function handleError(response) {
  let errorMessage = `API Error: ${response.status} ${response.statusText}`;

  try {
    const errorData = await response.json();
    if (errorData.error) {
      errorMessage = errorData.error.message || errorMessage;
    }
  } catch (e) {
    // If JSON parsing fails, use default message
  }

  throw new Error(errorMessage);
}

/**
 * Fetch available text models
 * @param {string} apiKey - Optional API key
 * @returns {Promise<Array>} Array of model objects
 */
export async function fetchModels(apiKey) {
  try {
    const response = await fetch(`${API_BASE_URL}/text/models`, {
      headers: getHeaders(apiKey)
    });

    if (!response.ok) {
      await handleError(response);
    }

    const models = await response.json();

    // Format models with capability data
    return models.map(model => {
      const audioCapability = model.output_modalities
        ? model.output_modalities.includes('audio')
        : false;

      const visionCapability = model.input_modalities
        ? model.input_modalities.includes('image')
        : false;

      return {
        id: model.name,
        name: model.name,
        description: model.description || '',
        vision: visionCapability,
        audio: audioCapability,
        input_modalities: model.input_modalities || ['text'],
        output_modalities: model.output_modalities || ['text'],
        voices: model.voices || [],
        pricing: model.pricing || null,
        aliases: model.aliases || []
      };
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

/**
 * Generate text/audio using chat completions API
 * @param {Object} options - Generation options
 * @returns {Promise<Response>} Fetch response (for streaming)
 */
export async function generateCompletion(options) {
  const {
    apiKey,
    model,
    messages,
    systemPrompt,
    stream = true,
    seed,
    modalities,
    audio
  } = options;

  const bodyData = {
    messages: systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages,
    model,
    stream,
    seed
  };

  // Add modalities if specified
  if (modalities) {
    bodyData.modalities = modalities;
  }

  // Add audio config if specified
  if (audio) {
    bodyData.audio = audio;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      await handleError(response);
    }

    return response;
  } catch (error) {
    console.error('Error generating completion:', error);
    throw error;
  }
}

/**
 * Generate speech from text (TTS)
 * @param {Object} options - TTS options
 * @returns {Promise<Blob>} Audio blob
 */
export async function generateSpeech(options) {
  const {
    apiKey,
    model = 'tts-1',
    input,
    voice = 'alloy',
    responseFormat = 'mp3',
    speed = 1.0
  } = options;

  try {
    const response = await fetch(`${API_BASE_URL}/v1/audio/speech`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        model,
        input,
        voice,
        response_format: responseFormat,
        speed
      })
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

/**
 * Transcribe audio to text (STT)
 * @param {Object} options - Transcription options
 * @returns {Promise<Object>} Transcription result
 */
export async function transcribeAudio(options) {
  const {
    apiKey,
    audioFile,
    model = 'whisper-large-v3',
    language
  } = options;

  try {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', model);
    if (language) {
      formData.append('language', language);
    }

    const headers = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`${API_BASE_URL}/v1/audio/transcriptions`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      await handleError(response);
    }

    return await response.json();
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Parse Server-Sent Events (SSE) stream
 * @param {ReadableStream} stream - Response body stream
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onComplete - Callback when stream completes
 * @param {Function} onError - Callback for errors
 */
export async function parseSSEStream(stream, onChunk, onComplete, onError) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (onComplete) onComplete();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            if (onComplete) onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (onChunk) onChunk(parsed);
          } catch (e) {
            console.warn('Failed to parse SSE data:', data);
          }
        }
      }
    }
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
}

/**
 * Create message content array for multimodal input
 * @param {Object} options - Message options
 * @returns {Array} Content array
 */
export function createMessageContent(options) {
  const { text, images = [], audioData } = options;
  const content = [];

  // Add text
  if (text) {
    content.push({
      type: 'text',
      text
    });
  }

  // Add images
  for (const image of images) {
    content.push({
      type: 'image_url',
      image_url: {
        url: image.url || image.dataUrl
      }
    });
  }

  // Add audio
  if (audioData) {
    content.push({
      type: 'input_audio',
      input_audio: {
        data: audioData,
        format: 'wav'
      }
    });
  }

  return content;
}

export default {
  fetchModels,
  generateCompletion,
  generateSpeech,
  transcribeAudio,
  parseSSEStream,
  createMessageContent
};
