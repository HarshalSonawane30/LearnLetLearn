import { useEffect, useState } from 'react';

/**
 * Custom hook for debounced values
 * Delays state updates by specified duration (default 300ms)
 *
 * Usage:
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearch = useDebounce(searchInput, 300);
 *
 * useEffect(() => {
 *   // This runs 300ms after user stops typing
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay completes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
