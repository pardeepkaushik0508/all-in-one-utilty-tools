const axios = require('axios');
const { generateGeminiContent } = require('./geminiService');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function checkGrammar(text) {
  const response = await axios.post(
    'https://api.languagetool.org/v2/check',
    new URLSearchParams({
      text,
      language: 'en-US'
    }),
    { timeout: 20000 }
  );

  const matches = response.data.matches || [];
  return {
    matches: matches.map((match) => ({
      message: match.message,
      offset: match.offset,
      length: match.length,
      replacements: (match.replacements || []).slice(0, 3).map((item) => item.value)
    })),
    issueCount: matches.length
  };
}

function basicParaphrase(text) {
  const replacements = {
    good: 'great',
    bad: 'poor',
    big: 'large',
    small: 'compact',
    use: 'utilize',
    help: 'assist',
    make: 'create',
    show: 'demonstrate',
    important: 'essential',
    many: 'numerous'
  };

  return text
    .split(/\b/)
    .map((word) => {
      const lower = word.toLowerCase();
      if (replacements[lower]) {
        const replacement = replacements[lower];
        return word[0] === word[0].toUpperCase()
          ? replacement[0].toUpperCase() + replacement.slice(1)
          : replacement;
      }
      return word;
    })
    .join('');
}

async function paraphraseText(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { output: basicParaphrase(text), provider: 'local-fallback' };
  }

  const response = await axios.post(
    OPENAI_URL,
    {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Rephrase the user text while preserving meaning. Return only rewritten text.'
        },
        { role: 'user', content: text }
      ],
      temperature: 0.7
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 45000
    }
  );

  return {
    output: response.data.choices?.[0]?.message?.content?.trim() || '',
    provider: 'openai'
  };
}

function tokenizeWords(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function plagiarismCheck(sourceText, compareText) {
  const sourceTokens = new Set(tokenizeWords(sourceText));
  const compareTokens = tokenizeWords(compareText);
  if (!sourceTokens.size || !compareTokens.length) {
    return { similarityPercent: 0, matchedWords: 0 };
  }

  let matched = 0;
  compareTokens.forEach((token) => {
    if (sourceTokens.has(token)) matched += 1;
  });

  const similarityPercent = Math.round((matched / compareTokens.length) * 100);
  return { similarityPercent, matchedWords: matched, totalWords: compareTokens.length };
}

async function generateAiContent(prompt, imageFile) {
  if (process.env.GEMINI_API_KEY) {
    return generateGeminiContent(prompt, imageFile);
  }

  if (imageFile) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it to backend/.env (local) or Railway backend Variables (production), then restart the server.'
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it to backend/.env (local) or Railway backend Variables (production), then restart the server.'
    );
  }

  const response = await axios.post(
    OPENAI_URL,
    {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful writing assistant. Produce clear, useful content.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8
    },
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 45000
    }
  );

  return {
    output: response.data.choices?.[0]?.message?.content?.trim() || '',
    provider: 'openai'
  };
}

module.exports = {
  checkGrammar,
  paraphraseText,
  plagiarismCheck,
  generateAiContent
};
