import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { getPopularTools } from '../../hooks/useToolAnalytics';
import { adminFetch } from '../../utils/adminApi';
import { tools, findToolBySlug } from '../../utils/tools';

function StatCard({ label, value, meta }) {
  return (
    <article className="admin-stat-card">
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
      {meta && <p className="admin-stat-meta">{meta}</p>}
    </article>
  );
}

function ChartCard({ title, subtitle, children, wide = false }) {
  return (
    <section className={`admin-chart-card ${wide ? 'admin-chart-wide' : ''}`}>
      <h2 className="admin-chart-title">{title}</h2>
      {subtitle && <p className="admin-chart-subtitle">{subtitle}</p>}
      {children}
    </section>
  );
}

function formatActivityTime(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatActivityDetails(details = {}) {
  const parts = [];
  if (details.slug) parts.push(details.slug);
  if (details.id && !details.slug) parts.push(details.id);
  if (details.status) parts.push(details.status);
  return parts.join(' · ');
}

export default function Dashboard({ token }) {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const chartTheme = useMemo(
    () => ({
      grid: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      text: theme === 'dark' ? '#a3a3a3' : '#737373',
      tooltipBg: theme === 'dark' ? '#111111' : '#ffffff',
      tooltipBorder: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
      accent: theme === 'dark' ? '#a78bfa' : '#6d28d9',
      accentSoft: theme === 'dark' ? 'rgba(167,139,250,0.25)' : 'rgba(109,40,217,0.15)'
    }),
    [theme]
  );

  const localPopular = useMemo(() => getPopularTools(6), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminFetch(`/api/admin/dashboard?catalogTools=${tools.length}`, { token })
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return <p className="text-sm text-muted">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="alert-error">{error}</p>;
  }

  const summary = stats?.summary || {};

  return (
    <div className="space-y-6">
      <section className="admin-stat-grid">
        <StatCard label="Total tools" value={summary.catalogTools || tools.length} meta={`${summary.enabledTools || 0} enabled`} />
        <StatCard label="Pages" value={summary.totalPages || 0} meta={`${summary.publishedPages || 0} published`} />
        <StatCard label="SEO overrides" value={(summary.seoToolOverrides || 0) + (summary.seoBlogOverrides || 0)} meta={`${summary.seoToolOverrides || 0} tools · ${summary.seoBlogOverrides || 0} blogs`} />
        <StatCard label="Cache version" value={summary.cacheVersion || 1} meta={`${summary.totalActivity || 0} admin actions logged`} />
      </section>

      <section className="admin-chart-grid">
        <ChartCard title="Admin activity" subtitle="Actions over the last 14 days" wide>
          {stats?.activityByDay?.some((item) => item.count > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.activityByDay}>
                <defs>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTheme.accent} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={chartTheme.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartTheme.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: chartTheme.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '0.75rem'
                  }}
                />
                <Area type="monotone" dataKey="count" stroke={chartTheme.accent} fill="url(#activityGradient)" strokeWidth={2} name="Actions" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty-chart">No admin activity recorded yet. Changes you make will appear here.</div>
          )}
        </ChartCard>

        <ChartCard title="Actions by type" subtitle="Most frequent admin operations">
          {stats?.activityByType?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.activityByType} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: chartTheme.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="action" width={120} tick={{ fill: chartTheme.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '0.75rem'
                  }}
                />
                <Bar dataKey="count" fill={chartTheme.accent} radius={[0, 6, 6, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty-chart">No action breakdown available yet.</div>
          )}
        </ChartCard>

        <ChartCard title="Tool status" subtitle="Visibility and maintenance breakdown">
          {stats?.toolStatus?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={stats.toolStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {stats.toolStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: chartTheme.tooltipBg,
                    border: `1px solid ${chartTheme.tooltipBorder}`,
                    borderRadius: '0.75rem'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="admin-empty-chart">All tools use default enabled settings.</div>
          )}
        </ChartCard>

        <ChartCard title="Content coverage" subtitle="CMS-managed assets across the site">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats?.contentCoverage || []}>
              <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: chartTheme.text, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: chartTheme.text, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: chartTheme.tooltipBg,
                  border: `1px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '0.75rem'
                }}
              />
              <Bar dataKey="count" fill={chartTheme.accent} radius={[6, 6, 0, 0]} name="Items" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="admin-chart-grid">
        <ChartCard title="Recent admin activity" subtitle="Latest CMS changes">
          <div className="admin-activity-list pb-3">
            {(stats?.recentActivity || []).length ? (
              stats.recentActivity.map((item) => (
                <article key={item.id} className="admin-activity-item">
                  <div>
                    <p className="admin-activity-action">{item.action?.replace(/\./g, ' · ')}</p>
                    <p className="text-xs text-muted">{formatActivityDetails(item.details)}</p>
                  </div>
                  <time className="admin-activity-time">{formatActivityTime(item.createdAt)}</time>
                </article>
              ))
            ) : (
              <div className="admin-empty-chart !h-40">No recent activity.</div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Popular tools (this browser)" subtitle="Local usage analytics from site visits">
          <div className="admin-activity-list pb-3">
            {localPopular.length ? (
              localPopular.map((item) => {
                const tool = findToolBySlug(item.slug);
                return (
                  <article key={item.slug} className="admin-activity-item">
                    <div>
                      <p className="admin-activity-action">{tool?.name || item.slug}</p>
                      <p className="text-xs text-muted">{item.count} views</p>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="admin-empty-chart !h-40">Open tools on the site to populate local usage stats.</div>
            )}
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
