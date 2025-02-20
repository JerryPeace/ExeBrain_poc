'use client';

import React, {ReactNode} from 'react';
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import theme from '@/app/styles/theme';
import QueryProvider from '@/providers/QueryProvider';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={false}>
      <body className={roboto.variable}>
        <QueryProvider>
          <AppRouterCacheProvider>
              <ThemeProvider theme={theme}>
                {children}
              </ThemeProvider>
          </AppRouterCacheProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
