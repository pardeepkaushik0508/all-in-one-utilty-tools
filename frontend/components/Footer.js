import Link from 'next/link';
import { SITE_NAME } from './SEO';

const footerLinks = {
  Tools: [
    { href: '/#tools', label: 'All tools' },
    { href: '/tool/merge-pdf', label: 'Merge PDF' },
    { href: '/tool/ai-content-generator', label: 'AI Content' },
    { href: '/tool/ai-image-generator', label: 'AI Images' },
    { href: '/tool/json-formatter', label: 'JSON Formatter' }
  ],
  Resources: [
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ]
};

export default function Footer() {
  return (
    <footer className="relative border-t border-theme">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg font-bold text-heading">
              Utility<span className="gradient-text">Tools</span>
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              33 free online tools for PDF, image, video, text, and developers. Simple, fast, and private.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems online
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-heading">{title}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted transition-colors hover:text-heading">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-heading">Stay productive</h3>
            <p className="mt-4 text-sm text-muted">Read guides on our blog or jump straight into any tool.</p>
            <Link href="/blog" className="btn-primary mt-4 inline-flex !px-4 !py-2 !text-xs">
              Read the blog
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-theme pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} {SITE_NAME}. Free forever. No sign-up required.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted">
            <span>34 tools</span>
            <span>8 categories</span>
            <span>20+ articles</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
