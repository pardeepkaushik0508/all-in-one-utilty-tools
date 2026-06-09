import { useState } from 'react';
import { formatJson, getValidationMessage, minifyJson } from '../utils/jsonFormatter';
import { ToolActions, ToolPanel } from './tools/shared';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [autoFormatOnPaste, setAutoFormatOnPaste] = useState(false);

  const handleFormat = () => {
    setError('');
    setStatus('');
    const result = formatJson(input);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOutput(result.output);
    setStatus('JSON formatted successfully.');
  };

  const handleMinify = () => {
    setError('');
    setStatus('');
    const result = minifyJson(input);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOutput(result.output);
    setStatus('JSON minified successfully.');
  };

  const handleValidate = () => {
    setError('');
    const validationMessage = getValidationMessage(input);

    if (validationMessage === 'JSON is valid.') {
      setStatus(validationMessage);
      return;
    }

    setStatus('');
    setError(validationMessage);
  };

  const handleCopy = async () => {
    if (!output) {
      setStatus('');
      setError('Nothing to copy. Generate formatted/minified output first.');
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setError('');
      setStatus('Output copied to clipboard.');
    } catch (_error) {
      setStatus('');
      setError('Could not copy output. Please copy manually.');
    }
  };

  const handleDownload = () => {
    if (!output) {
      setStatus('');
      setError('Nothing to download. Generate output first.');
      return;
    }

    const blob = new Blob([output], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    link.click();
    URL.revokeObjectURL(url);
    setError('');
    setStatus('Output downloaded.');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setStatus('');
  };

  const handlePaste = (event) => {
    if (!autoFormatOnPaste) return;

    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    setInput(pasted);

    const result = formatJson(pasted);
    if (result.error) {
      setError(result.error);
      setStatus('');
      return;
    }

    setError('');
    setOutput(result.output);
    setStatus('Pasted and auto-formatted successfully.');
  };

  return (
    <ToolPanel>
      <label className="inline-flex items-center gap-2.5 text-sm text-muted">
        <input
          type="checkbox"
          checked={autoFormatOnPaste}
          onChange={(event) => setAutoFormatOnPaste(event.target.checked)}
          className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500/30"
        />
        Auto format on paste
      </label>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="json-input" className="label-text">Input JSON</label>
          <textarea
            id="json-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onPaste={handlePaste}
            placeholder='Paste raw JSON here, e.g. {"name":"Tool","type":"formatter"}'
            className="input-field h-72 font-mono"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="json-output" className="label-text">Output JSON</label>
          <textarea
            id="json-output"
            value={output}
            readOnly
            placeholder="Formatted or minified output appears here."
            className="input-field h-72 font-mono opacity-90"
          />
        </div>
      </div>

      <ToolActions>
        <button onClick={handleFormat} className="btn-primary">Format JSON</button>
        <button onClick={handleMinify} className="btn-secondary">Minify JSON</button>
        <button onClick={handleValidate} className="btn-secondary">Validate JSON</button>
        <button onClick={handleCopy} className="btn-secondary">Copy</button>
        <button onClick={handleDownload} className="btn-secondary">Download JSON</button>
        <button onClick={handleClear} className="btn-secondary !text-red-500">Clear</button>
      </ToolActions>

      {status && <div className="alert-success animate-fade-in">{status}</div>}
      {error && <div className="alert-error animate-fade-in">{error}</div>}
    </ToolPanel>
  );
}
