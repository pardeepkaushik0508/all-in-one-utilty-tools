import { createContext, useContext, useMemo } from 'react';
import { normalizeToolSettings } from '../utils/cms/siteConfig';

const SiteConfigContext = createContext({
  toolSettingsMap: {},
  navigation: null,
  pages: [],
  cacheVersion: 1
});

export function SiteConfigProvider({ children, siteConfig = null }) {
  const value = useMemo(() => {
    const toolSettingsMap = normalizeToolSettings(siteConfig?.toolSettings || []);
    return {
      toolSettingsMap,
      navigation: siteConfig?.navigation || null,
      pages: siteConfig?.pages || [],
      cacheVersion: siteConfig?.cacheVersion || 1
    };
  }, [siteConfig]);

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

export default SiteConfigContext;
