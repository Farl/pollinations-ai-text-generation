# Pollinations AI Text Generation API

A web interface for the new Pollinations AI API at gen.pollinations.ai

## Features

- ✅ Text Generation with multiple models (OpenAI-compatible)
- 🖼️ Image Analysis (Vision)
- 🗣️ Text-to-Speech with multiple voices
- 🎤 Speech-to-Text Recognition
- 🔄 Streaming support
- 💾 Chat memory
- 🔑 Optional API key authentication

## Setup

### 1. Get Your API Key

Get your API key at [enter.pollinations.ai](https://enter.pollinations.ai)

### 2. Configure API Key (Optional)

You can configure your API key in two ways:

**Option A: Use config.js (Recommended for development)**
```bash
# Copy the example config
cp config.example.js config.js

# Edit config.js and add your API key
# Change API_KEY: '' to API_KEY: 'your-key-here'
```

**Option B: Enter manually in the UI**
- Just enter your API key in the "API Key" field in the web interface

### 3. Run the Server

```bash
# Start a local HTTP server
python3 -m http.server 8000

# Open your browser
open http://localhost:8000
```

## Usage

### Text Generation
1. Select the "Text Generation" tab
2. Enter your prompt
3. (Optional) Enter API key if not configured
4. Click "Generate"

### Audio Response
- Select a model with audio output (like `openai-audio`)
- Enable "Generate audio response" checkbox
- Choose a voice
- Generate text and receive audio response

### Text-to-Speech
1. Select the "Text-to-Speech" tab
2. Enter text to convert
3. Choose voice, format, and speed
4. Click "Generate Speech"

### Vision (Image Analysis)
1. Select the "Vision" tab
2. Upload images or paste image URLs
3. Enter your question about the images
4. Click "Analyze Images"

### Speech-to-Text
1. Select the "Speech-to-Text" tab
2. Click "Start Recording"
3. Speak your message
4. Click "Stop & Transcribe"

## Security Notes

- ⚠️ **Never commit config.js to public repositories** - it's in .gitignore
- 🔐 Use publishable keys (`pk_*`) for client-side apps (rate-limited)
- 🔒 Keep secret keys (`sk_*`) server-side only

## API Documentation

Full API documentation: [docs/pollinations-ai-apidocs.md](docs/pollinations-ai-apidocs.md)

## License

This is a demo application for the Pollinations AI API.
