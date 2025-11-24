"use client";
import { useState, useEffect } from 'react';
import { Card, Spinner } from 'flowbite-react';
import { HiCheckCircle } from 'react-icons/hi';
import { useTheme } from '@/lib/hooks';

export default function ThemeSelector({ currentTheme, onThemeChange }) {
  const { availableThemes, changeTheme, loading: themeLoading } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'default');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedTheme(currentTheme || 'default');
  }, [currentTheme]);

  const handleThemeSelect = async (themeId) => {
    setSelectedTheme(themeId);
    setSaving(true);
    
    const success = await changeTheme(themeId);
    
    if (!success) {
      setSelectedTheme(currentTheme); // Revert on error
    }
    
    setSaving(false);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableThemes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const primaryColor = theme.config.token?.colorPrimary || '#3b82f6';

          return (
            <Card
              key={theme.id}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                isSelected ? 'border-2' : 'border'
              }`}
              style={{
                borderColor: isSelected ? primaryColor : undefined,
                backgroundColor: theme.id === 'dark' ? '#141414' : '#ffffff',
              }}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <div className="flex flex-col gap-2">
                {/* Theme Preview */}
                <div
                  className="w-full h-16 rounded-lg flex items-center justify-center relative mb-2"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}aa 100%)`,
                  }}
                >
                  {isSelected && (
                    <HiCheckCircle 
                      className="h-8 w-8 text-white absolute"
                    />
                  )}
                </div>

                {/* Theme Name */}
                <div className="font-semibold text-sm" style={{
                  color: theme.id === 'dark' ? '#ffffff' : '#000000',
                }}>
                  {theme.name}
                </div>

                {/* Theme Description */}
                <div className="text-xs" style={{
                  color: theme.id === 'dark' ? '#a0a0a0' : '#666666',
                }}>
                  {theme.description}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {saving && (
        <div className="text-center mt-5 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Spinner size="sm" className="mr-2" />
          <span className="text-sm">Applying theme...</span>
        </div>
      )}
    </div>
  );
}
