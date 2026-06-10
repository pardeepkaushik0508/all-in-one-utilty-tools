import ImageToolShell from './shells/ImageToolShell';
import { IMAGE_SUITE_CONFIGS } from './configs/imageSuiteConfig';

export function createImageTool(config) {
  return function ImageSuiteTool() {
    return <ImageToolShell config={config} />;
  };
}

export const imageSuiteRendererMap = Object.fromEntries(
  IMAGE_SUITE_CONFIGS.map((config) => [config.slug, createImageTool(config)])
);

export { IMAGE_SUITE_CONFIGS };
