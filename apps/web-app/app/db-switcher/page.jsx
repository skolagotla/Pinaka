"use client";

import { useState, useEffect } from 'react';
import { Card, Select, Button, Alert, Spinner } from 'flowbite-react';
import { HiDatabase, HiSwitchHorizontal } from 'react-icons/hi';
import { notify } from '@/lib/utils/notification-helper';

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
        notify.error(data.error || 'Failed to fetch databases');
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      setMessage({ type: 'error', text: 'Failed to fetch databases' });
      notify.error('Failed to fetch databases');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = async () => {
    if (!selectedDb || selectedDb === currentDb) {
      setMessage({ type: 'warning', text: 'Please select a different database' });
      notify.warning('Please select a different database');
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
        notify.success(data.message || 'Database switched successfully');
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
        notify.error(data.error || 'Failed to switch database');
      }
    } catch (error) {
      console.error('Error switching database:', error);
      setMessage({ type: 'error', text: 'Failed to switch database' });
      notify.error('Failed to switch database');
    } finally {
      setSwitching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen flex-col gap-4 bg-gray-50 dark:bg-gray-900">
        <Spinner size="xl" />
        <p className="text-gray-600 dark:text-gray-400">Loading databases...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <HiDatabase className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Database Switcher</h2>
        </div>

        <div className="space-y-4">
          {message.text && (
            <Alert
              color={
                message.type === 'error' ? 'failure' :
                message.type === 'warning' ? 'warning' :
                message.type === 'success' ? 'success' : 'info'
              }
              onDismiss={() => setMessage({ type: '', text: '' })}
            >
              {message.text}
            </Alert>
          )}

          <div>
            <p className="font-semibold mb-2">Current Database:</p>
            <code className="text-base px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded inline-block">
              {currentDb || 'Not set'}
            </code>
          </div>

          <div>
            <label htmlFor="database" className="block mb-2 font-semibold">
              Select Database:
            </label>
            <Select
              id="database"
              value={selectedDb}
              onChange={(e) => setSelectedDb(e.target.value)}
              className="w-full"
            >
              <option value="">Select a database</option>
              {databases.map((db) => (
                <option key={db} value={db}>
                  {db === currentDb ? '● ' : ''}{db} {db === currentDb ? '(current)' : ''}
                </option>
              ))}
            </Select>
          </div>

          <Button
            color="blue"
            onClick={handleSwitch}
            disabled={switching || !selectedDb || selectedDb === currentDb}
            className="w-full flex items-center justify-center gap-2"
          >
            {switching ? (
              <>
                <Spinner size="sm" />
                Switching...
              </>
            ) : (
              <>
                <HiSwitchHorizontal className="h-4 w-4" />
                Switch Database
              </>
            )}
          </Button>

          <Alert color="warning">
            <p className="text-sm">
              <strong>Note:</strong> Switching databases will restart the server. This may take 30-60 seconds. Please wait and refresh the page after switching.
            </p>
          </Alert>
        </div>
      </Card>
    </div>
  );
}
