const fs = require('fs/promises');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { removeFiles } = require('../utils/fileCleanup');

const SYSTEM_INSTRUCTION =
  'You are a helpful writing assistant. Produce clear, useful, well-structured content based on the user prompt. If an image is provided, analyze it and use relevant visual details in your response.';

async function generateGeminiContent(prompt, imageFile) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_INSTRUCTION
  });

  const parts = [{ text: prompt }];

  if (imageFile?.path) {
    const buffer = await fs.readFile(imageFile.path);
    const mimeType = imageFile.mimetype || 'image/jpeg';

    if (!mimeType.startsWith('image/')) {
      await removeFiles([imageFile]);
      throw new Error('Only image files are supported for reference uploads.');
    }

    parts.push({
      inlineData: {
        mimeType,
        data: buffer.toString('base64')
      }
    });
  }

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts }]
    });

    const output = result.response.text()?.trim();
    if (!output) {
      throw new Error('Gemini returned an empty response. Try a different prompt.');
    }

    return {
      output,
      provider: imageFile ? `gemini (${modelName}, image+text)` : `gemini (${modelName})`
    };
  } catch (error) {
    const message = error.message || '';
    if (message.includes('429') || message.includes('quota')) {
      throw new Error('Gemini rate limit reached. Wait a minute and try again, or switch GEMINI_MODEL in backend/.env.');
    }
    if (message.includes('API key') || message.includes('401') || message.includes('403')) {
      throw new Error('Invalid GEMINI_API_KEY. Check your key at https://aistudio.google.com/app/api-keys');
    }
    throw error;
  } finally {
    if (imageFile) {
      await removeFiles([imageFile]);
    }
  }
}

module.exports = { generateGeminiContent };
