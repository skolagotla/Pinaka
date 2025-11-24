"use client";
import { useState, useEffect } from 'react';
import { Drawer, Button, Table, Badge, TextInput, Select, Spinner } from 'flowbite-react';
import {
  HiBug,
  HiDownload,
  HiTrash,
  HiFilter,
  HiEye,
} from 'react-icons/hi';
const logger = require('@/lib/logger');

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

  const getLevelColor = (level) => {
    const colors = {
      INFO: 'blue',
      ACTION: 'green',
      WARN: 'yellow',
      ERROR: 'red',
    };
    return colors[level] || 'gray';
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time) => new Date(time).toLocaleTimeString(),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Badge color={getLevelColor(level)}>{level}</Badge>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <span className="text-sm">{category || 'N/A'}</span>,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (message) => <span className="text-sm">{message}</span>,
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      render: (data) => (
        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded max-w-xs overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      ),
    },
  ];

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      refreshLogs();
    }
  };

  const uniqueCategories = [...new Set(logs.map(log => log.category))].filter(Boolean);

  return (
    <>
      <Button
        color="light"
        onClick={() => setVisible(true)}
        className="flex items-center gap-2"
      >
        <HiBug className="h-4 w-4" />
        View Logs
      </Button>

      <Drawer
        open={visible}
        onClose={() => setVisible(false)}
        title={
          <div className="flex items-center gap-2">
            <HiBug className="h-5 w-5" />
            <span>Application Logs</span>
          </div>
        }
        position="right"
        size="xl"
      >
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <TextInput
              icon={HiFilter}
              placeholder="Search logs..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 min-w-[200px]"
            />
            <Select
              value={levelFilter}
              onChange={(e) => handleLevelFilterChange(e.target.value)}
              className="w-32"
            >
              <option value="ALL">All Levels</option>
              <option value="INFO">Info</option>
              <option value="ACTION">Action</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
            </Select>
            <Select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              className="w-40"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
            <Button color="light" onClick={exportLogs} className="flex items-center gap-2">
              <HiDownload className="h-4 w-4" />
              Export
            </Button>
            <Button color="failure" onClick={clearLogs} className="flex items-center gap-2">
              <HiTrash className="h-4 w-4" />
              Clear
            </Button>
          </div>

          {/* Logs Table */}
          <div className="overflow-auto max-h-[calc(100vh-200px)]">
            <Table>
              <Table.Head>
                {columns.map(col => (
                  <Table.HeadCell key={col.key}>{col.title}</Table.HeadCell>
                ))}
              </Table.Head>
              <Table.Body>
                {filteredLogs.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={columns.length} className="text-center py-8">
                      <p className="text-gray-500">No logs found</p>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filteredLogs.map((log, index) => (
                    <Table.Row key={index}>
                      {columns.map(col => (
                        <Table.Cell key={col.key}>
                          {col.render ? col.render(log[col.dataIndex], log, index) : log[col.dataIndex]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </Drawer>
    </>
  );
}
