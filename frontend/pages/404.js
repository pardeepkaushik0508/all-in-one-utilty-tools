import Link from 'next/link';
import Layout from '../components/Layout';

export default function NotFoundPage() {
  return (
    <Layout title="Page Not Found" noindex canonical="/404">
      <div className="card py-16 text-center">
        <p className="font-display text-6xl font-bold text-heading">404</p>
        <h1 className="mt-4 font-display text-xl font-semibold text-heading">Page not found</h1>
        <p className="mt-2 text-sm text-muted">The page you are looking for does not exist.</p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          Back to home
        </Link>
      </div>
    </Layout>
  );
}
