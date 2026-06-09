import dynamic from 'next/dynamic';
import LoadingSpinner from '../LoadingSpinner';

function ToolLoading() {
  return (
    <div className="card flex justify-center py-10">
      <LoadingSpinner text="Loading tool..." />
    </div>
  );
}

const load = (factory) =>
  dynamic(factory, {
    loading: ToolLoading,
    ssr: false
  });

// Load each tool on demand — avoids webpack/HMR crashes from bundling all 29 tools together.
export const rendererBySlug = {
  'merge-pdf': load(() => import('./pdf-tools').then((m) => m.MergePdfTool)),
  'split-pdf': load(() => import('./pdf-tools').then((m) => m.SplitPdfTool)),
  'compress-pdf': load(() => import('./pdf-tools').then((m) => m.CompressPdfTool)),
  'compress-image': load(() => import('./image-tools').then((m) => m.CompressImageTool)),
  'resize-image': load(() => import('./image-tools').then((m) => m.ResizeImageTool)),
  'convert-jpg-png': load(() => import('./image-tools').then((m) => m.ConvertJpgPngTool)),
  'image-to-text': load(() => import('./image-tools').then((m) => m.ImageToTextTool)),
  'video-to-mp3': load(() => import('./media-tools').then((m) => m.VideoToMp3Tool)),
  'video-compression': load(() => import('./media-tools').then((m) => m.VideoCompressionTool)),
  'audio-cutter': load(() => import('./media-tools').then((m) => m.AudioCutterTool)),
  'video-downloader': load(() => import('./media-tools').then((m) => m.VideoDownloaderTool)),
  'grammar-checker': load(() => import('./text-tools').then((m) => m.GrammarCheckerTool)),
  'paraphrasing-tool': load(() => import('./text-tools').then((m) => m.ParaphrasingTool)),
  'plagiarism-checker': load(() => import('./text-tools').then((m) => m.PlagiarismCheckerTool)),
  'ai-content-generator': load(() => import('./text-tools').then((m) => m.AiContentGeneratorTool)),
  'json-formatter': load(() => import('../JsonFormatter')),
  'code-minifier': load(() => import('./developer-tools').then((m) => m.CodeMinifierTool)),
  'html-to-text': load(() => import('./developer-tools').then((m) => m.HtmlToTextTool)),
  'css-beautifier': load(() => import('./developer-tools').then((m) => m.CssBeautifierTool)),
  'instagram-downloader': load(() => import('./social-tools').then((m) => m.InstagramDownloaderTool)),
  'thumbnail-downloader': load(() => import('./social-tools').then((m) => m.ThumbnailDownloaderTool)),
  'hashtag-generator': load(() => import('./social-tools').then((m) => m.HashtagGeneratorTool)),
  'password-generator': load(() => import('./security-tools').then((m) => m.PasswordGeneratorTool)),
  'password-strength-checker': load(() => import('./security-tools').then((m) => m.PasswordStrengthCheckerTool)),
  'hash-generator': load(() => import('./security-tools').then((m) => m.HashGeneratorTool)),
  'unit-converter': load(() => import('./utility-tools').then((m) => m.UnitConverterTool)),
  'age-calculator': load(() => import('./utility-tools').then((m) => m.AgeCalculatorTool)),
  'emi-calculator': load(() => import('./utility-tools').then((m) => m.EmiCalculatorTool)),
  'currency-converter': load(() => import('./utility-tools').then((m) => m.CurrencyConverterTool))
};
