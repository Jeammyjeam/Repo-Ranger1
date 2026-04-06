'use client';

import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';


export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, []);

  if (!mounted) {
    // Render a skeleton or null to avoid hydration mismatch
    return <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />;
  }

  const themes = [
    { id: 'light', name: 'Light', icon: <Sun className="h-4 w-4" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { id: 'paper', name: 'Paper', icon: <FileText className="h-4 w-4" /> },
  ] as const;

  function CurrentThemeIcon() {
    switch (theme) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem]" />;
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
      case 'paper':
        return <FileText className="h-[1.2rem] w-[1.2rem]" />;
      default:
        // Fallback icon, defaults to dark
        return <Moon className="h-[1.2rem] w-[1.2rem]" />;
    }
  }

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                <CurrentThemeIcon />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            {themes.map((t) => (
                <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id)}>
                    {t.icon}
                    <span className="ml-2">{t.name}</span>
                </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
