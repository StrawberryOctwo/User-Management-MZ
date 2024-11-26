import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';

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
    const [selectedItem, setSelectedItem] = useState<any | null>(initialValue);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setQuery('');
        setSelectedItem(null);
        setOptions([]);
      }
    }));

    useEffect(() => {
      setSelectedItem(initialValue);
    }, [initialValue]);

    useEffect(() => {
      let active = true;

      const fetchOptions = async () => {
        if (focused) {
          setLoading(true);
          try {
            const data = await fetchData(query);
            if (active) {
              setOptions(Array.isArray(data) ? data : []);
            }
          } catch (error) {
            console.error('Error fetching options:', error);
            setOptions([]);
          } finally {
            if (active) {
              setLoading(false);
            }
          }
        }
      };

      fetchOptions();

      return () => {
        active = false;
      };
    }, [focused, query, fetchData]);

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    const handleChange = (event: any, value: any) => {
      setSelectedItem(value);
      onSelect(value);
    };

    return (
      <Autocomplete
        options={options}
        getOptionLabel={(option) => option[displayProperty] || ''}
        onChange={handleChange}
        onInputChange={(event, newInputValue) => setQuery(newInputValue)}
        loading={loading}
        value={selectedItem}
        isOptionEqualToValue={(option, value) =>
          option[displayProperty] === value[displayProperty]
        }
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
