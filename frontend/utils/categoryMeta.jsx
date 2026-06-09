const categoryMeta = {
  'PDF Tools': {
    gradient: 'from-rose-500/20 to-orange-500/10',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    border: 'group-hover:border-rose-500/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Image Tools': {
    gradient: 'from-violet-500/20 to-purple-500/10',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    border: 'group-hover:border-violet-500/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Video/Audio Tools': {
    gradient: 'from-cyan-500/20 to-blue-500/10',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    border: 'group-hover:border-cyan-500/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Text Tools': {
    gradient: 'from-amber-500/20 to-yellow-500/10',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    border: 'group-hover:border-amber-500/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M4 7V4h16v3M9 20h6M12 4v16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Developer Tools': {
    gradient: 'from-emerald-500/20 to-green-500/10',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    border: 'group-hover:border-emerald-500/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Social Media Tools': {
    gradient: 'from-pink-500/20 to-fuchsia-500/10',
    iconBg: 'bg-pink-500/15',
    iconColor: 'text-pink-400',
    border: 'group-hover:border-pink-500/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Security Tools': {
    gradient: 'from-slate-400/20 to-slate-500/10',
    iconBg: 'bg-slate-400/15',
    iconColor: 'text-slate-300',
    border: 'group-hover:border-slate-400/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  'Utility Tools': {
    gradient: 'from-indigo-500/20 to-violet-500/10',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    border: 'group-hover:border-indigo-500/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
};

const defaultMeta = {
  gradient: 'from-violet-500/20 to-indigo-500/10',
  iconBg: 'bg-violet-500/15',
  iconColor: 'text-violet-400',
  border: 'group-hover:border-violet-500/30',
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export function getCategoryMeta(category) {
  return categoryMeta[category] || defaultMeta;
}
