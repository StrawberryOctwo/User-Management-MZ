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
  CircularProgress,
  Chip,
  Tooltip
} from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { t } from "i18next"

interface MultiSelectWithCheckboxesProps {
  label: string;
  fetchData: (query: string) => Promise<any[]>;
  onSelect: (selectedItems: any[]) => void;
  displayProperty: string;
  placeholder?: string;
  initialValue?: any[];
  width?: string | number;
  disabled?: boolean;
  options?: any[];
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
      disabled = false,
      options: externalOptions = []
    }: MultiSelectWithCheckboxesProps,
    ref
  ) => {
    const [options, setOptions] = useState<any[]>([]);
    const [initialOptions, setInitialOptions] = useState<any[]>([]);
    const [selectedItems, setSelectedItems] = useState<any[]>(
      initialValue || []
    );
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [shouldFetch, setShouldFetch] = useState(true);
    const [isSelecting, setIsSelecting] = useState(false);

    // Update options if externalOptions changes
    useEffect(() => {
      if (externalOptions.length > 0) {
        setOptions(externalOptions);
        setInitialOptions(externalOptions);
      }
    }, [externalOptions]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setSelectedItems([]);
        setOptions(initialOptions);
        setShouldFetch(true);
      },
      selectedItems
    }));

    // Single effect to handle both initial load and search
    useEffect(() => {
      let active = true;
      const timeoutId = setTimeout(async () => {
        if (!shouldFetch || isSelecting) return;

        if ((focused && inputValue.length >= 0) || options.length === 0) {
          setLoading(true);
          try {
            const data = await fetchData(inputValue);
            if (active) {
              const newOptions = Array.isArray(data) ? data : [];
              selectedItems.forEach((selectedItem) => {
                if (
                  !newOptions.some((option) => option.id === selectedItem.id)
                ) {
                  newOptions.push(selectedItem);
                }
              });

              setOptions(newOptions);

              if (options.length === 0 && inputValue === '') {
                setInitialOptions(newOptions);
              }
            }
          } catch (error) {
            console.error('Error fetching options:', error);
            setOptions([]);
          } finally {
            if (active) {
              setLoading(false);
              setShouldFetch(false);
            }
          }
        } else if (inputValue.length === 0) {
          setOptions(initialOptions);
        }
      }, 300);

      return () => {
        active = false;
        clearTimeout(timeoutId);
      };
    }, [
      focused,
      inputValue,
      fetchData,
      disabled,
      selectedItems,
      shouldFetch,
      isSelecting
    ]);

    // Handle initial value changes
    useEffect(() => {
      if (initialValue?.length > 0) {
        setSelectedItems(initialValue);
        setOptions((prevOptions) => {
          const newOptions = [...prevOptions];
          initialValue.forEach((selectedItem) => {
            if (!newOptions.some((option) => option.id === selectedItem.id)) {
              newOptions.push(selectedItem);
            }
          });
          return newOptions;
        });
      }
    }, [initialValue]);

    const handleFocus = () => setFocused(true);
    const handleBlur = () => {
      setFocused(false);
      setInputValue('');
      setOptions(initialOptions);
    };

    const handleChange = (event: any, value: any[]) => {
      setIsSelecting(true);
      setSelectedItems(value);
      onSelect(value);
      // Reset after selection
      setTimeout(() => {
        setIsSelecting(false);
      }, 100);
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
  onInputChange={(event, newInputValue, reason) => {
    if (reason !== 'reset' && !isSelecting) {
      setInputValue(newInputValue);
      if (newInputValue.length >= 0) {
        setShouldFetch(true);
      }
    }
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
  renderTags={(value, getTagProps) => {
    const maxTags = 0; // Show only 2 tags
    const displayedTags = value.slice(0, maxTags);
    const remainingTags = value.length - maxTags;

    return (
      <>
        {displayedTags.map((option, index) => (
          <Chip
            label={getNestedProperty(option, displayProperty)}
            {...getTagProps({ index })}
            key={option.id}
            style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}
          />
        ))}
        {remainingTags > 0 && (
          <Tooltip
            title={value
              .slice(maxTags)
              .map((item) => getNestedProperty(item, displayProperty))
              .join(', ')}
          >
            <Chip label={`${remainingTags} Selected`} />
          </Tooltip>
        )}
      </>
    );
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label={label}
      placeholder={selectedItems.length > 0 ? '' : placeholder}
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
  style={{ width: '100%', maxWidth: '300px' }} // Restrict width
  disabled={disabled}
/>

    );
  }
);

export default MultiSelectWithCheckboxes;
