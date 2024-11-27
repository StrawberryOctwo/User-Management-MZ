import React, { useState, ReactNode, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  InputAdornment,
  IconButton
} from '@mui/material';
import { isValid as isValidIBAN } from 'iban';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { label: string; value: number | string }[]; // For select fields
  section?: string;
  component?: ReactNode;
  xs?: number;
  sm?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  value?: string | number;
  initialValue?: string | number;
  validation?: {
    pattern?: {
      value: RegExp;
      message: string;
    };
    maxLength?: {
      value: number;
      message: string;
    };
    minLength?: {
      value: number;
      message: string;
    };
    iban?: {
      message: string;
    };
  };
}

interface ReusableFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, any>) => Promise<{ message: string }>;
  entityName: string;
  entintyFunction: string;
  initialData?: Record<string, any>;
}

const ReusableForm: React.FC<ReusableFormProps> = ({
  fields,
  onSubmit,
  entityName,
  entintyFunction,
  initialData = {}
}) => {
  const getInitialFormData = () => {
    return fields.reduce((acc, field) => {
      const initialValue =
        field.initialValue ?? initialData[field.name] ?? (field.type === 'number' ? 0 : '');
      acc[field.name] = initialValue;

      // Validate IBAN for pre-filled values
      if (field.name === 'iban') {
        acc[`${field.name}_valid`] = isValidIBAN(initialValue || '');
      }

      return acc;
    }, {} as Record<string, any>);
  };


  const [formData, setFormData] = useState<Record<string, any>>(
    getInitialFormData()
  );
  const [passwordVisibility, setPasswordVisibility] = useState<
    Record<string, boolean>
  >({});

  // New state for logo preview
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );

  const initializeTouchedFields = () => {
    return fields.reduce((acc, field) => {
      if (field.name === 'iban' && initialData[field.name] && !isValidIBAN(initialData[field.name])) {
        acc[field.name] = true; // Mark IBAN field as touched if invalid
      }
      return acc;
    }, {} as Record<string, boolean>);
  };

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(getInitialFormData());
      setTouchedFields(initializeTouchedFields());

      if (initialData.franchiseLogo) {
        setLogoPreview(initialData.franchiseLogo);
      }
    }
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [initialData, fields]);

  const handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (event) => {
    const { name, value } = event.target;

    if (name === 'iban') {
      const isValid = isValidIBAN(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        [`${name}_valid`]: isValid
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name!]: value
    }));
  };

  // Handler for Select changes
  const handleSelectChange = (event: SelectChangeEvent<any>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name!]: value
    }));
  };

  // Handler for logo file changes
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;

    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 500 * 1024) {
        // 500KB in bytes
        alert('File size exceeds 500KB. Please choose a smaller file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          [name]: base64String
        }));
        setLogoPreview(base64String); // Use Base64 string for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidIBAN(formData.iban)) {
      alert('Please enter a valid IBAN.');
      return;
    }

    try {
      const response = await onSubmit(formData);
      if (entintyFunction.toLowerCase() === 'add') {
        setFormData(
          fields.reduce((acc, field) => {
            acc[field.name] =
              field.initialValue ?? (field.type === 'number' ? 0 : '');
            return acc;
          }, {} as Record<string, any>)
        );
        setLogoPreview(null); // Reset logo preview on add
      }
    } catch (error: any) {
      console.error(`Failed to ${entintyFunction} ${entityName}:`, error);
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const groupedFields = fields.reduce((acc, field) => {
    const section = field.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, FieldConfig[]>);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        {entintyFunction} {entityName}
      </Typography>
      <form onSubmit={handleSubmit}>
        {Object.entries(groupedFields).map(([section, fields], index, arr) => (
          <Box key={section} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 1, ml: 3 }}>
              {section}
            </Typography>
            <Grid container spacing={2}>
              {fields.map((field) => (
                <Grid
                  item
                  key={field.name}
                  xs={field.xs || 12}
                  sm={field.sm || 6}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  {field.type === 'select' && field.options ? (
                    <FormControl fullWidth sx={{ width: '95%' }}>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        name={field.name}
                        label={field.label}
                        value={formData[field.name] ?? ''}
                        onChange={handleSelectChange}
                        required={field.required}
                        disabled={field.disabled}
                      >
                        {field.options.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : field.type === 'logo_file' ? (
                    <Box sx={{ width: '100%' }}>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ width: '95%', mb: 2 }}
                      >
                        {formData[field.name] ? 'Change Logo' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          name={field.name}
                          onChange={handleLogoChange}
                        />
                      </Button>
                      {/* Display logo preview if available */}
                      {logoPreview && (
                        <Box sx={{ textAlign: 'center' }}>
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                        </Box>
                      )}
                    </Box>
                  ) : field.component ? (
                    field.component
                  ) : (
                    <TextField
                      name={field.name}
                      label={field.label}
                      type={
                        field.type === 'password'
                          ? passwordVisibility[field.name]
                            ? 'text'
                            : 'password'
                          : field.type
                      }
                      sx={{ width: '95%' }}
                      value={
                        field.type === 'logo_file' ? undefined : formData[field.name] ?? ''
                      }
                      onChange={field.onChange || handleInputChange}
                      required={field.required}
                      disabled={field.disabled}
                      InputLabelProps={
                        field.type === 'date' ? { shrink: true } : undefined
                      }
                      InputProps={
                        field.type === 'password'
                          ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    togglePasswordVisibility(field.name)
                                  }
                                  edge="end"
                                >
                                  {passwordVisibility[field.name] ? (
                                    <VisibilityOff />
                                  ) : (
                                    <Visibility />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                          : undefined
                      }
                      inputProps={{
                        maxLength: field.validation?.maxLength?.value,
                        minLength: field.validation?.minLength?.value,
                        pattern: field.validation?.pattern?.value.source
                      }}
                      error={
                        (field.name === 'iban' && formData[field.name] && !formData[`${field.name}_valid`]) ||
                        (!!field.validation?.pattern?.value &&
                          !new RegExp(field.validation.pattern.value).test(formData[field.name]))
                      }
                      helperText={
                        field.name === 'iban'
                          ? touchedFields[field.name] &&
                            formData[field.name] &&
                            !formData[`${field.name}_valid`]
                            ? 'Invalid iban format. Please enter a valid IBAN.'
                            : ''
                          : touchedFields[field.name] &&
                            !!field.validation?.pattern?.value &&
                            !new RegExp(field.validation.pattern.value).test(formData[field.name])
                            ? field.validation?.pattern?.message
                            : ''
                      }
                      onBlur={() =>
                        setTouchedFields((prev) => ({
                          ...prev,
                          [field.name]: true
                        }))
                      }
                    />
                  )}
                </Grid>
              ))}
            </Grid>
            {index < arr.length - 1 && <Divider sx={{ mt: 5, mb: 2 }} />}
          </Box>
        ))}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            mb: 2,
            mt: 3,
            mr: 3
          }}
        >
          <Button type="submit" variant="contained" color="primary">
            {entintyFunction} {entityName}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ReusableForm;
