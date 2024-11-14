import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Checkbox, TextField, Autocomplete, CircularProgress } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface MultiSelectWithCheckboxesProps {
    label: string;
    fetchData: (query: string) => Promise<any[]>;
    onSelect: (selectedItems: any[]) => void;
    displayProperty: string;
    placeholder?: string;
    initialValue?: any[];
    width?: string | number;
    hideSelected?: boolean;

}

const MultiSelectWithCheckboxes = forwardRef(({
    label,
    fetchData,
    onSelect,
    displayProperty,
    placeholder = 'Select...',
    initialValue = [],
    width = '95%',
    hideSelected = false, // Default to false
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
            if (focused) { // Only fetch options if the input is focused
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
    }, [focused, query, fetchData, selectedItems]);

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
            value={selectedItems} // Use selectedItems to allow multiple selection
            inputValue={hideSelected ? '' : query} // Clear input display when hideSelected is true
            options={options}
            disableCloseOnSelect
            getOptionLabel={(option) => getNestedProperty(option, displayProperty) || ''}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => setQuery(newInputValue)}
            onFocus={handleFocus} // Handle focus
            onBlur={handleBlur} // Handle blur
            loading={loading}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={() => null} // Prevent selected items from showing as tags
            renderOption={(props, option, { selected }) => (
                <li {...props} key={option.id}>
                    <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        style={{ marginRight: 8 }}
                        checked={selectedItems.some((item) => item.id === option.id)} // Keep checkboxes in the list checked
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
        />
    );
});

export default MultiSelectWithCheckboxes;
