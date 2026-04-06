
'use client';

import * as React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}

// NOTE: Temporarily disabled next-themes to fix SSR localStorage issues
// TODO: Re-enable theme switching once SSR issues are resolved

// NOTE: useTheme hook should now be imported directly from 'next-themes'
// in the components that need it, like ThemeSwitcher.
