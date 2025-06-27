import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-2"
    >
      {theme === 'light' ? (
        <>
          <Sun className="h-4 w-4 mr-2" />
          Tema Claro
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 mr-2" />
          Tema TLF
        </>
      )}
    </Button>
  );
};
