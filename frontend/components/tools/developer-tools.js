import { useState } from 'react';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  CopyButton,
  PrimaryButton,
  SelectField,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

export function CodeMinifierTool() {
  const [code, setCode] = useState('');
  const [type, setType] = useState('js');
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <SelectField
        label="Code type"
        value={type}
        onChange={setType}
        options={[
          { value: 'js', label: 'JavaScript' },
          { value: 'css', label: 'CSS' },
          { value: 'html', label: 'HTML' }
        ]}
      />
      <TextAreaField label="Input code" value={code} onChange={setCode} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!code.trim()) return run(() => Promise.reject(new Error('Code is required.')));
            return run(() => api.minifyCode(code, type));
          }}
          disabled={loading}
        >
          Minify Code
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Minifying..." />
      <ToolError message={error} />
      {result?.output && (
        <div className="animate-fade-in space-y-3">
          <textarea readOnly value={result.output} className="input-field h-56 font-mono" />
          <ToolActions>
            <CopyButton text={result.output} onCopied={setStatus} />
          </ToolActions>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}

export function HtmlToTextTool() {
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="HTML input" value={html} onChange={setHtml} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!html.trim()) return run(() => Promise.reject(new Error('HTML is required.')));
            return run(() => api.htmlToText(html));
          }}
          disabled={loading}
        >
          Convert to Text
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Converting..." />
      <ToolError message={error} />
      {result?.output && (
        <div className="animate-fade-in space-y-3">
          <textarea readOnly value={result.output} className="input-field h-56" />
          <ToolActions>
            <CopyButton text={result.output} onCopied={setStatus} />
          </ToolActions>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}

export function CssBeautifierTool() {
  const [css, setCss] = useState('');
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="CSS input" value={css} onChange={setCss} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!css.trim()) return run(() => Promise.reject(new Error('CSS is required.')));
            return run(() => api.beautifyCss(css));
          }}
          disabled={loading}
        >
          Beautify CSS
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Beautifying CSS..." />
      <ToolError message={error} />
      {result?.output && (
        <div className="animate-fade-in space-y-3">
          <textarea readOnly value={result.output} className="input-field h-56 font-mono" />
          <ToolActions>
            <CopyButton text={result.output} onCopied={setStatus} />
          </ToolActions>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}
