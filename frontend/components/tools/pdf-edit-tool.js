import { useState } from 'react';
import toast from 'react-hot-toast';
import FileDropZone from '../FileDropZone';
import PdfEditor from '../pdf/PdfEditor';
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
      <FileDropZone accept="application/pdf" onFiles={(items) => setFile(items[0] || null)} />
      <p className="text-sm text-muted">Selected: {file ? file.name : 'No file selected'}</p>

      <div className="rounded-2xl border border-theme bg-[var(--bg-elevated)] p-3 text-sm text-muted">
        <strong className="text-heading">How to edit:</strong> Use <em>Edit Text</em> to click existing PDF text and replace it.
        Use <em>Add Text</em> to place new text. Drag elements with <em>Select</em>. Draw, highlight, add images, then save.
      </div>

      <PdfEditor file={file} onSave={handleSaveWrapper} saving={loading} />

      <ToolActions>
        <DownloadLink url={result?.downloadUrl} filename={result?.downloadFilename} />
      </ToolActions>

      <ToolLoading loading={loading} text="Saving edited PDF..." />
      <ToolError message={error} />
      <ToolSuccess message={result?.message} />
    </ToolPanel>
  );
}
