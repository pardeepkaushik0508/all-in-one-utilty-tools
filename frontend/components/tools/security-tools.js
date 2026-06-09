import { useState } from 'react';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  CopyButton,
  PrimaryButton,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(12);
  const [useSymbols, setUseSymbols] = useState(true);
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <label className="block">
        <span className="label-text">Password length</span>
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="input-field sm:w-64"
          min={6}
          max={64}
        />
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
        Include symbols
      </label>
      <ToolActions>
        <PrimaryButton onClick={() => run(() => api.generatePassword(length, useSymbols))} disabled={loading}>
          Generate Password
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Generating password..." />
      <ToolError message={error} />
      {result?.password && (
        <div className="animate-fade-in space-y-3">
          <p className="input-field font-mono text-sm break-all">{result.password}</p>
          <ToolActions>
            <CopyButton text={result.password} onCopied={setStatus} />
          </ToolActions>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}

export function PasswordStrengthCheckerTool() {
  const [password, setPassword] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Password" value={password} onChange={setPassword} rows={2} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!password) return run(() => Promise.reject(new Error('Password is required.')));
            return run(() => api.checkPasswordStrength(password));
          }}
          disabled={loading}
        >
          Check Strength
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Checking strength..." />
      <ToolError message={error} />
      {result && (
        <p className="animate-fade-in text-sm text-body">
          Score: <strong>{result.score}</strong> — {result.label}
        </p>
      )}
    </ToolPanel>
  );
}

export function HashGeneratorTool() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Text to hash" value={text} onChange={setText} rows={4} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!text.trim()) return run(() => Promise.reject(new Error('Text is required.')));
            return run(() => api.generateHash(text));
          }}
          disabled={loading}
        >
          Generate Hashes
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Generating hashes..." />
      <ToolError message={error} />
      {result && (
        <div className="animate-fade-in space-y-2 text-sm font-mono">
          <p className="break-all"><strong>MD5:</strong> {result.md5}</p>
          <p className="break-all"><strong>SHA256:</strong> {result.sha256}</p>
          <ToolActions>
            <CopyButton text={`MD5: ${result.md5}\nSHA256: ${result.sha256}`} onCopied={setStatus} />
          </ToolActions>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}
