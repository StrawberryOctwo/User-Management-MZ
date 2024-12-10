import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TextField, Autocomplete, CircularProgress, Chip } from '@mui/material';
import { t } from "i18next"

interface MultiSelectWithCheckboxesNoSelectProps {
    label: string;
    fetchData: (query: string) => Promise<any[]>;
    onSelect: (selectedItems: any[]) => void;
    displayProperty?: string; // Optional
    getOptionLabel?: (option: any) => string; // Optional for custom labels
    placeholder?: string;
    initialValue?: any[];
    width?: string | number;
    hideSelected?: boolean;
    idField?: string;
}

const MultiSelectWithCheckboxesNoSelect = forwardRef(({
    label,
    fetchData,
    onSelect,
    displayProperty,
    getOptionLabel,
    placeholder = 'Select...',
    initialValue = [],
    width = '95%',
    hideSelected = false,
    idField = 'id',
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
                        (item) => !prevOptions.some((option) => option[idField] === item[idField])
                    ),
                ];
                return uniqueOptions;
            });
            setSelectedItems(initialValue);
        }
    }, [initialValue, idField]);

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
                                    (item) => !prevOptions.some((option) => option[idField] === item[idField])
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
    }, [focused, query, fetchData, selectedItems, idField]);

    const handleFocus = () => setFocused(true);
    const handleBlur = () => setFocused(false);

    const handleChange = (event: any, value: any[]) => {
        const lastSelectedItem = value[value.length - 1];
        if (!selectedItems.some((item) => item[idField] === lastSelectedItem[idField])) {
            const newSelectedItems = [...selectedItems, lastSelectedItem];
            setSelectedItems(newSelectedItems);
            onSelect(newSelectedItems);
        }
    };

    // Use either getOptionLabel function or displayProperty
    const labelGenerator = getOptionLabel
        ? getOptionLabel
        : (option: any) => {
            if (displayProperty) {
                return displayProperty.split('.').reduce((acc, part) => acc && acc[part], option) || '';
            }
            return '';
        };

    return (
        <Autocomplete
            multiple
            value={selectedItems}
            options={options}
            disableCloseOnSelect
            filterSelectedOptions
            getOptionLabel={labelGenerator}
            onChange={handleChange}
            onInputChange={(event, newInputValue) => {
                setQuery(newInputValue); // Update query for search
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            loading={loading}
            isOptionEqualToValue={(option, value) => option[idField] === value[idField]}
            renderTags={(value: readonly any[], getTagProps) =>
                !hideSelected ? value.map((option, index) => (
                    <Chip
                        variant="outlined"
                        label={labelGenerator(option)}
                        {...getTagProps({ index })}
                        key={option[idField]}
                    />
                )) : null
            }
            renderOption={(props, option) => (
                <li {...props} key={option[idField]}>
                    {labelGenerator(option)}
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
