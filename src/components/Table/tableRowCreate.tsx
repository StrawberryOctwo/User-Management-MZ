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
  initialValue?: string | number; // New property for initial value
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
  initialData = {},
}) => {
  const getInitialFormData = () => {
    return fields.reduce((acc, field) => {
      // Use initialValue from field config, fallback to initialData, or sensible default
      acc[field.name] = field.initialValue ?? initialData[field.name] ?? (field.type === 'number' ? 0 : '');
      return acc;
    }, {} as Record<string, any>);
  };

  const [formData, setFormData] = useState<Record<string, any>>(getInitialFormData());
  const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(getInitialFormData());
    }
  }, [initialData, fields]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<any>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name!]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await onSubmit(formData);
      if (entintyFunction.toLowerCase() === 'add') {
        setFormData(fields.reduce((acc, field) => {
          acc[field.name] = field.initialValue ?? (field.type === 'number' ? 0 : '');
          return acc;
        }, {} as Record<string, any>));
      }
    } catch (error: any) {
      console.error(`Failed to ${entintyFunction} ${entityName}:`, error);
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
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
                  {field.name === 'status' ? (
                    <FormControl fullWidth sx={{ width: '95%' }}>
                      <InputLabel>{field.label}</InputLabel>
                      <Select
                        name={field.name}
                        label={field.name}
                        value={formData[field.name] ?? ''}
                        onChange={handleChange} // Now correctly typed
                        required={field.required}
                        disabled={field.disabled}
                      >
                        <MenuItem value={1}>Active</MenuItem>
                        <MenuItem value={0}>Inactive</MenuItem>
                      </Select>
                    </FormControl>
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
                      value={formData[field.name] ?? ''}
                      onChange={field.onChange || handleChange}
                      required={field.required}
                      disabled={field.disabled}
                      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                      InputProps={
                        field.type === 'password'
                          ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() => togglePasswordVisibility(field.name)}
                                  edge="end"
                                >
                                  {passwordVisibility[field.name] ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                          : undefined
                      }
                    />

                  )}
                </Grid>
              ))}
            </Grid>
            {index < arr.length - 1 && <Divider sx={{ mt: 5, mb: 2 }} />}
          </Box>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, mt: 3, mr: 3 }}>
          <Button type="submit" variant="contained" color="primary">
            {entintyFunction} {entityName}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ReusableForm;
