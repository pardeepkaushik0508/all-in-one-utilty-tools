const { spawn } = require('child_process');
const { resolveYtDlpPath } = require('./binaries');

function runYtDlp(args, timeoutMs = 120000) {
  const binaryPath = resolveYtDlpPath();
  if (!binaryPath) {
    throw new Error('yt-dlp is not available. Run npm install from the project root and restart the backend.');
  }

  return new Promise((resolve, reject) => {
    const processRef = spawn(binaryPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      processRef.kill('SIGKILL');
      reject(new Error('Download timed out. Try again or use a shorter clip.'));
    }, timeoutMs);

    processRef.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    processRef.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    processRef.on('error', (error) => {
      clearTimeout(timer);
      if (error.code === 'ENOENT') {
        reject(new Error('yt-dlp is not available. Run npm install from the project root and restart the backend.'));
        return;
      }
      reject(error);
    });

    processRef.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const message = stderr.trim() || stdout.trim() || 'Download failed.';
      if (message.includes('python3') || message.includes('Python')) {
        reject(
          new Error(
            'YouTube/Instagram downloads need Python 3 on the server. Redeploy the backend after the latest update.'
          )
        );
        return;
      }
      reject(new Error(message));
    });
  });
}

async function fetchYtDlpJson(url) {
  const { stdout } = await runYtDlp(['--dump-single-json', '--no-playlist', '--no-warnings', url]);
  return JSON.parse(stdout);
}

module.exports = {
  runYtDlp,
  fetchYtDlpJson
};
