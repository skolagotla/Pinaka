"use client";

import { useState, useEffect } from 'react';
import { Card, Select, Button, Alert, Space, Typography, Spin } from 'antd';
import { DatabaseOutlined, SwapOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export default function DatabaseSwitcherPage() {
  const [databases, setDatabases] = useState([]);
  const [currentDb, setCurrentDb] = useState('');
  const [selectedDb, setSelectedDb] = useState('');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/db-switcher/list');
      const data = await response.json();
      
      if (data.success) {
        setDatabases(data.data.databases || []);
        setCurrentDb(data.data.current || '');
        setSelectedDb(data.data.current || '');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch databases' });
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      setMessage({ type: 'error', text: 'Failed to fetch databases' });
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async () => {
    if (!selectedDb || selectedDb === currentDb) {
      setMessage({ type: 'warning', text: 'Please select a different database' });
      return;
    }

    try {
      setSwitching(true);
      setMessage({ type: 'info', text: 'Switching database and restarting server...' });
      
      const response = await fetch('/api/db-switcher/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dbName: selectedDb }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Database switched successfully. Server is restarting...' 
        });
        setCurrentDb(selectedDb);
        
        // Show info about restart
        setTimeout(() => {
          setMessage({ 
            type: 'info', 
            text: 'Please wait 30-60 seconds for the server to restart, then refresh this page.' 
          });
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to switch database' });
      }
    } catch (error) {
      console.error('Error switching database:', error);
      setMessage({ type: 'error', text: 'Failed to switch database' });
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 16,
        backgroundColor: '#f5f5f5'
      }}>
        <Spin size="large" />
        <Text>Loading databases...</Text>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '24px',
      backgroundColor: '#f5f5f5'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        title={
          <Space>
            <DatabaseOutlined />
            <span>Database Switcher</span>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {message.text && (
            <Alert
              message={message.text}
              type={message.type}
              showIcon
              closable
              onClose={() => setMessage({ type: '', text: '' })}
            />
          )}

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Current Database:
            </Text>
            <Text code style={{ fontSize: '16px', padding: '8px 12px', display: 'inline-block', backgroundColor: '#f0f0f0' }}>
              {currentDb || 'Not set'}
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Select Database:
            </Text>
            <Select
              value={selectedDb}
              onChange={setSelectedDb}
              style={{ width: '100%' }}
              placeholder="Select a database"
              size="large"
            >
              {databases.map((db) => (
                <Option key={db} value={db}>
                  <Space>
                    {db === currentDb && <span style={{ color: '#52c41a' }}>●</span>}
                    <span>{db}</span>
                    {db === currentDb && <Text type="secondary">(current)</Text>}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={handleSwitch}
            loading={switching}
            disabled={!selectedDb || selectedDb === currentDb}
            block
            size="large"
          >
            Switch Database
          </Button>

          <Alert
            message="Note"
            description="Switching databases will restart the server. This may take 30-60 seconds. Please wait and refresh the page after switching."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </Space>
      </Card>
    </div>
  );
}

