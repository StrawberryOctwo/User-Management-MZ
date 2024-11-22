import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react';
import {
  Checkbox,
  TextField,
  Autocomplete,
  CircularProgress
} from '@mui/material';
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
  disabled?: boolean;
}

const MultiSelectWithCheckboxes = forwardRef(
  (
    {
      label,
      fetchData,
      onSelect,
      displayProperty,
      placeholder = 'Select...',
      initialValue = [],
      width = '95%',
      disabled = false
    }: MultiSelectWithCheckboxesProps,
    ref
  ) => {
    const [options, setOptions] = useState<any[]>(initialValue || []);
    const [selectedItems, setSelectedItems] = useState<any[]>(
      initialValue || []
    );
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setSelectedItems([]);
        setOptions([]);
        setInitialDataLoaded(false);
      },
      selectedItems
    }));

    useEffect(() => {
      const loadInitialData = async () => {
        if (!initialDataLoaded && !disabled) {
          setLoading(true);
          try {
            const data = await fetchData('');
            setOptions(data);
            setInitialDataLoaded(true);
          } catch (error) {
            console.error('Error fetching initial data:', error);
          } finally {
            setLoading(false);
          }
        }
      };

      loadInitialData();
    }, [fetchData, disabled, initialDataLoaded]);

    useEffect(() => {
      if (initialValue?.length > 0) {
        setSelectedItems(initialValue);
      }
    }, [initialValue]);

    useEffect(() => {
      let active = true;
      const timeoutId = setTimeout(async () => {
        if (focused && !disabled && inputValue.length >= 2) {
          setLoading(true);
          try {
            const data = await fetchData(inputValue);
            if (active) {
              const mergedOptions = data.filter(
                (item) =>
                  !selectedItems.some((selected) => selected.id === item.id)
              );
              setOptions([...mergedOptions, ...selectedItems]);
            }
          } catch (error) {
            console.error('Error fetching options:', error);
          } finally {
            if (active) {
              setLoading(false);
            }
          }
        }
      }, 300);

      return () => {
        active = false;
        clearTimeout(timeoutId);
      };
    }, [focused, inputValue, fetchData, disabled, selectedItems]);

    const handleFocus = () => setFocused(true);
    const handleBlur = () => {
      setFocused(false);
      setInputValue('');
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
        getOptionLabel={(option) =>
          getNestedProperty(option, displayProperty) || ''
        }
        onChange={handleChange}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
        disabled={disabled}
      />
    );
  }
);

export default MultiSelectWithCheckboxes;