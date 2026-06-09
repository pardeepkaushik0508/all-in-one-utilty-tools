const express = require('express');
const upload = require('../utils/upload');
const {
  checkGrammar,
  paraphraseText,
  plagiarismCheck,
  generateAiContent
} = require('../services/textService');

const router = express.Router();

router.post('/grammar', async (req, res, next) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Text is required.' });

    const result = await checkGrammar(text);
    return res.json({ message: 'Grammar check completed.', ...result });
  } catch (error) {
    return next(error);
  }
});

router.post('/paraphrase', async (req, res, next) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Text is required.' });

    const result = await paraphraseText(text);
    return res.json({ message: 'Text paraphrased successfully.', ...result });
  } catch (error) {
    return next(error);
  }
});

router.post('/plagiarism', (req, res) => {
  const sourceText = String(req.body.sourceText || '').trim();
  const compareText = String(req.body.compareText || '').trim();

  if (!sourceText || !compareText) {
    return res.status(400).json({ error: 'Both source and compare text are required.' });
  }

  const result = plagiarismCheck(sourceText, compareText);
  return res.json({ message: 'Plagiarism check completed.', ...result });
});

router.post('/generate', upload.single('image'), async (req, res, next) => {
  try {
    const prompt = String(req.body.prompt || '').trim();
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    const result = await generateAiContent(prompt, req.file || null);
    return res.json({ message: 'Content generated successfully.', ...result });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
