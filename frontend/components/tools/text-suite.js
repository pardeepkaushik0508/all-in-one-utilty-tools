import TextToolShell from './shells/TextToolShell';
import { TEXT_SUITE_CONFIGS } from './configs/textSuiteConfig';

export function createTextTool(config) {
  return function TextSuiteTool() {
    return <TextToolShell config={config} />;
  };
}

export const textSuiteRendererMap = Object.fromEntries(
  TEXT_SUITE_CONFIGS.map((config) => [config.slug, createTextTool(config)])
);

export { TEXT_SUITE_CONFIGS };
