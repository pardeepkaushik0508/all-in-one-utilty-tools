import { useState } from 'react';
import FileDropZone from '../FileDropZone';
import BatchUploader from './BatchUploader';
import { BatchResults } from './BatchResults';
import DownloadAllButton from './DownloadAllButton';
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
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>
      <ToolLoading loading={loading} text="Merging PDFs..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}

export function SplitPdfTool() {
  const [files, setFiles] = useState([]);
  const [range, setRange] = useState('1-3');
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one PDF file.')));
    if (files.length === 1) return run(() => api.splitPdf(files[0], range));
    return run(() => api.splitPdfBatch(files, range));
  };

  return (
    <ToolPanel>
      <BatchUploader accept="application/pdf" files={files} onChange={setFiles} />
      <p className="text-sm text-muted">Selected: {files.length} file(s)</p>
      <TextAreaField
        label="Page range (e.g. 1-3,5 or leave empty for all pages)"
        value={range}
        onChange={setRange}
        rows={2}
      />
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Split PDF</PrimaryButton>
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />}
        <DownloadAllButton items={result?.results || []} zipName="split-pdf-results.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text="Splitting PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
      <BatchResults items={result?.results} />
    </ToolPanel>
  );
}

export function CompressPdfTool() {
  const [files, setFiles] = useState([]);
  const { loading, error, result, run } = useToolRequest();

  const handleSubmit = () => {
    if (!files.length) return run(() => Promise.reject(new Error('Please upload at least one PDF file.')));
    if (files.length === 1) return run(() => api.compressPdf(files[0]));
    return run(() => api.compressPdfBatch(files));
  };

  return (
    <ToolPanel>
      <BatchUploader accept="application/pdf" files={files} onChange={setFiles} />
      <p className="text-sm text-muted">Selected: {files.length} file(s)</p>
      <ToolActions>
        <PrimaryButton onClick={handleSubmit} disabled={loading}>Compress PDF</PrimaryButton>
        {!result?.results && <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />}
        <DownloadAllButton items={result?.results || []} zipName="compressed-pdfs.zip" />
      </ToolActions>
      <ToolLoading loading={loading} text="Compressing PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
      {result?.savedBytes !== undefined && (
        <p className="text-sm text-muted animate-fade-in">Saved approximately {result.savedBytes} bytes.</p>
      )}
      <BatchResults items={result?.results} />
    </ToolPanel>
  );
}
