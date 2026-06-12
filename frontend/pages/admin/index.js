import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLoginPage from '../../components/admin/AdminLoginPage';
import BlogManager from '../../components/admin/BlogManager';
import ContentManager from '../../components/admin/ContentManager';
import Dashboard from '../../components/admin/Dashboard';
import NavigationManager from '../../components/admin/NavigationManager';
import ToolSeoEditor from '../../components/admin/ToolSeoEditor';
import ToolsManager from '../../components/admin/ToolsManager';
import { useAdminAuth } from '../../hooks/useAdminAuth';

const TAB_COPY = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Overview of CMS activity, content coverage, and tool status.'
  },
  content: {
    title: 'Content Manager',
    subtitle: 'Edit pages, sections, SEO metadata, and publishing status.'
  },
  blog: {
    title: 'Blog Manager',
    subtitle: 'Edit blog posts, article content, categories, and SEO settings.'
  },
  seo: {
    title: 'Tool SEO',
    subtitle: 'Manage tool page SEO content, FAQs, features, and overrides.'
  },
  tools: {
    title: 'Manage Tools',
    subtitle: 'Enable, disable, feature, and schedule tool visibility on the frontend.'
  },
  navigation: {
    title: 'Navigation',
    subtitle: 'Control header links, footer groups, brand copy, and CTA buttons.'
  }
};

export default function AdminPage() {
  const router = useRouter();
  const { token, authed, checking, error, loading, login, logout } = useAdminAuth();

  const activeTab = typeof router.query.tab === 'string' ? router.query.tab : 'dashboard';
  const tabMeta = TAB_COPY[activeTab] || TAB_COPY.dashboard;

  if (checking) {
    return (
      <div className="admin-login-shell flex items-center justify-center">
        <p className="text-sm text-muted">Checking session...</p>
      </div>
    );
  }

  if (!authed) {
    return <AdminLoginPage onLogin={login} error={error} loading={loading} />;
  }

  return (
    <AdminLayout
      title={tabMeta.title}
      subtitle={tabMeta.subtitle}
      activeTab={activeTab}
      onLogout={logout}
    >
      {activeTab === 'dashboard' && <Dashboard token={token} />}
      {activeTab === 'content' && <ContentManager token={token} />}
      {activeTab === 'blog' && <BlogManager token={token} />}
      {activeTab === 'seo' && <ToolSeoEditor token={token} />}
      {activeTab === 'tools' && <ToolsManager token={token} />}
      {activeTab === 'navigation' && <NavigationManager token={token} />}
    </AdminLayout>
  );
}
