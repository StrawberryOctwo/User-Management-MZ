import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Checkbox, TextField, Autocomplete, CircularProgress } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface MultiSelectWithCheckboxesProps {
    label: string;
    fetchData: (query: string) => Promise<any[]>; // Function to fetch data based on the query
    onSelect: (selectedItems: any[]) => void; // Callback when items are selected
    displayProperty: string; // Property to display in the options
    placeholder?: string; // Placeholder text
    initialValue?: any[]; // Initial selected values for edit or pre-filled forms
    width?: string | number;
    disabled?: boolean;
}

const MultiSelectWithCheckboxes = forwardRef(({
    label,
    fetchData,
    onSelect,
    displayProperty,
    placeholder = 'Select...',
    initialValue = [],
    width = '95%',
    disabled = false
}: MultiSelectWithCheckboxesProps, ref) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<any[]>(initialValue || []);
    const [selectedItems, setSelectedItems] = useState<any[]>(initialValue || []);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false); // Track focus state

    useImperativeHandle(ref, () => ({
        reset: () => {
            setQuery('');
            setSelectedItems([]);
            setOptions([]);
        },
        selectedItems, // Expose selectedItems
    }));

    useEffect(() => {
        if (initialValue.length > 0) {
            setOptions(initialValue);
            setSelectedItems(initialValue);
        }
    }, [initialValue]);

    useEffect(() => {
        let active = true;

        const fetchOptions = async () => {
            if (focused && !disabled) {
                setLoading(true);
                try {
                    const data = await fetchData(query);
                    if (active) {
                        const mergedOptions = [
                            ...selectedItems,
                            ...data.filter(item => !selectedItems.some(selected => selected.id === item.id)),
                        ];
                        setOptions(mergedOptions);
                    }
                } catch (error) {
                    console.error('Error fetching options:', error);
                } finally {
                    if (active) {
                        setLoading(false);
                    }
                }
            }
        };

        if (query.length >= 2 || query === '') {
            fetchOptions();
        }

        return () => {
            active = false;
        };
    }, [focused, query, fetchData, selectedItems, disabled]);

    const handleFocus = () => setFocused(true); // Set focus state
    const handleBlur = () => setFocused(false); // Reset focus state on blur

    const handleChange = (event: any, value: any[]) => {
        setSelectedItems(value);
        onSelect(value);
    };

    const getNestedProperty = (option: any, path: string) =>
        path.split('.').reduce((acc, part) => acc && acc[part], option);

    return (
        <Autocomplete
            multiple
            value={selectedItems}
            options={options}
            disableCloseOnSelect
            getOptionLabel={(option) => getNestedProperty(option, displayProperty) || ''}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => setQuery(newInputValue)}
            onFocus={handleFocus} // Handle focus
            onBlur={handleBlur} // Handle blur
            loading={loading}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option, { selected }) => (
                <li {...props} key={option.id}>
                    <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {getNestedProperty(option, displayProperty)}
                </li>
            )}
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
            disabled={disabled}
        />
    );
});

export default MultiSelectWithCheckboxes;
