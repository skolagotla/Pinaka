'use client';

// Ant Design Pro Theme Configuration for Pinaka Property Management
// Enhanced with Pro Design System standards
const antdTheme = {
  token: {
    // Primary Colors - Ant Design Pro Standard
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Layout & Spacing - Pro Design System
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    
    // Typography - Pro Design System
    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    lineHeight: 1.5715,
    lineHeightHeading1: 1.2105,
    lineHeightHeading2: 1.2667,
    lineHeightHeading3: 1.3333,
    
    // Component Heights - Pro Design System
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    controlHeightXS: 24,
    
    // Shadows - Pro Design System
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.1)',
    boxShadowTertiary: '0 6px 16px rgba(0,0,0,0.12)',
    
    // Background Colors - Pro Design System
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorBgSpotlight: '#fafafa',
    
    // Text Colors - Pro Design System
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextTertiary: 'rgba(0, 0, 0, 0.45)',
    colorTextQuaternary: 'rgba(0, 0, 0, 0.25)',
    
    // Border Colors - Pro Design System
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
  },
  
  components: {
    // ProCard Styling
    Card: {
      borderRadiusLG: 12,
      boxShadowTertiary: '0 2px 8px rgba(0,0,0,0.08)',
      paddingLG: 24,
      headerBg: '#fafafa',
    },
    // ProTable Styling
    Table: {
      borderRadius: 8,
      headerBg: '#fafafa',
      headerColor: 'rgba(0, 0, 0, 0.88)',
      headerSplitColor: 'rgba(0, 0, 0, 0.06)',
      rowHoverBg: '#fafafa',
      borderColor: '#f0f0f0',
    },
    // ProForm Styling
    Form: {
      labelColor: 'rgba(0, 0, 0, 0.88)',
      labelFontSize: 14,
      itemMarginBottom: 24,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingInline: 12,
      paddingBlock: 8,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      fontSize: 14,
      fontWeight: 500,
      paddingInline: 16,
      paddingBlock: 8,
    },
    Modal: {
      borderRadiusLG: 12,
      paddingContentHorizontal: 24,
      paddingContentVertical: 20,
    },
    Drawer: {
      borderRadiusLG: 12,
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 24,
    },
    // ProLayout Styling
    Layout: {
      bodyBg: '#f0f2f5',
      headerBg: '#ffffff',
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: '#ffffff',
    },
  },
};

export default antdTheme;

