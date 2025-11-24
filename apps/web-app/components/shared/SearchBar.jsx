"use client";
import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { TextInput, Button, Tooltip } from 'flowbite-react';
import { HiSearch, HiX } from 'react-icons/hi';

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
        // Flowbite TextInput uses native input element
        const inputElement = searchInputRef.current;
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
        <div className="flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch className="h-5 w-5 text-blue-600" />
            </div>
            <TextInput
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={handleChange}
              autoComplete="off"
              data-form-type="search"
              className="pl-10 border-2 border-blue-600 rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  try {
                    e.target.blur();
                  } catch (error) {
                    // Silently ignore blur errors
                  }
                }
              }}
            />
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-5 w-5" />
              </button>
            )}
          </div>
          <Tooltip content="Close">
            <Button
              size="lg"
              color="gray"
              onClick={handleClear}
              className="flex items-center justify-center flex-shrink-0 rounded-full p-2"
            >
              <HiX className="h-5 w-5" />
            </Button>
          </Tooltip>
        </div>
      ) : (
        <Tooltip content="Search">
          <Button
            size="lg"
            color="gray"
            onClick={handleToggle}
            className="flex items-center justify-center rounded-full p-2"
          >
            <HiSearch className="h-5 w-5" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(SearchBar);

