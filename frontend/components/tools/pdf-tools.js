import { useState } from 'react';
import FileDropZone from '../FileDropZone';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  DownloadLink,
  PrimaryButton,
  TextAreaField,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

export function MergePdfTool() {
  const [files, setFiles] = useState([]);
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (files.length < 2) return run(() => Promise.reject(new Error('Please upload at least 2 PDF files.')));
    return run(() => api.mergePdf(files));
  };

  return (
    <ToolPanel>
      <FileDropZone multiple accept="application/pdf" onFiles={setFiles} />
      <p className="text-sm text-muted">Selected: {files.length} file(s)</p>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Merge PDF</PrimaryButton>
        <DownloadLink url={result?.downloadUrl} />
      </ToolActions>
      <ToolLoading loading={loading} text="Merging PDFs..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}

export function SplitPdfTool() {
  const [file, setFile] = useState(null);
  const [range, setRange] = useState('1-3');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload a PDF file.')));
    return run(() => api.splitPdf(file, range));
  };

  return (
    <ToolPanel>
      <FileDropZone accept="application/pdf" onFiles={(items) => setFile(items[0])} />
      <p className="text-sm text-muted">Selected: {file ? file.name : 'No file selected'}</p>
      <TextAreaField
        label="Page range (e.g. 1-3,5 or leave empty for all pages)"
        value={range}
        onChange={setRange}
        rows={2}
      />
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Split PDF</PrimaryButton>
        <DownloadLink url={result?.downloadUrl} />
      </ToolActions>
      <ToolLoading loading={loading} text="Splitting PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}

export function CompressPdfTool() {
  const [file, setFile] = useState(null);
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!file) return run(() => Promise.reject(new Error('Please upload a PDF file.')));
    return run(() => api.compressPdf(file));
  };

  return (
    <ToolPanel>
      <FileDropZone accept="application/pdf" onFiles={(items) => setFile(items[0])} />
      <p className="text-sm text-muted">Selected: {file ? file.name : 'No file selected'}</p>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Compress PDF</PrimaryButton>
        <DownloadLink url={result?.downloadUrl} />
      </ToolActions>
      <ToolLoading loading={loading} text="Compressing PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
      {result?.savedBytes !== undefined && (
        <p className="text-sm text-muted animate-fade-in">Saved approximately {result.savedBytes} bytes.</p>
      )}
    </ToolPanel>
  );
}
