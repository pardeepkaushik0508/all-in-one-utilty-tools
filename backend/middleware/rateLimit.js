const rateLimit = require('express-rate-limit');

const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false }
};

const apiLimiter = rateLimit({
  ...limiterOptions,
  max: 120,
  message: { error: 'Too many requests. Please try again later.' }
});

const uploadLimiter = rateLimit({
  ...limiterOptions,
  max: 40,
  message: { error: 'Upload limit reached. Please try again later.' }
});

module.exports = { apiLimiter, uploadLimiter };
