/**
 * Audio Worklet Setup
 * Manages AudioWorklet initialization and lifecycle
 */

/**
 * Create and configure an AudioWorklet for PCM audio playback
 * @param {string} [workletUrl='audio-worklet.js'] - URL to the worklet processor script
 * @param {number} [sampleRate=24000] - Audio sample rate
 * @returns {Promise<{audioContext: AudioContext, workletNode: AudioWorkletNode}>}
 */
export async function setupAudioWorklet(workletUrl = 'audio-worklet.js', sampleRate = 24000) {
  const audioContext = new AudioContext({
    sampleRate,
    latencyHint: 'interactive',
  });

  await audioContext.audioWorklet.addModule(workletUrl);

  const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
  workletNode.connect(audioContext.destination);

  return { audioContext, workletNode };
}

/**
 * Restart the AudioWorklet by disconnecting old and creating new
 * @param {Object} audioContextRef - React ref for AudioContext
 * @param {Object} workletNodeRef - React ref for AudioWorkletNode
 */
export async function restartAudioWorklet(audioContextRef, workletNodeRef) {
  if (workletNodeRef.current) {
    workletNodeRef.current.disconnect();
    workletNodeRef.current = null;
  }

  const { audioContext, workletNode } = await setupAudioWorklet();
  audioContextRef.current = audioContext;
  workletNodeRef.current = workletNode;
}

/**
 * Send audio data to an AudioWorkletNode for playback
 * @param {AudioWorkletNode} workletNode - Target worklet node
 * @param {Float32Array} audioData - Audio samples to enqueue
 */
export function enqueueAudioData(workletNode, audioData) {
  workletNode.port.postMessage(audioData);
}

/**
 * Send stop signal to AudioWorkletNode
 * @param {Object} workletNodeRef - React ref for AudioWorkletNode
 */
export function stopAudioWorklet(workletNodeRef) {
  if (workletNodeRef.current) {
    workletNodeRef.current.port.postMessage("STOP");
  }
}

export default {
  setupAudioWorklet,
  restartAudioWorklet,
  enqueueAudioData,
  stopAudioWorklet
};
