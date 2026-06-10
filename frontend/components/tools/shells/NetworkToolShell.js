import { useState } from 'react';
import useToolRequest from '../../../hooks/useToolRequest';
import {
  CopyButton,
  DownloadTextButton,
  PrimaryButton,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from '../shared';

export default function NetworkToolShell({ config }) {
  const [input, setInput] = useState('');
  const [inputB, setInputB] = useState('');
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  const handleRun = () => {
    if (!input.trim() && config.requiresInput !== false) {
      return run(() => Promise.reject(new Error(config.inputRequiredMessage || 'Input is required.')));
    }
    return run(() => config.apiCall({ input, inputB }));
  };

  const output = result
    ? (config.formatResult
      ? config.formatResult(result)
      : result?.output || result?.result || JSON.stringify(result, null, 2))
    : '';

  return (
    <ToolPanel>
      <TextAreaField
        label={config.inputLabel || 'Input'}
        value={input}
        onChange={setInput}
        placeholder={config.placeholder}
        rows={config.inputRows || 3}
      />
      {config.dualInput && (
        <TextAreaField label={config.inputBLabel || 'Additional input'} value={inputB} onChange={setInputB} rows={3} />
      )}
      <ToolActions>
        <PrimaryButton onClick={handleRun} disabled={loading}>
          {config.buttonLabel || 'Check'}
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text={config.loadingText || 'Processing...'} />
      <ToolError message={error} />
      {result && (
        <div className="animate-fade-in space-y-3">
          <TextAreaField label="Result" value={output || ''} onChange={() => {}} rows={12} readOnly />
          {output && (
            <ToolActions>
              <CopyButton text={output} onCopied={setStatus} />
              <DownloadTextButton text={output} filename={`${config.slug || 'result'}.txt`} />
            </ToolActions>
          )}
        </div>
      )}
      {status && <ToolSuccess message={status} />}
      {config.disclaimer && <p className="text-xs text-muted">{config.disclaimer}</p>}
    </ToolPanel>
  );
}
