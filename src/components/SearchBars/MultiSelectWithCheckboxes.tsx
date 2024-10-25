import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Checkbox, TextField, Autocomplete, CircularProgress } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface MultiSelectWithCheckboxesProps {
    label: string;
    fetchData: (query?: string) => Promise<any[]>; // Make query optional for default data fetch
    onSelect: (selectedItems: any[]) => void;
    displayProperty: string;
    placeholder?: string;
    initialValue?: any[];
    width?: string | number;
}

const MultiSelectWithCheckboxes = forwardRef(({
    label,
    fetchData,
    onSelect,
    displayProperty,
    placeholder = 'Select...',
    initialValue = [],
    width = '95%',
}: MultiSelectWithCheckboxesProps, ref) => {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<any[]>(initialValue || []);
    const [selectedItems, setSelectedItems] = useState<any[]>(initialValue || []);
    const [loading, setLoading] = useState(false);

    // Debounce function to limit the frequency of API calls
    const debounce = (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Fetch options with debounce to limit excessive API calls
    const fetchOptions = useCallback(
        debounce(async (query: string) => {
            setLoading(true);
            try {
                const data = await fetchData(query);
                const mergedOptions = [
                    ...selectedItems,
                    ...data.filter((item) => !selectedItems.some((selected) => selected.id === item.id)),
                ];
                setOptions(mergedOptions);
            } catch (error) {
                console.error('Error fetching options:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }, 300), [fetchData, selectedItems]
    );

    // Fetch default options when the input is focused
    const handleInputFocus = async () => {
        if (options.length === 0) {
            setLoading(true);
            try {
                const data = await fetchData(); // Fetch default data without a query
                setOptions(data);
            } catch (error) {
                console.error('Error fetching default options:', error);
                setOptions([]);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        setSelectedItems(initialValue); // Sync selected items with initial value
    }, [initialValue]);

    useImperativeHandle(ref, () => ({
        reset: () => {
            setQuery('');
            setSelectedItems([]);
            setOptions([]);
        },
        selectedItems, // Expose selectedItems state
    }));

    const handleInputChange = (event: any, newInputValue: string) => {
        setQuery(newInputValue);
        fetchOptions(newInputValue); // Fetch options with debounced input
    };

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
            onInputChange={handleInputChange}
            onFocus={handleInputFocus} // Fetch default data on focus
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
        />
    );
});

export default MultiSelectWithCheckboxes;
