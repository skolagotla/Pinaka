"use client";
import { useState, useEffect } from 'react';
import { Drawer, Button, Table, Tag, Space, Input, Select, Typography, Tooltip } from 'antd';
import {
  BugOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilterOutlined,
  EyeOutlined,
} from '@ant-design/icons';
const logger = require('@/lib/logger');

const { Search } = Input;
const { Title, Text } = Typography;

export default function LogViewer() {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  const refreshLogs = () => {
    const allLogs = logger.getLogs();
    setLogs(allLogs);
    applyFilters(allLogs, levelFilter, categoryFilter, searchText);
  };

  const applyFilters = (logData, level, category, search) => {
    let filtered = logData;

    if (level !== 'ALL') {
      filtered = filtered.filter(log => log.level === level);
    }

    if (category !== 'ALL') {
      filtered = filtered.filter(log => log.category === category);
    }

    if (search) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(log.data).toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    if (visible) {
      refreshLogs();
      // Refresh every 2 seconds while drawer is open
      const interval = setInterval(refreshLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [visible, levelFilter, categoryFilter, searchText]);

  const handleLevelFilterChange = (value) => {
    setLevelFilter(value);
    applyFilters(logs, value, categoryFilter, searchText);
  };

  const handleCategoryFilterChange = (value) => {
    setCategoryFilter(value);
    applyFilters(logs, levelFilter, value, searchText);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    applyFilters(logs, levelFilter, categoryFilter, value);
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 100,
      render: (time) => new Date(time).toLocaleTimeString(),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level) => {
        const colors = {
          INFO: 'blue',
          ACTION: 'green',
          WARN: 'orange',
          ERROR: 'red',
        };
        return <Tag color={colors[level] || 'default'}>{level}</Tag>;
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => <Tag>{category}</Tag>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      width: 80,
      render: (data) => {
        const hasData = data && Object.keys(data).length > 0;
        return hasData ? (
          <Tooltip title={<pre style={{ fontSize: 10 }}>{JSON.stringify(data, null, 2)}</pre>}>
            <EyeOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
          </Tooltip>
        ) : null;
      },
    },
  ];

  return (
    <>
      {/* Floating Log Button */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        <Tooltip title="View Application Logs">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<BugOutlined />}
            onClick={() => setVisible(true)}
            style={{
              width: 56,
              height: 56,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          />
        </Tooltip>
      </div>

      {/* Log Viewer Drawer */}
      <Drawer
        title={
          <Space>
            <BugOutlined />
            <span>Application Logs</span>
            <Tag color="blue">{filteredLogs.length} logs</Tag>
          </Space>
        }
        placement="right"
        width="80%"
        open={visible}
        onClose={() => setVisible(false)}
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => logger.downloadLogs()}
            >
              Download
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                logger.clearLogs();
                refreshLogs();
              }}
            >
              Clear
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Space style={{ width: '100%' }}>
            <FilterOutlined />
            <Select
              value={levelFilter}
              onChange={handleLevelFilterChange}
              style={{ width: 120 }}
              options={[
                { label: 'All Levels', value: 'ALL' },
                { label: 'Info', value: 'INFO' },
                { label: 'Action', value: 'ACTION' },
                { label: 'Warning', value: 'WARN' },
                { label: 'Error', value: 'ERROR' },
              ]}
            />
            <Select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              style={{ width: 150 }}
              options={[
                { label: 'All Categories', value: 'ALL' },
                { label: 'User Actions', value: 'user' },
                { label: 'Navigation', value: 'navigation' },
                { label: 'API Calls', value: 'api' },
                { label: 'Forms', value: 'form' },
                { label: 'Modals', value: 'modal' },
                { label: 'State', value: 'state' },
                { label: 'Errors', value: 'error' },
              ]}
            />
            <Search
              placeholder="Search logs..."
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ flex: 1 }}
            />
          </Space>

          <Text type="secondary">
            Logs refresh automatically every 2 seconds. Access full logger via <code>window.__appLogger</code> in console.
          </Text>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredLogs.slice().reverse().map((log, index) => ({ ...log, _id: `${log.timestamp}-${index}` }))} // Newest first with unique ID
          rowKey="_id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} logs`,
          }}
          size="small"
          scroll={{ x: true }}
        />
      </Drawer>
    </>
  );
}

