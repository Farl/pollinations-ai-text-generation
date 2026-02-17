/**
 * Audio Utility Functions
 * Pure functions for audio data conversion and processing
 */

/**
 * Write a string to a DataView at the specified offset
 * @param {DataView} view - Target DataView
 * @param {number} offset - Byte offset
 * @param {string} str - String to write
 */
export function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Convert a Blob to base64 string
 * @param {Blob} blob - Input blob
 * @returns {Promise<string>} Base64 encoded string (without data URL prefix)
 */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert an AudioBuffer to WAV using a Web Worker
 * @param {AudioBuffer} audioBuffer - Input audio buffer
 * @returns {Promise<Blob>} WAV audio blob
 */
export function convertToWav(audioBuffer) {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker('wav-worker.js');
      worker.onmessage = (e) => {
        if (e.data.type === 'wav') {
          resolve(new Blob([e.data.wav], { type: 'audio/wav' }));
        }
      };
      worker.onerror = reject;

      const channelData = [];
      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channelData.push(audioBuffer.getChannelData(i));
      }

      worker.postMessage({
        type: 'convert',
        channelData: channelData,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        length: audioBuffer.length
      }, channelData.map(data => data.buffer));
    } catch (error) {
      console.error("Error in convertToWav:", error);
      reject(error);
    }
  });
}

/**
 * Convert PCM16 raw data to WAV format with proper headers
 * @param {Uint8Array} combinedChunks - Raw PCM16 audio data
 * @param {number} [sampleRate=24000] - Sample rate
 * @param {number} [numChannels=1] - Number of channels
 * @param {number} [bitsPerSample=16] - Bits per sample
 * @returns {Uint8Array} WAV file data
 */
export function bufferToWav(combinedChunks, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  // Ensure PCM data length is even for 16-bit samples
  if (combinedChunks.length % 2 !== 0) {
    console.warn("combinedChunks length is not aligned to 16-bit samples, trimming last byte.");
    combinedChunks = combinedChunks.slice(0, combinedChunks.length - 1);
  }

  const sampleSize = bitsPerSample / 8;
  const expectedSamples = combinedChunks.length / sampleSize;
  const remainder = expectedSamples % sampleRate;
  const missingSamples = (sampleRate - remainder) % sampleRate;

  // Add padding to align to sample rate boundary
  const paddingSize = missingSamples * numChannels * sampleSize;
  const padding = new Uint8Array(paddingSize);
  const paddedData = new Uint8Array(combinedChunks.length + paddingSize);
  paddedData.set(combinedChunks, 0);
  paddedData.set(padding, combinedChunks.length);

  // Build WAV header
  const headerSize = 44;
  const dataSize = paddedData.length;
  const totalSize = headerSize + dataSize;

  const header = new ArrayBuffer(headerSize);
  const headerView = new DataView(header);

  writeString(headerView, 0, 'RIFF');
  headerView.setUint32(4, totalSize - 8, true);
  writeString(headerView, 8, 'WAVE');
  writeString(headerView, 12, 'fmt ');
  headerView.setUint32(16, 16, true);          // Subchunk1Size
  headerView.setUint16(20, 1, true);           // AudioFormat (PCM)
  headerView.setUint16(22, numChannels, true);  // NumChannels
  headerView.setUint32(24, sampleRate, true);   // SampleRate
  headerView.setUint32(28, sampleRate * numChannels * sampleSize, true); // ByteRate
  headerView.setUint16(32, numChannels * sampleSize, true); // BlockAlign
  headerView.setUint16(34, bitsPerSample, true); // BitsPerSample
  writeString(headerView, 36, 'data');
  headerView.setUint32(40, dataSize, true);     // Subchunk2Size

  // Combine header and audio data
  const wavData = new Uint8Array(totalSize);
  wavData.set(new Uint8Array(header), 0);
  wavData.set(paddedData, headerSize);
  return wavData;
}

/**
 * Resample Float32 audio data to a different sample rate using linear interpolation
 * @param {Float32Array} inputArray - Input audio samples
 * @param {number} originalRate - Original sample rate
 * @param {number} targetRate - Target sample rate
 * @returns {Float32Array} Resampled audio data
 */
export function resampleFloat32(inputArray, originalRate, targetRate) {
  if (originalRate === targetRate) return inputArray;

  const ratio = targetRate / originalRate;
  const newLength = Math.round(inputArray.length * ratio);
  const outputArray = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i / ratio;
    const index0 = Math.floor(srcIndex);
    const index1 = Math.min(index0 + 1, inputArray.length - 1);
    const t = srcIndex - index0;
    outputArray[i] = (1 - t) * inputArray[index0] + t * inputArray[index1];
  }

  return outputArray;
}

/**
 * Convert PCM16 data to Float32 and resample to target rate
 * @param {Uint8Array} pcmData - Raw PCM16 audio data
 * @param {number} originalSampleRate - Original sample rate
 * @param {number} [targetSampleRate=44100] - Target sample rate
 * @returns {Float32Array} Resampled float32 audio data
 */
export function convertPCM16ToFloat32(pcmData, originalSampleRate, targetSampleRate = 44100) {
  if (pcmData.length % 2 !== 0) {
    console.error("Invalid PCM16 data: length is not even!", pcmData.length);
    return new Float32Array(0);
  }

  const samples = pcmData.length / 2;
  const float32Array = new Float32Array(samples);
  const dataView = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);

  for (let i = 0; i < samples; i++) {
    const int16 = dataView.getInt16(i * 2, true); // Little-endian
    float32Array[i] = int16 / 32768.0;
  }

  return resampleFloat32(float32Array, originalSampleRate, targetSampleRate);
}

export default {
  writeString,
  blobToBase64,
  convertToWav,
  bufferToWav,
  resampleFloat32,
  convertPCM16ToFloat32
};
