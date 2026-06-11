import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en" data-theme="light">
      <Head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #initial-loader{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#fff;transition:opacity .35s ease,visibility .35s ease}
              html[data-theme='dark'] #initial-loader{background:#000}
              #initial-loader.initial-loader--hide{opacity:0;visibility:hidden;pointer-events:none}
              .initial-loader-card{display:flex;flex-direction:column;align-items:center;gap:1rem}
              .initial-loader-spinner{width:2.5rem;height:2.5rem;border-radius:9999px;border:3px solid rgba(109,40,217,.15);border-top-color:#6d28d9;animation:initialSpin .7s linear infinite}
              html[data-theme='dark'] .initial-loader-spinner{border-color:rgba(167,139,250,.15);border-top-color:#a78bfa}
              .initial-loader-text{font-family:system-ui,sans-serif;font-size:1.125rem;font-weight:700;color:#0a0a0a}
              html[data-theme='dark'] .initial-loader-text{color:#fff}
              .initial-loader-text span{background:linear-gradient(135deg,#6d28d9,#0891b2);-webkit-background-clip:text;background-clip:text;color:transparent}
              @keyframes initialSpin{to{transform:rotate(360deg)}}
            `
          }}
        />
        {/* Google AdSense — loads in <head> on every page */}
        <meta name="google-adsense-account" content="ca-pub-5397189085296638" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5397189085296638"
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){}})();`
          }}
        />
        <div id="initial-loader" className="initial-loader" aria-hidden="true">
          <div className="initial-loader-card">
            <div className="initial-loader-spinner" />
            <p className="initial-loader-text">
              Utility<span>Tools</span>
            </p>
          </div>
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
