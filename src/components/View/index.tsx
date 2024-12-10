import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Link,
  Paper,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import InfoIcon from '@mui/icons-material/Info';

interface DetailFieldConfig {
  name: string;
  label: string;
  type?: string;
  section?: string;
  component?: React.ReactNode | ((data: any) => React.ReactNode);
  isArray?: boolean;
  isTable?: boolean;
  isTextArray?: boolean;
  linkUrl?: (id: number) => string;
  columns?: { field: string; headerName: string; width?: number }[];
}

interface ReusableDetailsProps {
  fields: DetailFieldConfig[];
  data: Record<string, any>;
  entityName: string;
}

const ReusableDetails: React.FC<ReusableDetailsProps> = ({
  fields,
  data,
  entityName,
}) => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));

  const [pageSizes, setPageSizes] = useState<Record<string, number>>({});

  // Group fields by their section
  const groupedFields = fields.reduce((acc, field) => {
    const sectionName = field.section || 'General';
    if (!acc[sectionName]) acc[sectionName] = [];
    acc[sectionName].push(field);
    return acc;
  }, {} as Record<string, DetailFieldConfig[]>);

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: theme.palette.background.default,
        borderRadius: 3,
        overflow: 'hidden',
        maxWidth: '1000px',
        margin: '30px auto',
      }}
    >
      <Typography
        variant={isSmDown ? 'h4' : 'h3'}
        gutterBottom
        sx={{
          mb: 3,
          mt: 1.5,
          textAlign: 'center',
          fontWeight: '800',
          color: theme.palette.primary.dark,
        }}
      >
        {entityName} Details
      </Typography>

      {/* Iterate through each section using Accordions */}
      {Object.entries(groupedFields).map(([section, fields], index) => {
        // Separate fields into categories
        const nonTableFields = fields.filter(
          (field) => !field.isArray && !field.isTextArray
        );
        const tableFields = fields.filter(
          (field) => field.isArray && !field.isTextArray
        );
        const textArrayFields = fields.filter(
          (field) => field.isArray && field.isTextArray
        );

        return (
          <Accordion
            key={`${section}-${index}`} // Ensure unique key
            defaultExpanded={index === 0} // Expand the first section by default
            sx={{
              mb: 2,
              boxShadow: theme.shadows[2],
              borderRadius: 2,
              '&:before': {
                display: 'none', // Remove default accordion border
              },
              '& .MuiAccordionSummary-root': {
                backgroundColor: theme.palette.action.hover,
                borderRadius: 2,
                minHeight: 48,
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                },
              },
              '& .MuiAccordionDetails-root': {
                padding: theme.spacing(2),
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${section}-content`}
              id={`${section}-header`}
            >
              <Typography
                variant="h6"
                fontWeight="700"
                color={theme.palette.text.primary}
              >
                {section}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* Render non-table fields in Grid */}
              {nonTableFields.length > 0 && (
                <Grid container spacing={2}>
                  {nonTableFields.map((field) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={field.name}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          p: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.paper,
                          width: '100%',
                          boxShadow: theme.shadows[1],
                        }}
                      >
                        {typeof field.component === 'function' ? (
                          field.component(data)
                        ) : field.isTextArray ? (
                          // This condition is now redundant as textArrayFields are handled separately
                          // But keeping it for safety
                          data[field.name] && data[field.name].length > 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              <strong>{field.label}:</strong>{' '}
                              {data[field.name].join(', ')}
                            </Typography>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              <strong>{field.label}:</strong> N/A
                            </Typography>
                          )
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            <strong>{field.label}:</strong>{' '}
                            {data[field.name] || 'N/A'}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Render text array fields using Chips */}
              {textArrayFields.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  {textArrayFields.map((field) => (
                    <Box key={field.name} sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, fontWeight: 600 }}
                      >
                        {field.label}:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {data[field.name] && data[field.name].length > 0 ? (
                          data[field.name].map((item: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={item}
                              variant="outlined"
                              color="primary"
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Render table fields */}
              {tableFields.map((field) => {
                if (!field.columns) {
                  console.warn(
                    `Field "${field.name}" is marked as a table but does not have "columns" defined.`
                  );
                  return (
                    <Box key={field.name} sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {field.label}
                      </Typography>
                      <Typography variant="body2" color="error">
                        Columns not defined for this table.
                      </Typography>
                    </Box>
                  );
                }

                const rowsWithIds = (data[field.name] || []).map(
                  (row: any, index: number) => ({
                    id: `${field.name}-${index}`, // Ensure unique IDs across tables
                    ...row,
                  })
                );

                return (
                  <Box key={field.name} sx={{ mt: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {field.label}
                    </Typography>
                    <DataGrid
                      autoHeight
                      rows={rowsWithIds}
                      columns={field.columns as GridColDef[]}
                      pageSize={pageSizes[field.name] || 5}
                      onPageSizeChange={(newPageSize) =>
                        setPageSizes((prev) => ({
                          ...prev,
                          [field.name]: newPageSize,
                        }))
                      }
                      rowsPerPageOptions={[5, 10, 25]}
                      pagination
                      components={{
                        Toolbar: CustomToolbar,
                      }}
                      componentsProps={{
                        noRowsOverlay: {
                          children: (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              No results found.
                            </Typography>
                          ),
                        },
                      }}
                      disableSelectionOnClick
                      sx={{
                        width: '100%',
                        '& .MuiDataGrid-root': {
                          backgroundColor: theme.palette.background.paper,
                        },
                        '& .MuiDataGrid-main': {
                          borderTop: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                          fontWeight: '700',
                          color: theme.palette.text.primary,
                        },
                        '& .MuiDataGrid-columnHeader': {
                          borderRight: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-cell': {
                          borderRight: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-cell:focus': { outline: 'none' },
                        '& .MuiDataGrid-cell:focus-within': {
                          outline: 'none',
                        },
                        '& .MuiDataGrid-footerContainer': {
                          borderTop: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiDataGrid-toolbarContainer': {
                          backgroundColor: theme.palette.background.paper,
                        },
                      }}
                    />
                  </Box>
                );
              })}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
};

function CustomToolbar() {
  const theme = useTheme();
  return (
    <GridToolbarContainer
      sx={{
        ml: 1,
        my: 1,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: 1,
        borderRadius: 1,
      }}
    >
      <GridToolbarFilterButton />
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

export default ReusableDetails;
