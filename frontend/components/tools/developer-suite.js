import TextToolShell from './shells/TextToolShell';
import NetworkToolShell from './shells/NetworkToolShell';
import { DEVELOPER_SUITE_CONFIGS, DEVELOPER_NETWORK_CONFIGS } from './configs/developerSuiteConfig';

function createDeveloperTool(config) {
  const Shell = config.apiCall ? NetworkToolShell : TextToolShell;
  return function DeveloperSuiteTool() {
    return <Shell config={config} />;
  };
}

const allConfigs = [...DEVELOPER_SUITE_CONFIGS, ...DEVELOPER_NETWORK_CONFIGS];

export const developerSuiteRendererMap = Object.fromEntries(
  allConfigs.map((config) => [config.slug, createDeveloperTool(config)])
);

export { DEVELOPER_SUITE_CONFIGS, DEVELOPER_NETWORK_CONFIGS };
