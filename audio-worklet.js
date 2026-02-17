class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferQueue = [];
        this.buffer = new Float32Array(0); // 用于存储连续的音频数据
        this.shouldStop = false;

        this.port.onmessage = (event) => {
            if (event.data === "STOP") {
                this.shouldStop = true;
            } else {
                // 确保数据是 Float32Array
                this.bufferQueue.push(event.data);
            }
        };
    }

    process(inputs, outputs, parameters) {
        const output = outputs[0];
        const outputLength = output[0].length;

        // 确保 buffer 中有足够的数据
        while (this.buffer.length < outputLength && this.bufferQueue.length > 0) {
            const newBuffer = this.bufferQueue.shift();
            const newCombined = new Float32Array(this.buffer.length + newBuffer.length);
            newCombined.set(this.buffer);
            newCombined.set(newBuffer, this.buffer.length);
            this.buffer = newCombined;
        }

        // 如果有足够的数据，填充输出
        if (this.buffer.length >= outputLength) {
            for (let channel = 0; channel < output.length; channel++) {
                output[channel].set(this.buffer.subarray(0, outputLength));
            }

            // 移除已处理的数据
            this.buffer = this.buffer.subarray(outputLength);
        } else if (this.buffer.length > 0) {
            // 不够数据但还有一些，用现有数据填充
            for (let channel = 0; channel < output.length; channel++) {
                output[channel].set(this.buffer);
                // 剩余部分填充0
                output[channel].fill(0, this.buffer.length);
            }
            this.buffer = new Float32Array(0);
        } else {
            // 没有数据，全部填充0
            for (let channel = 0; channel < output.length; channel++) {
                output[channel].fill(0);
            }
        }

        if (this.shouldStop && this.bufferQueue.length === 0 && this.buffer.length === 0) {
            console.log("播放結束");
            return false; // 停止播放
        }

        return true; // 繼續播放
    }
}

registerProcessor('pcm-processor', PCMProcessor);