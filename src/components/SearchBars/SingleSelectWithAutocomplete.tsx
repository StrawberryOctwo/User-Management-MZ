import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback
} from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';
import { t } from "i18next"

interface SingleSelectWithAutocompleteProps {
  label: string;
  fetchData: (query: string) => Promise<any[]>;
  onSelect: (selectedItem: any) => void;
  displayProperty: string;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: any;
  width?: string | number;
}

const SingleSelectWithAutocomplete = forwardRef(
  (
    {
      label,
      fetchData,
      onSelect,
      displayProperty,
      placeholder = 'Select...',
      disabled = false,
      initialValue = null,
      width = '95%'
    }: SingleSelectWithAutocompleteProps,
    ref
  ) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<any[]>([]);
    const [initialOptions, setInitialOptions] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(initialValue);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [shouldFetch, setShouldFetch] = useState(true);
    const [isSelecting, setIsSelecting] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setQuery('');
        setSelectedItem(null);
        setOptions(initialOptions);
        setShouldFetch(true);
      }
    }));

    const fetchOptions = useCallback(async () => {
      if (!shouldFetch || isSelecting) return;

      setLoading(true);
      try {
        const data = await fetchData(query);
        const newOptions = Array.isArray(data) ? data : [];

        // Ensure selected item remains in options
        if (selectedItem && !newOptions.some(option => option.id === selectedItem.id)) {
          newOptions.push(selectedItem);
        }

        setOptions(newOptions);

        // If this is the initial load, save the data
        if (options.length === 0 && query === '') {
          setInitialOptions(newOptions);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
        setShouldFetch(false);
      }
    }, [query, selectedItem, fetchData, shouldFetch, options.length, isSelecting]);

    // Initial load
    useEffect(() => {
      if (options.length === 0) {
        fetchOptions();
      }
    }, []);

    // Handle search with debounce
    useEffect(() => {
      if (!focused || isSelecting) return;

      if (query.length === 0) {
        setOptions(initialOptions);
        return;
      }

      if (query.length < 2) return;

      const timeoutId = setTimeout(() => {
        setShouldFetch(true);
        fetchOptions();
      }, 300);

      return () => clearTimeout(timeoutId);
    }, [query, focused, initialOptions, isSelecting]);

    // Handle initial value changes
    useEffect(() => {
      setSelectedItem(initialValue);
      if (initialValue && options.length > 0) {
        setOptions(prevOptions => {
          if (!prevOptions.some(option => option.id === initialValue.id)) {
            return [...prevOptions, initialValue];
          }
          return prevOptions;
        });
      }
    }, [initialValue]);

    const handleFocus = () => setFocused(true);
    const handleBlur = () => {
      setFocused(false);
      setQuery('');
      setOptions(initialOptions);
    };

    const handleChange = (event: any, value: any) => {
      setIsSelecting(true);
      setSelectedItem(value);
      onSelect(value);
      // Reset after a short delay to allow the selection to complete
      setTimeout(() => {
        setIsSelecting(false);
      }, 100);
    };

    return (
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option?.[displayProperty] || ''}
        onChange={handleChange}
        onInputChange={(event, newInputValue, reason) => {
          // Only update query if not selecting an option
          if (reason !== 'reset' && !isSelecting) {
            setQuery(newInputValue);
            if (newInputValue.length >= 0) {
              setShouldFetch(true);
            }
          }
        }}
        loading={loading}
        value={selectedItem}
        isOptionEqualToValue={(option, value) => option?.id === value?.id}
        disabled={disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
        style={{ width }}
      />
    );
  }
);

export default SingleSelectWithAutocomplete;