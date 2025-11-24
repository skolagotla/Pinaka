/**
 * Ant Design Theme Configurations
 * Multiple theme options for user customization
 */

export const AVAILABLE_THEMES = {
  DEFAULT: {
    id: 'default',
    name: 'Default',
    description: 'Clean and professional blue theme',
    config: {
      token: {
        colorPrimary: '#1890ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#1890ff',
        colorLink: '#1890ff',
        borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },

  PURPLE: {
    id: 'purple',
    name: 'Purple Elegance',
    description: 'Modern purple gradient theme',
    config: {
      token: {
        colorPrimary: '#722ed1',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#722ed1',
        colorLink: '#722ed1',
        borderRadius: 8,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },

  GREEN: {
    id: 'green',
    name: 'Nature Green',
    description: 'Fresh and energetic green theme',
    config: {
      token: {
        colorPrimary: '#52c41a',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#52c41a',
        colorLink: '#52c41a',
        borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },

  ORANGE: {
    id: 'orange',
    name: 'Sunset Orange',
    description: 'Warm and vibrant orange theme',
    config: {
      token: {
        colorPrimary: '#fa8c16',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#fa8c16',
        colorLink: '#fa8c16',
        borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },

  DARK: {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on the eyes dark theme',
    config: {
      algorithm: 'dark',
      token: {
        colorPrimary: '#1890ff',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#ff4d4f',
        colorInfo: '#1890ff',
        colorLink: '#1890ff',
        borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },

  TEAL: {
    id: 'teal',
    name: 'Teal Ocean',
    description: 'Calm and balanced teal theme',
    config: {
      token: {
        colorPrimary: '#13c2c2',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#13c2c2',
        colorLink: '#13c2c2',
        borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },

  RED: {
    id: 'red',
    name: 'Bold Red',
    description: 'Strong and confident red theme',
    config: {
      token: {
        colorPrimary: '#f5222d',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#f5222d',
        colorLink: '#f5222d',
        borderRadius: 6,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },

  GOLD: {
    id: 'gold',
    name: 'Premium Gold',
    description: 'Luxurious gold accent theme',
    config: {
      token: {
        colorPrimary: '#faad14',
        colorSuccess: '#52c41a',
        colorWarning: '#faad14',
        colorError: '#f5222d',
        colorInfo: '#faad14',
        colorLink: '#d48806',
        borderRadius: 8,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
    },
  },
};

/**
 * Get theme configuration by ID
 */
export function getThemeById(themeId) {
  const theme = Object.values(AVAILABLE_THEMES).find(t => t.id === themeId);
  return theme || AVAILABLE_THEMES.DEFAULT;
}

/**
 * Get all available themes as array
 */
export function getAllThemes() {
  return Object.values(AVAILABLE_THEMES);
}

/**
 * Get theme names for dropdown
 */
export function getThemeOptions() {
  return Object.values(AVAILABLE_THEMES).map(theme => ({
    value: theme.id,
    label: theme.name,
    description: theme.description,
  }));
}

export default AVAILABLE_THEMES;

