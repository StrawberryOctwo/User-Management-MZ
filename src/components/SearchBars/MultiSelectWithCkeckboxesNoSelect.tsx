import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Checkbox, TextField, Autocomplete, CircularProgress } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

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
                // Ensure unique options by merging initial values and filtering out duplicates
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
                            // Merge fetched data with selected items and ensure uniqueness by id
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
        setSelectedItems(value);
        onSelect(value);
    };

    const getNestedProperty = (option: any, path: string) =>
        path.split('.').reduce((acc, part) => acc && acc[part], option);

    return (
        <Autocomplete
            multiple
            value={selectedItems}
            inputValue={hideSelected ? '' : query}
            options={options}
            disableCloseOnSelect
            getOptionLabel={(option) => getNestedProperty(option, displayProperty) || ''}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => setQuery(newInputValue)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            loading={loading}
            isOptionEqualToValue={(option, value) => option.id === value.id} // Ensures uniqueness by id
            renderTags={() => null}
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
        />
    );
});

export default MultiSelectWithCheckboxesNoSelect;
