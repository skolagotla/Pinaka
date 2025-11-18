"use client";
import { useState, useEffect } from 'react';
import { Card, Radio, Row, Col, Spin } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
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
      <Radio.Group 
        value={selectedTheme} 
        onChange={(e) => handleThemeSelect(e.target.value)}
        style={{ width: '100%' }}
      >
        <Row gutter={[16, 16]}>
          {availableThemes.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            const primaryColor = theme.config.token.colorPrimary;

            return (
              <Col key={theme.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{
                    border: isSelected ? `3px solid ${primaryColor}` : '1px solid #d9d9d9',
                    borderRadius: '12px',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    backgroundColor: theme.id === 'dark' ? '#141414' : '#ffffff',
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Radio value={theme.id} style={{ width: '100%' }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px',
                      color: theme.id === 'dark' ? '#ffffff' : '#000000',
                    }}>
                      {/* Theme Preview */}
                      <div
                        style={{
                          width: '100%',
                          height: '60px',
                          borderRadius: '8px',
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}aa 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '8px',
                          position: 'relative',
                        }}
                      >
                        {isSelected && (
                          <CheckCircleOutlined 
                            style={{ 
                              fontSize: '32px', 
                              color: '#ffffff',
                              position: 'absolute',
                            }} 
                          />
                        )}
                      </div>

                      {/* Theme Name */}
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {theme.name}
                      </div>

                      {/* Theme Description */}
                      <div style={{ 
                        fontSize: '12px', 
                        color: theme.id === 'dark' ? '#a0a0a0' : '#666666',
                        lineHeight: '1.4',
                      }}>
                        {theme.description}
                      </div>
                    </div>
                  </Radio>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Radio.Group>

      {saving && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          padding: '12px',
          background: '#e6f7ff',
          borderRadius: '8px',
        }}>
          <Spin /> <span style={{ marginLeft: '8px' }}>Applying theme...</span>
        </div>
      )}
    </div>
  );
}

