'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-lg">
        <div className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative rounded-lg overflow-hidden group"
    >
      {/* Sun icon for light mode */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
      
      {/* Moon icon for dark mode */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
      
      {/* Animated background glow */}
      <span className="absolute inset-0 rounded-lg bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-yellow-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-purple-500/20" />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

