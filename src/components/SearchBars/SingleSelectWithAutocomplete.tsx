import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';

interface SingleSelectWithAutocompleteProps {
    label: string;
    fetchData: (query: string) => Promise<any[]>; // Function to fetch data based on the query
    onSelect: (selectedItem: any) => void; // Callback when an item is selected
    displayProperty: string; // Property to display in the options
    placeholder?: string; // Placeholder text
    disabled?: boolean; // Disabled state
    initialValue?: any; // Initial selected value for the input
    width?: string | number; // Optional width prop for dynamic width
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

    useImperativeHandle(ref, () => ({
        reset: () => {
            setQuery('');
            setSelectedItem(null);
            setOptions([]);
        }
    }));

    useEffect(() => {
        // Update selected item when initialValue changes
        setSelectedItem(initialValue);
    }, [initialValue]);

    useEffect(() => {
        let active = true;

        const fetchOptions = async () => {
            if (query.length >= 0) {
                setLoading(true);
                try {
                    const data = await fetchData(query);
                    if (active) {
                        setOptions(Array.isArray(data) ? data : []); // Ensure data is an array
                    }
                } catch (error) {
                    console.error('Error fetching options:', error);
                    setOptions([]); // Set options to an empty array on error
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            } else {
                setOptions([]); // Reset options when query is cleared or too short
            }
        };

        fetchOptions();

        return () => {
            active = false;
        };
    }, [query, fetchData]);

    const handleChange = (event: any, value: any) => {
        setSelectedItem(value);
        onSelect(value);
    };

    return (
        <Autocomplete
            options={options}
            getOptionLabel={(option) => option[displayProperty]}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => setQuery(newInputValue)}
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
