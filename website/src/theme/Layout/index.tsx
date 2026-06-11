import { type ComponentProps, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import OriginalLayout from '@theme-original/Layout';

type LayoutProps = ComponentProps<typeof OriginalLayout>;

function useOnRouteChange(callback: () => void) {
  const location = useLocation();

  useEffect(() => {
    callback(); // Runs every time the route changes
  }, [location.pathname]);
}

export default function Layout(props: LayoutProps) {
  useOnRouteChange(() => {
    const adElement = document.querySelector('ins.adsbygoogle');

    if (adElement && adElement.getAttribute('data-ad-status') !== 'filled') {
      try {
        // @ts-expect-error: adsbygoogle is not defined on the window object in standard types
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense push error:', e);
      }
    }
  });

  return <OriginalLayout {...props} />;
}
