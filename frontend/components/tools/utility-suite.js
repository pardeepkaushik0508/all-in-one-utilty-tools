import TextToolShell from './shells/TextToolShell';
import UtilityInteractiveShell from './shells/UtilityInteractiveShell';
import { UTILITY_TEXT_CONFIGS, UTILITY_INTERACTIVE_CONFIGS } from './configs/utilitySuiteConfig';

function createUtilityTool(config) {
  if (config.mode === 'countdown' || config.mode === 'stopwatch') {
    return function UtilityInteractiveTool() {
      return <UtilityInteractiveShell config={config} />;
    };
  }
  return function UtilityTextTool() {
    return <TextToolShell config={config} />;
  };
}

const allConfigs = [...UTILITY_TEXT_CONFIGS, ...UTILITY_INTERACTIVE_CONFIGS];

export const utilitySuiteRendererMap = Object.fromEntries(
  allConfigs.map((config) => [config.slug, createUtilityTool(config)])
);

export { UTILITY_TEXT_CONFIGS, UTILITY_INTERACTIVE_CONFIGS };
