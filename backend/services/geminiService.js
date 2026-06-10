const fs = require('fs/promises');
const { GoogleGenAI, Modality } = require('@google/genai');
const { removeFiles } = require('../utils/fileCleanup');

const CONTENT_SYSTEM_INSTRUCTION =
  'You are a helpful writing assistant. Produce clear, useful, well-structured content based on the user prompt. If an image is provided, analyze it and use relevant visual details in your response.';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  return new GoogleGenAI({ apiKey });
}

function mapGeminiError(error) {
  const message = error.message || '';
  if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
    if (message.includes('image') || message.includes('flash-image')) {
      throw new Error(
        'Gemini image generation quota reached. Enable billing in Google AI Studio or wait and try again.'
      );
    }
    throw new Error('Gemini rate limit reached. Wait a minute and try again.');
  }
  if (message.includes('API key') || message.includes('401') || message.includes('403')) {
    throw new Error('Invalid GEMINI_API_KEY. Check your key at https://aistudio.google.com/app/api-keys');
  }
  throw error;
}

async function buildImagePart(imageFile) {
  const buffer = await fs.readFile(imageFile.path);
  const mimeType = imageFile.mimetype || 'image/jpeg';

  if (!mimeType.startsWith('image/')) {
    throw new Error('Only image files are supported for reference uploads.');
  }

  return {
    inlineData: {
      mimeType,
      data: buffer.toString('base64')
    }
  };
}

async function generateGeminiContent(prompt, imageFile) {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const parts = [{ text: prompt }];
  if (imageFile?.path) {
    parts.push(await buildImagePart(imageFile));
  }

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction: CONTENT_SYSTEM_INSTRUCTION
      }
    });

    const output = response.text?.trim();
    if (!output) {
      throw new Error('Gemini returned an empty response. Try a different prompt.');
    }

    return {
      output,
      provider: imageFile ? `gemini (${modelName}, image+text)` : `gemini (${modelName})`
    };
  } catch (error) {
    mapGeminiError(error);
  } finally {
    if (imageFile) {
      await removeFiles([imageFile]);
    }
  }
}

async function generateGeminiImage(prompt, options = {}) {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  const { aspectRatio = '1:1', referenceImage } = options;

  const parts = [];
  if (referenceImage?.path) {
    parts.push(await buildImagePart(referenceImage));
  }
  parts.push({ text: prompt });

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
        imageConfig: { aspectRatio }
      }
    });

    let description = '';
    let imageDataUrl = '';
    const responseParts = response.candidates?.[0]?.content?.parts || [];

    for (const part of responseParts) {
      if (part.text) {
        description += part.text;
      }
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'image/png';
        imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
      }
    }

    if (!imageDataUrl) {
      throw new Error('Gemini did not return an image. Try a clearer prompt or different aspect ratio.');
    }

    return {
      imageDataUrl,
      description: description.trim(),
      provider: referenceImage
        ? `gemini (${modelName}, image+prompt)`
        : `gemini (${modelName})`
    };
  } catch (error) {
    mapGeminiError(error);
  } finally {
    if (referenceImage) {
      await removeFiles([referenceImage]);
    }
  }
}

module.exports = { generateGeminiContent, generateGeminiImage };
