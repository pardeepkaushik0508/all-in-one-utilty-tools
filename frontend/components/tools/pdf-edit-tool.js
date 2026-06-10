import { useState } from 'react';
import toast from 'react-hot-toast';
import FileDropZone from '../FileDropZone';
import PdfEditor from '../pdf/PdfEditor';
import ToolErrorBoundary from '../ToolErrorBoundary';
import useToolRequest from '../../hooks/useToolRequest';
import * as api from '../../services/api';
import {
  DownloadLink,
  ToolActions,
  ToolError,
  ToolLoading,
  ToolPanel,
  ToolSuccess
} from './shared';

export function EditPdfTool() {
  const [file, setFile] = useState(null);
  const { loading, error, result, run } = useToolRequest();

  const handleSave = async (annotations, imageFiles) => {
    if (!file) throw new Error('Upload a PDF to edit.');
    return api.editPdf(file, annotations, imageFiles);
  };

  const handleSaveWrapper = async (annotations, imageFiles) => {
    try {
      await run(() => handleSave(annotations, imageFiles));
      toast.success('Edited PDF saved successfully');
    } catch {
      // error handled by useToolRequest
    }
  };

  return (
    <ToolPanel>
      <div className="rounded-2xl border border-theme bg-[var(--bg-elevated)] p-4">
        <h3 className="font-display text-base font-semibold text-heading">Edit PDF</h3>
        <p className="mt-1 text-sm text-muted">
          Add text, signatures, images, highlights, shapes, and drawings. Use undo/redo and export when done.
        </p>
      </div>

      <FileDropZone
        accept="application/pdf"
        onFiles={(items) => setFile(items[0] || null)}
        selectedFiles={file ? [file] : []}
        onRemoveFile={() => setFile(null)}
      />

      <ToolErrorBoundary>
        <PdfEditor file={file} onSave={handleSaveWrapper} saving={loading} />
      </ToolErrorBoundary>

      <ToolActions>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>

      <ToolLoading loading={loading} text="Saving edited PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}
