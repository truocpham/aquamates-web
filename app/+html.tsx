import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { ReactNode } from 'react';

import { PRE_HYDRATION_SCRIPT } from '@/shared/preHydration';

const HIDE_LANDING_FOR_MEMBERS = `
html[data-has-session]{background-color:#F4F7FB}
html[data-has-session] [data-testid="landing"]{display:none}
@media (prefers-color-scheme:dark){html[data-has-session]{background-color:#0B0F17}}`;

/** Static HTML template: the signed-out landing is prerendered into it; the inline script runs before first paint. */
export default function Root({ children }: { children: ReactNode }) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>AquaMates</title>
        <meta name="description" content="Plan swim sessions and social nights, track who is coming and split the costs with your club." />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: HIDE_LANDING_FOR_MEMBERS }} />
        <script dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_SCRIPT }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
