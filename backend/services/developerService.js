const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');
const beautify = require('js-beautify').css;
const { convert } = require('html-to-text');

async function minifyCode({ code, type }) {
  const normalizedType = String(type || 'js').toLowerCase();

  if (normalizedType === 'html') {
    const output = await minifyHtml(code, {
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    });
    return { output };
  }

  if (normalizedType === 'css') {
    const output = new CleanCSS({ level: 2 }).minify(code).styles;
    return { output };
  }

  const result = await minifyJs(code);
  if (result.error) throw result.error;
  return { output: result.code || '' };
}

function htmlToPlainText(html) {
  const output = convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' }
    ]
  });
  return { output: output.trim() };
}

function beautifyCss(css) {
  return { output: beautify(css, { indent_size: 2 }) };
}

module.exports = { minifyCode, htmlToPlainText, beautifyCss };
