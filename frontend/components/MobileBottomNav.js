import Link from 'next/link';
import { useRouter } from 'next/router';

const links = [
  {
    href: '/',
    label: 'Home',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
    match: (path) => path === '/'
  },
  {
    href: '/#tools',
    label: 'Tools',
    icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085',
    match: (path) => path.startsWith('/tool') || path.startsWith('/category')
  },
  {
    href: '/category/developer-tools',
    label: 'Dev',
    icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5',
    match: (path) => path.startsWith('/category/developer')
  },
  {
    href: '/blog',
    label: 'Blog',
    icon: 'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z',
    match: (path) => path.startsWith('/blog')
  }
];

export default function MobileBottomNav() {
  const router = useRouter();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
      {links.map((link) => {
        const active = link.match(router.pathname);
        return (
          <Link key={link.href} href={link.href} className={active ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
              <path d={link.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
