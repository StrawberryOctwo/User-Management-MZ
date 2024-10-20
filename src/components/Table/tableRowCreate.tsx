import React, { useState, ReactNode, useEffect } from 'react';
import { Button, TextField, Box, Grid, Paper, Typography, Divider } from '@mui/material';

export interface FieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { label: string; value: string | number }[]; // For select fields
  section?: string; // New property to define the section
  component?: ReactNode; // New property to define a custom component
  xs?: number; // New property to define xs grid size
  sm?: number; // New property to define sm grid size
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Allow onChange handler
  disabled?: boolean; // Add disabled support
  value?: string | number; // Ensure value is supported
}

interface ReusableFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, any>) => Promise<{ message: string }>; // Expects a Promise that resolves to FormResponse
  entityName: string;
  entintyFunction: string;
  initialData?: Record<string, any>; // Add initialData prop
}

const ReusableForm: React.FC<ReusableFormProps> = ({ fields, onSubmit, entityName, entintyFunction, initialData = {} }) => {
  
  // Initialize formData state with initialData when it changes
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  useEffect(() => {
    setFormData(initialData); // Update formData when initialData changes
  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await onSubmit(formData);
      const successMessage = response.message || `Successfully updated ${entityName}`;

      // Only reset the form if it's an "Add" form, not "Edit"
      if (entintyFunction.toLowerCase() === 'add') {
        setFormData(fields.reduce((acc, field) => {
          acc[field.name] = field.type === 'number' ? 0 : ''; // Initialize with default values
          return acc;
        }, {} as Record<string, any>));
      }
      
      // showMessage(successMessage, 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to update ${entityName}. Please try again.`;
      // showMessage(errorMessage, 'error');
    }
  };

  // Group fields by sections
  const groupedFields = fields.reduce((acc, field) => {
    if (field.section) {
      if (!acc[field.section]) acc[field.section] = [];
      acc[field.section].push(field);
    } else {
      if (!acc['Other']) acc['Other'] = [];
      acc['Other'].push(field);
    }
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
                  xs={field.xs || 12} // Default to xs={12} if not provided
                  sm={field.sm || 6} // Default to sm={6} if not provided
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  {field.component ? (
                    field.component
                  ) : (
                    <TextField
                      name={field.name}
                      label={field.label}
                      type={field.type}
                      sx={{ width: '95%' }} // Set width to 95%
                      value={formData[field.name] ?? ''} // Use formData for the value
                      onChange={field.onChange || handleChange} // Allow custom onChange if provided, else default
                      required={field.required}
                      disabled={field.disabled} // Add disabled support
                      InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
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
