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

export function GrammarCheckerTool() {
  const [text, setText] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Text to check" value={text} onChange={setText} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!text.trim()) return run(() => Promise.reject(new Error('Text is required.')));
            return run(() => api.checkGrammar(text));
          }}
          disabled={loading}
        >
          Check Grammar
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Checking grammar..." />
      <ToolError message={error} />
      {result && (
        <div className="animate-fade-in space-y-2 text-sm">
          <p className="text-emerald-400">Found {result.issueCount} issue(s).</p>
          {(result.matches || []).map((match, index) => (
            <div key={`${match.offset}-${index}`} className="rounded-xl border border-theme bg-[var(--bg-elevated)] p-3">
              <p className="text-body">{match.message}</p>
              {match.replacements?.length > 0 && (
                <p className="mt-1 text-muted">Suggestions: {match.replacements.join(', ')}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </ToolPanel>
  );
}

export function ParaphrasingTool() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Text to paraphrase" value={text} onChange={setText} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!text.trim()) return run(() => Promise.reject(new Error('Text is required.')));
            return run(() => api.paraphraseText(text));
          }}
          disabled={loading}
        >
          Paraphrase
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Paraphrasing..." />
      <ToolError message={error} />
      {result?.output && (
        <div className="animate-fade-in space-y-3">
          <textarea readOnly value={result.output} className="input-field h-56" />
          <ToolActions>
            <CopyButton text={result.output} onCopied={setStatus} />
          </ToolActions>
          <p className="text-xs text-muted">Provider: {result.provider}</p>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}

export function PlagiarismCheckerTool() {
  const [sourceText, setSourceText] = useState('');
  const [compareText, setCompareText] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Source text" value={sourceText} onChange={setSourceText} />
      <TextAreaField label="Text to compare" value={compareText} onChange={setCompareText} />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!sourceText.trim() || !compareText.trim()) {
              return run(() => Promise.reject(new Error('Both texts are required.')));
            }
            return run(() => api.checkPlagiarism(sourceText, compareText));
          }}
          disabled={loading}
        >
          Check Similarity
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Analyzing similarity..." />
      <ToolError message={error} />
      {result && (
        <p className="animate-fade-in text-sm text-body">
          Similarity: <strong>{result.similarityPercent}%</strong> ({result.matchedWords}/{result.totalWords} words)
        </p>
      )}
    </ToolPanel>
  );
}

export function AiContentGeneratorTool() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const { loading, error, result, run } = useToolRequest();

  return (
    <ToolPanel>
      <TextAreaField label="Prompt" value={prompt} onChange={setPrompt} placeholder="Write a blog intro about productivity tools..." />
      <ToolActions>
        <PrimaryButton
          onClick={() => {
            if (!prompt.trim()) return run(() => Promise.reject(new Error('Prompt is required.')));
            return run(() => api.generateAiContent(prompt));
          }}
          disabled={loading}
        >
          Generate Content
        </PrimaryButton>
      </ToolActions>
      <ToolLoading loading={loading} text="Generating content..." />
      <ToolError message={error} />
      {result?.output && (
        <div className="animate-fade-in space-y-3">
          <textarea readOnly value={result.output} className="input-field h-64" />
          <ToolActions>
            <CopyButton text={result.output} onCopied={setStatus} />
          </ToolActions>
          <p className="text-xs text-muted">Provider: {result.provider}</p>
        </div>
      )}
      {status && <ToolSuccess message={status} />}
    </ToolPanel>
  );
}
