import { useEffect, useMemo, useState } from 'react';
import {
  CopyButton,
  DownloadTextButton,
  NumberField,
  PrimaryButton,
  SelectField,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolPanel,
  ToolSuccess
} from '../shared';

export default function TextToolShell({ config }) {
  const [input, setInput] = useState(config.defaultInput || '');
  const [inputB, setInputB] = useState('');
  const [option, setOption] = useState(config.defaultOption || config.options?.[0]?.value || '');
  const [optionB, setOptionB] = useState('');
  const [numberOpt, setNumberOpt] = useState(config.defaultNumber || 3);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);
  const [compare, setCompare] = useState(null);
  const [processing, setProcessing] = useState(false);

  const liveStats = useMemo(() => {
    if (config.mode !== 'live-stats' || !config.statsFn) return null;
    return config.statsFn(input);
  }, [config, input]);

  useEffect(() => {
    if (config.mode === 'live-stats') {
      setStats(liveStats);
    }
  }, [config.mode, liveStats]);

  const runTool = async () => {
    setError('');
    setStatus('');
    try {
      if (config.validate && !config.validate({ input, inputB, option, password })) {
        throw new Error(config.validateMessage || 'Please provide valid input.');
      }
      setProcessing(true);
      const result = await config.process({
        input,
        inputB,
        option,
        optionB,
        numberOpt: Number(numberOpt),
        password
      });
      if (config.mode === 'compare') {
        setCompare(result);
        setOutput('');
      } else if (config.mode === 'live-stats') {
        setStats(result);
      } else {
        setOutput(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
        setCompare(null);
      }
    } catch (err) {
      setError(err.message || 'Processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ToolPanel>
      <TextAreaField
        label={config.inputLabel || 'Input text'}
        value={input}
        onChange={setInput}
        placeholder={config.placeholder}
        rows={config.inputRows || 8}
      />

      {config.dualInput && (
        <TextAreaField
          label={config.inputBLabel || 'Second text'}
          value={inputB}
          onChange={setInputB}
          rows={config.inputRows || 8}
        />
      )}

      {config.options && (
        <SelectField label={config.optionLabel || 'Option'} value={option} onChange={setOption} options={config.options} />
      )}

      {config.secondOption && (
        <TextAreaField label={config.secondOptionLabel || 'Find'} value={option} onChange={setOption} rows={2} />
      )}

      {config.replaceOption && (
        <TextAreaField label="Replace with" value={optionB} onChange={setOptionB} rows={2} />
      )}

      {config.passwordField && (
        <TextAreaField label="Password" value={password} onChange={setPassword} rows={1} />
      )}

      {config.numberField && (
        <NumberField
          label={config.numberLabel || 'Count'}
          value={numberOpt}
          onChange={setNumberOpt}
          min={config.numberMin || 1}
          max={config.numberMax || 1000}
        />
      )}

      {config.mode !== 'live-stats' && (
        <ToolActions>
          <PrimaryButton onClick={runTool} disabled={processing}>
            {config.buttonLabel || 'Process'}
          </PrimaryButton>
        </ToolActions>
      )}

      <ToolError message={error} />

      {config.mode === 'live-stats' && stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="stat-card">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">{key}</p>
              <p className="mt-1 font-display text-2xl font-bold text-heading">{value}</p>
            </div>
          ))}
        </div>
      )}

      {output && (
        <div className="animate-fade-in space-y-3">
          {config.mode === 'qr' ? (
            <div className="flex flex-col items-center gap-4">
              <img src={output} alt="Generated QR code" className="h-64 w-64 rounded-xl border border-theme" />
              <ToolActions>
                <a href={output} download="qrcode.png" className="btn-secondary">Download QR</a>
                <CopyButton text={output} onCopied={setStatus} />
              </ToolActions>
            </div>
          ) : (
            <>
              <TextAreaField label="Result" value={output} onChange={setOutput} rows={10} readOnly />
              <ToolActions>
                <CopyButton text={output} onCopied={setStatus} />
                <DownloadTextButton text={output} filename={config.downloadFilename || 'result.txt'} />
              </ToolActions>
            </>
          )}
        </div>
      )}

      {compare && (
        <div className="animate-fade-in space-y-3">
          <p className="text-sm text-body">Similarity: <strong>{compare.similarity}%</strong></p>
          <div className="max-h-80 overflow-auto rounded-xl border border-theme">
            {compare.diff.map((row) => (
              <div
                key={row.line}
                className={`grid gap-2 border-b border-theme p-3 text-xs sm:grid-cols-2 ${row.changed ? 'bg-[var(--accent-subtle)]' : ''}`}
              >
                <span>{row.left || '—'}</span>
                <span>{row.right || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}
