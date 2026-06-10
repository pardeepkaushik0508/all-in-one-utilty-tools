import TextToolShell from './shells/TextToolShell';
import { SOCIAL_SUITE_CONFIGS } from './configs/socialSuiteConfig';

export function createSocialTool(config) {
  return function SocialSuiteTool() {
    return <TextToolShell config={config} />;
  };
}

export const socialSuiteRendererMap = Object.fromEntries(
  SOCIAL_SUITE_CONFIGS.map((config) => [config.slug, createSocialTool(config)])
);

export { SOCIAL_SUITE_CONFIGS };
