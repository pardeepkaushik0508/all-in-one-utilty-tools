import Link from 'next/link';

function ErrorPage({ statusCode }) {
  return (
    <div className="page-shell flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-bold text-heading">{statusCode || 'Error'}</p>
      <h1 className="mt-4 font-display text-xl font-semibold text-heading">
        {statusCode === 404 ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        {statusCode === 404
          ? 'The page you requested does not exist.'
          : 'Try refreshing the page. If the problem continues, restart the dev server.'}
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
