import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useThemeStore } from '../store/themeStore';

interface ThemeToggleProps {
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const ThemeToggle = ({ variant = 'ghost', size = 'sm' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
};
