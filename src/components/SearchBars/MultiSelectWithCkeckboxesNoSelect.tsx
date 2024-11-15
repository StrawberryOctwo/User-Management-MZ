import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TextField, Autocomplete, CircularProgress, Chip } from '@mui/material';

interface MultiSelectWithCheckboxesNoSelectProps {
    label: string;
    fetchData: (query: string) => Promise<any[]>;
    onSelect: (selectedItems: any[]) => void;
    displayProperty: string;
    placeholder?: string;
    initialValue?: any[];
    width?: string | number;
    hideSelected?: boolean;
}

const MultiSelectWithCheckboxesNoSelect = forwardRef(({
    label,
    fetchData,
    onSelect,
    displayProperty,
    placeholder = 'Select...',
    initialValue = [],
    width = '95%',
    hideSelected = false,
}: MultiSelectWithCheckboxesNoSelectProps, ref) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>(initialValue || []);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setQuery('');
            setSelectedItems([]);
            setOptions([]);
        },
        selectedItems,
    }));

    useEffect(() => {
        if (initialValue.length > 0) {
            setOptions((prevOptions) => {
                const uniqueOptions = [
                    ...prevOptions,
                    ...initialValue.filter(
                        (item) => !prevOptions.some((option) => option.id === item.id)
                    ),
                ];
                return uniqueOptions;
            });
            setSelectedItems(initialValue);
        }
    }, [initialValue]);

    useEffect(() => {
        let active = true;

        const fetchOptions = async () => {
            if (focused) {
                setLoading(true);
                try {
                    const data = await fetchData(query);
                    if (active) {
                        setOptions((prevOptions) => {
                            const uniqueOptions = [
                                ...prevOptions,
                                ...data.filter(
                                    (item) => !prevOptions.some((option) => option.id === item.id)
                                ),
                            ];
                            return uniqueOptions;
                        });
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

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    const handleChange = (event: any, value: any[]) => {
        const lastSelectedItem = value[value.length - 1];
        if (!selectedItems.some((item) => item.id === lastSelectedItem.id)) {
            const newSelectedItems = [...selectedItems, lastSelectedItem];
            setSelectedItems(newSelectedItems);
            onSelect(newSelectedItems);
        }
    };

    const getNestedProperty = (option: any, path: string) =>
        path.split('.').reduce((acc, part) => acc && acc[part], option);

    return (
        <Autocomplete
            multiple
            value={selectedItems}
            options={options}
            disableCloseOnSelect
            filterSelectedOptions
            getOptionLabel={(option) => getNestedProperty(option, displayProperty) || ''}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => {
                setQuery(newInputValue); // Update query for search
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            loading={loading}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(value: readonly any[], getTagProps) =>
                !hideSelected ? value.map((option, index) => (
                    <Chip
                        variant="outlined"
                        label={getNestedProperty(option, displayProperty)}
                        {...getTagProps({ index })}
                        key={option.id}
                    />
                )) : null
            }
            renderOption={(props, option) => (
                <li {...props} key={option.id}>
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

export default MultiSelectWithCheckboxesNoSelect;
