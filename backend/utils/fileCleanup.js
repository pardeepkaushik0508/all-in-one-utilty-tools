const fs = require('fs/promises');

async function removeFile(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (_error) {
    // Ignore missing temp files.
  }
}

async function removeFiles(files = []) {
  await Promise.all(files.map((file) => removeFile(file?.path || file)));
}

module.exports = { removeFile, removeFiles };
