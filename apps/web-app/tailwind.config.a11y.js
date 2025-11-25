/**
 * Accessibility Tailwind Configuration
 * WCAG 2.2 AA: Enhanced color contrast and focus styles
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Enhanced contrast colors for WCAG AA compliance
        'text-primary': {
          DEFAULT: '#1f2937', // gray-800 - 4.5:1 on white
          dark: '#f9fafb', // gray-50 - 4.5:1 on gray-900
        },
        'text-secondary': {
          DEFAULT: '#374151', // gray-700 - 4.5:1 on white
          dark: '#e5e7eb', // gray-200 - 4.5:1 on gray-900
        },
        'focus-ring': {
          DEFAULT: '#3b82f6', // blue-500
          dark: '#60a5fa', // blue-400
        },
      },
      ringWidth: {
        'a11y': '2px',
      },
      ringOffsetWidth: {
        'a11y': '2px',
      },
    },
  },
  plugins: [
    // Focus visible plugin for better keyboard navigation
    function({ addUtilities }) {
      addUtilities({
        '.focus-visible-ring': {
          '&:focus-visible': {
            outline: '2px solid #3b82f6',
            outlineOffset: '2px',
          },
        },
      });
    },
  ],
};

