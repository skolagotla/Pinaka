/**
 * GlobalSearch - Command Palette Style Global Search
 * 
 * Features:
 * - Cmd/Ctrl+K to open
 * - Real-time search across all entities
 * - Keyboard navigation
 * - Quick navigation to results
 * - Beautiful UI with icons
 */

"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, TextInput, Spinner } from 'flowbite-react';
import {
  HiSearch,
  HiHome,
  HiUser,
  HiDocumentText,
  HiCog,
  HiCurrencyDollar,
  HiClipboard,
  HiCheckCircle,
  HiChat,
  HiDocument,
  HiShoppingBag,
  HiWallet,
} from 'react-icons/hi';

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const SEARCH_CATEGORIES = {
  properties: { label: 'Properties', icon: HiHome, color: 'blue' },
  tenants: { label: 'Tenants', icon: HiUser, color: 'green' },
  landlords: { label: 'Landlords', icon: HiUser, color: 'purple' },
  leases: { label: 'Leases', icon: HiDocumentText, color: 'yellow' },
  maintenance: { label: 'Maintenance', icon: HiClipboard, color: 'red' },
  payments: { label: 'Payments', icon: HiCurrencyDollar, color: 'green' },
  documents: { label: 'Documents', icon: HiDocument, color: 'gray' },
  messages: { label: 'Messages', icon: HiChat, color: 'blue' },
};

export default function GlobalSearch({ open, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Search API endpoint
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Trigger search when query changes
  useEffect(() => {
    if (query) {
      setLoading(true);
      performSearch(query);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleResultClick(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, onClose]);

  const handleResultClick = (result) => {
    router.push(result.path);
    onClose();
  };

  const getCategoryInfo = (category) => {
    return SEARCH_CATEGORIES[category] || { label: category, icon: HiSearch, color: 'gray' };
  };

  return (
    <Modal show={open} onClose={onClose} size="2xl" className="[&>div]:bg-transparent [&>div]:shadow-none">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <TextInput
              ref={inputRef}
              type="text"
              placeholder="Search properties, tenants, leases..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <HiSearch className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No results found</p>
            </div>
          )}

          {!loading && !query && (
            <div className="p-4 text-center text-gray-500">
              <p>Start typing to search...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => {
                const categoryInfo = getCategoryInfo(result.category);
                const Icon = categoryInfo.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={result.id || index}
                    onClick={() => handleResultClick(result)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${categoryInfo.color}-100`}>
                        <Icon className={`h-5 w-5 text-${categoryInfo.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-500 truncate">{result.subtitle}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">{categoryInfo.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span>⌘K / Ctrl+K</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
