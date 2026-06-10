import { Plus_Jakarta_Sans, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import PageLoader from '../components/PageLoader';
import { ThemeProvider } from '../context/ThemeContext';
import usePageLoader from '../hooks/usePageLoader';
import '../styles/globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap'
});

function AppContent({ Component, pageProps }) {
  const isLoading = usePageLoader();

  return (
    <>
      <PageLoader active={isLoading} />
      <Component {...pageProps} />
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <div className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-message',
            duration: 3500
          }}
        />
        <AppContent Component={Component} pageProps={pageProps} />
      </div>
    </ThemeProvider>
  );
}
