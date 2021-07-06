import { headlessConfig } from '@faustjs/core';
import 'normalize.css/normalize.css';
import React from 'react';
import 'scss/main.scss';
import { AppProps } from 'next/dist/next-server/lib/router/router';

headlessConfig({
  wpUrl: process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL,
  apiClientSecret: process.env.WP_HEADLESS_SECRET,
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
