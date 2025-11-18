"use client";
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Input, Button, Tooltip } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

/**
 * Reusable SearchBar Component
 * 
 * A consistent, expandable search bar used across the application.
 * Handles expand/collapse state, click-outside detection, and search interactions.
 * 
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Called when search value changes
 * @param {Function} props.onClear - Called when search is cleared
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.width - Width of the search bar when expanded (default: 350px)
 * @param {boolean} props.autoFocus - Whether to auto-focus when expanded (default: true)
 */
function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  width = 350,
  autoFocus = true,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Auto-focus when expanded
  useEffect(() => {
    if (isExpanded && autoFocus && searchInputRef.current) {
      try {
        // Use input property if available (Ant Design Input component)
        const inputElement = searchInputRef.current.input || searchInputRef.current;
        if (inputElement && typeof inputElement.focus === 'function') {
          inputElement.focus();
        }
      } catch (error) {
        // Silently ignore focus errors (may be caused by browser extensions)
        console.debug('[SearchBar] Focus error (likely browser extension):', error);
      }
    }
  }, [isExpanded, autoFocus]);

  // Click outside handler - collapse if empty
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target) &&
        !value
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, value]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleClear = useCallback(() => {
    onClear?.();
    setIsExpanded(false);
  }, [onClear]);

  const handleChange = useCallback(
    (e) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  return (
    <div
      ref={searchContainerRef}
      style={{
        display: 'inline-flex',
        width: `${width}px`,
        justifyContent: 'flex-end',
      }}
    >
      {isExpanded ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <Input
            ref={searchInputRef}
            size="large"
            placeholder={placeholder}
            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
            value={value}
            onChange={handleChange}
            allowClear
            onClear={handleClear}
            autoComplete="off"
            data-form-type="search"
            style={{
              flex: 1,
              borderRadius: '8px',
              border: '2px solid #1890ff',
            }}
            onPressEnter={(e) => {
              try {
                e.target.blur();
              } catch (error) {
                // Silently ignore blur errors
              }
            }}
          />
          <Tooltip title="Close">
            <Button
              shape="circle"
              size="large"
              icon={<CloseOutlined />}
              onClick={handleClear}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            />
          </Tooltip>
        </div>
      ) : (
        <Tooltip title="Search">
          <Button
            shape="circle"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(SearchBar);

