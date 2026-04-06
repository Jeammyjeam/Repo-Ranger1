
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={['light', 'dark', 'paper']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// NOTE: useTheme hook should now be imported directly from 'next-themes'
// in the components that need it, like ThemeSwitcher.
