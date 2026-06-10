let pdfjsLibPromise;
let pdfDocumentCache = null;
let pdfDocumentCacheKey = '';

async function loadPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist/legacy/build/pdf.mjs').then((pdfjsLib) => {
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }
      return pdfjsLib;
    });
  }
  return pdfjsLibPromise;
}

async function loadPdfDocument(file) {
  const pdfjsLib = await loadPdfJs();
  const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
  if (pdfDocumentCache && pdfDocumentCacheKey === cacheKey) {
    return pdfDocumentCache;
  }

  const bytes = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    useSystemFonts: true,
    disableFontFace: false
  });

  pdfDocumentCache = await loadingTask.promise;
  pdfDocumentCacheKey = cacheKey;
  return pdfDocumentCache;
}

export function clearPdfDocumentCache() {
  if (pdfDocumentCache) {
    pdfDocumentCache.destroy?.();
  }
  pdfDocumentCache = null;
  pdfDocumentCacheKey = '';
}

export async function getPdfPageCount(file) {
  const pdf = await loadPdfDocument(file);
  return pdf.numPages;
}

export async function extractPdfTextItems(file, pageNumber = 1) {
  const pdf = await loadPdfDocument(file);
  const page = await pdf.getPage(Math.min(Math.max(pageNumber, 1), pdf.numPages));
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await page.getTextContent();

  return textContent.items
    .map((item, index) => {
      if (!item.str?.trim()) return null;
      const tx = item.transform;
      const fontSize = Math.max(Math.abs(tx[0]), Math.abs(tx[3]), 10);
      const x = tx[4];
      const y = viewport.height - tx[5] - fontSize;

      return {
        id: `pdf-text-${pageNumber}-${index}`,
        str: item.str,
        x,
        y,
        width: item.width || item.str.length * fontSize * 0.55,
        height: fontSize * 1.35,
        fontSize
      };
    })
    .filter(Boolean);
}

export async function renderPdfPageToCanvas(file, pageNumber = 1, scale = 1.25) {
  const pdfjsLib = await loadPdfJs();
  const pdf = await loadPdfDocument(file);
  const safePage = Math.min(Math.max(pageNumber, 1), pdf.numPages);
  const page = await pdf.getPage(safePage);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { alpha: false });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  const renderTask = page.render({
    canvasContext: context,
    viewport
  });
  await renderTask.promise;

  return {
    canvas,
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    pageCount: pdf.numPages,
    scale
  };
}

export async function renderPdfPageToDataUrl(file, pageNumber = 1, scale = 1.25) {
  const rendered = await renderPdfPageToCanvas(file, pageNumber, scale);
  return {
    dataUrl: rendered.dataUrl,
    width: rendered.width,
    height: rendered.height,
    pageCount: rendered.pageCount
  };
}
