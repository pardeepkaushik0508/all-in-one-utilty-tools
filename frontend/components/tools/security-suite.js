import TextToolShell from './shells/TextToolShell';
import NetworkToolShell from './shells/NetworkToolShell';
import { SECURITY_TEXT_CONFIGS, SECURITY_NETWORK_CONFIGS } from './configs/securitySuiteConfig';

function createSecurityTool(config) {
  const Shell = config.apiCall ? NetworkToolShell : TextToolShell;
  return function SecuritySuiteTool() {
    return <Shell config={config} />;
  };
}

const allConfigs = [...SECURITY_TEXT_CONFIGS, ...SECURITY_NETWORK_CONFIGS];

export const securitySuiteRendererMap = Object.fromEntries(
  allConfigs.map((config) => [config.slug, createSecurityTool(config)])
);

export { SECURITY_TEXT_CONFIGS, SECURITY_NETWORK_CONFIGS };
