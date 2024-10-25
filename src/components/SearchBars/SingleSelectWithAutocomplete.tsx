import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';

interface SingleSelectWithAutocompleteProps {
    label: string;
    fetchData: (query?: string) => Promise<any[]>; // Make query optional to fetch default data
    onSelect: (selectedItem: any) => void;
    displayProperty: string;
    placeholder?: string;
    disabled?: boolean;
    initialValue?: any;
    width?: string | number;
}

const SingleSelectWithAutocomplete = forwardRef(({
    label,
    fetchData,
    onSelect,
    displayProperty,
    placeholder = 'Select...',
    disabled = false,
    initialValue = null,
    width = '95%',
}: SingleSelectWithAutocompleteProps, ref) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<any[]>([]);
    const [selectedItem, setSelectedItem] = useState<any | null>(initialValue);
    const [loading, setLoading] = useState(false);

    // Debounce function to limit the frequency of API calls
    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Fetch options when the query changes with debounce
    const fetchOptions = useCallback(
        debounce(async (query: string) => {
            setLoading(true);
            try {
                const data = await fetchData(query);
                setOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching options:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300),
        [fetchData] // Dependencies
    );

    // Fetch default data when the input is focused
    const handleInputFocus = async () => {
        if (options.length === 0) { // Avoid unnecessary fetches
            setLoading(true);
            try {
                const data = await fetchData(); // Fetch default data without query
                setOptions(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching default options:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        setSelectedItem(initialValue); // Sync selected item with the initial value
    }, [initialValue]);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setQuery('');
            setSelectedItem(null);
            setOptions([]);
        }
    }));

    const handleInputChange = (event: any, newInputValue: string) => {
        setQuery(newInputValue);
        fetchOptions(newInputValue); // Call the debounced fetch function
    };

    const handleChange = (event: any, value: any) => {
        setSelectedItem(value);
        onSelect(value);
    };

    return (
        <Autocomplete
            options={options}
            getOptionLabel={(option) => option[displayProperty]}
            onChange={handleChange}
            onInputChange={handleInputChange}
            onFocus={handleInputFocus} // Fetch default data on input focus
            loading={loading}
            value={selectedItem}
            isOptionEqualToValue={(option, value) => option[displayProperty] === value[displayProperty]}
            disabled={disabled}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
            style={{ width }}
        />
    );
});

export default SingleSelectWithAutocomplete;
