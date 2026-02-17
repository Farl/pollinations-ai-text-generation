// wav-worker.js
self.onmessage = function(e) {
    if (e.data.type === 'convert') {
        const { channelData, sampleRate, numberOfChannels, length } = e.data;
        
        // Recreate AudioBuffer from serialized data
        const wavBuffer = writeWav({
            getChannelData: (channel) => channelData[channel],
            sampleRate: sampleRate,
            numberOfChannels: numberOfChannels,
            length: length
        });
        
        self.postMessage({
            type: 'wav',
            wav: wavBuffer
        });
    }
};

function writeWav(audioBuffer) {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, length - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numOfChan, true); // Num channels
    view.setUint32(24, audioBuffer.sampleRate, true); // Sample rate
    view.setUint32(28, audioBuffer.sampleRate * numOfChan * 2, true); // Byte rate
    view.setUint16(32, numOfChan * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(view, 36, 'data');
    view.setUint32(40, length - 44, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        const channel = audioBuffer.getChannelData(i);
        const output = new Int16Array(channel.length);
        
        for (let j = 0; j < channel.length; j++) {
            const s = Math.max(-1, Math.min(1, channel[j]));
            output[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        const channelData = new Uint8Array(output.buffer);
        for (let j = 0; j < channelData.length; j++) {
            view.setUint8(offset + j, channelData[j]);
        }
        offset += channelData.length;
    }

    return buffer;
}

function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}