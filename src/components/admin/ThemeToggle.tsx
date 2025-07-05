import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'text';
  showLabels?: boolean;
}

const ThemeToggle = ({ variant = 'default', showLabels = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Açık Tema';
      case 'dark':
        return 'Koyu Tema';
      default:
        return 'Sistem Teması';
    }
  };

  const getNextThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Koyu temaya geç';
      case 'dark':
        return 'Sistem temasına geç';
      default:
        return 'Açık temaya geç';
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="h-8 w-8 p-0"
        title={getNextThemeLabel()}
      >
        {getThemeIcon()}
        <span className="sr-only">Tema değiştir</span>
      </Button>
    );
  }

  if (variant === 'text') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="h-auto p-2"
      >
        {getThemeIcon()}
        {showLabels && (
          <span className="ml-2 text-sm">
            {getThemeLabel()}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 relative"
      title={getNextThemeLabel()}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Tema değiştir</span>
    </Button>
  );
};

export default ThemeToggle;
