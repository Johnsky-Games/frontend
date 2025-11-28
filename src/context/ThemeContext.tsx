import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  businessTheme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    theme_mode: string;
  } | null;
  toggleTheme: () => void;
  setBusinessTheme: (theme: any) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Initialize state from localStorage or system preference to avoid overwriting on mount
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        return savedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });
  const [businessTheme, setBusinessThemeState] = useState<any>(null);

  // Removed redundant useEffect that was causing the race condition

  // Load business theme from localStorage
  useEffect(() => {
    const savedBusinessTheme = localStorage.getItem('businessTheme');
    if (savedBusinessTheme) {
      try {
        setBusinessThemeState(JSON.parse(savedBusinessTheme));
      } catch (error) {
        console.error('Error loading business theme:', error);
      }
    }
  }, []);

  // Listen for business theme updates from AuthContext
  useEffect(() => {
    const handleThemeUpdate = () => {
      const savedBusinessTheme = localStorage.getItem('businessTheme');
      if (savedBusinessTheme) {
        try {
          setBusinessThemeState(JSON.parse(savedBusinessTheme));
        } catch (error) {
          console.error('Error loading business theme:', error);
        }
      }
    };

    window.addEventListener('business-theme-updated', handleThemeUpdate);
    return () => {
      window.removeEventListener('business-theme-updated', handleThemeUpdate);
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Helper to convert hex to space-separated rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : null;
  };

  // Helper to mix color with white (tint) or black (shade)
  // factor: 0-1 (0 = original color, 1 = white/black)
  const mixColor = (color: string, type: 'tint' | 'shade', factor: number) => {
    const [r, g, b] = color.split(' ').map(Number);
    if (type === 'tint') {
      return `${Math.round(r + (255 - r) * factor)} ${Math.round(g + (255 - g) * factor)} ${Math.round(b + (255 - b) * factor)}`;
    } else {
      return `${Math.round(r * (1 - factor))} ${Math.round(g * (1 - factor))} ${Math.round(b * (1 - factor))}`;
    }
  };

  // Apply business theme colors to CSS variables
  useEffect(() => {
    if (businessTheme) {
      const primary = hexToRgb(businessTheme.primary_color);
      const secondary = hexToRgb(businessTheme.secondary_color);
      const accent = hexToRgb(businessTheme.accent_color);

      if (primary) {
        document.documentElement.style.setProperty('--color-primary-500', primary);

        // Generate shades
        document.documentElement.style.setProperty('--color-primary-50', mixColor(primary, 'tint', 0.9));
        document.documentElement.style.setProperty('--color-primary-100', mixColor(primary, 'tint', 0.8));
        document.documentElement.style.setProperty('--color-primary-200', mixColor(primary, 'tint', 0.6));
        document.documentElement.style.setProperty('--color-primary-300', mixColor(primary, 'tint', 0.4));
        document.documentElement.style.setProperty('--color-primary-400', mixColor(primary, 'tint', 0.2));

        document.documentElement.style.setProperty('--color-primary-600', mixColor(primary, 'shade', 0.1));
        document.documentElement.style.setProperty('--color-primary-700', mixColor(primary, 'shade', 0.2));
        document.documentElement.style.setProperty('--color-primary-800', mixColor(primary, 'shade', 0.3));
        document.documentElement.style.setProperty('--color-primary-900', mixColor(primary, 'shade', 0.4));
      }

      if (secondary) {
        document.documentElement.style.setProperty('--color-secondary-500', secondary);
        // Generate minimal shades for secondary if needed
        document.documentElement.style.setProperty('--color-secondary-50', mixColor(secondary, 'tint', 0.9));
        document.documentElement.style.setProperty('--color-secondary-100', mixColor(secondary, 'tint', 0.8));
        document.documentElement.style.setProperty('--color-secondary-600', mixColor(secondary, 'shade', 0.1));
        document.documentElement.style.setProperty('--color-secondary-700', mixColor(secondary, 'shade', 0.2));
      }

      if (accent) {
        document.documentElement.style.setProperty('--color-accent-500', accent);
        document.documentElement.style.setProperty('--color-accent-50', mixColor(accent, 'tint', 0.9));
        document.documentElement.style.setProperty('--color-accent-100', mixColor(accent, 'tint', 0.8));
        document.documentElement.style.setProperty('--color-accent-600', mixColor(accent, 'shade', 0.1));
        document.documentElement.style.setProperty('--color-accent-700', mixColor(accent, 'shade', 0.2));
        document.documentElement.style.setProperty('--color-accent-800', mixColor(accent, 'shade', 0.3));
        document.documentElement.style.setProperty('--color-accent-900', mixColor(accent, 'shade', 0.4));
      }
    } else {
      // Reset to default colors (Indigo RGB values)
      document.documentElement.style.setProperty('--color-primary-500', '99 102 241');
      document.documentElement.style.setProperty('--color-secondary-500', '236 72 153');
      document.documentElement.style.setProperty('--color-accent-500', '245 158 11');

      // Reset shades to defaults (approximate Indigo shades)
      document.documentElement.style.setProperty('--color-primary-50', '238 242 255');
      document.documentElement.style.setProperty('--color-primary-100', '224 231 255');
      document.documentElement.style.setProperty('--color-primary-600', '79 70 229');
      document.documentElement.style.setProperty('--color-primary-700', '67 56 202');
    }
  }, [businessTheme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setBusinessTheme = (theme: any) => {
    setBusinessThemeState(theme);
    if (theme) {
      localStorage.setItem('businessTheme', JSON.stringify({
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        accent_color: theme.accent_color,
        theme_mode: theme.theme_mode
      }));
    } else {
      localStorage.removeItem('businessTheme');
    }
  };

  const value = {
    theme,
    businessTheme,
    toggleTheme,
    setBusinessTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};