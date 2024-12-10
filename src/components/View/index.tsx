import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Link,
  Paper,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
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
import { t } from "i18next"

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

      {/* Iterate through each section */}
      {Object.entries(groupedFields).map(([section, fields], index, arr) => {
        // Separate fields into categories
        const nonTableFields = fields.filter((field) => !field.isArray && !field.isTextArray);
        const tableFields = fields.filter((field) => field.isArray && !field.isTextArray);
        const textArrayFields = fields.filter((field) => field.isArray && field.isTextArray);

        return (
          <Card
            key={`${section}-${index}`} // Ensure unique key
            sx={{
              mb: 3,
              boxShadow: theme.shadows[3],
              borderRadius: 2,
              background: theme.palette.background.paper,
              width: '100%',
              transition: 'transform 0.2s',
            }}
          >
            <CardHeader
              title={section}
              titleTypographyProps={{
                variant: 'h6',
                fontWeight: '700',
                color: theme.palette.text.primary,
              }}
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.action.hover,
                padding: { xs: 1.5, sm: 2.5 },
              }}
            />
            <CardContent>
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
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.paper,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {typeof field.component === 'function' ? (
                          field.component(data)
                        ) : field.isTextArray ? (
                          // This condition is now redundant as textArrayFields are handled separately
                          // But keeping it for safety
                          data[field.name] && data[field.name].length > 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              <strong>{field.label}:</strong> {data[field.name].join(', ')}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              <strong>{field.label}:</strong> N/A
                            </Typography>
                          )
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            <strong>{field.label}:</strong> {data[field.name] || 'N/A'}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Render text array fields */}
              {textArrayFields.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {textArrayFields.map((field) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={field.name}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.paper,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>{field.label}:</strong>
                        </Typography>
                        {data[field.name] && data[field.name].length > 0 ? (
                          // Display as comma-separated
                          <Typography variant="body2" color="text.secondary">
                            {data[field.name].join(', ')}
                          </Typography>
                          // Alternatively, display as list:
                          // <List dense>
                          //   {data[field.name].map((item: string, idx: number) => (
                          //     <ListItem key={idx} sx={{ pl: 0 }}>
                          //       <ListItemText primary={item} />
                          //     </ListItem>
                          //   ))}
                          // </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Render table fields separately */}
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
                        {t("columns_not_defined_for_this_table.")}
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
                    <Typography variant="h6" gutterBottom>
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
                              {t("no_results_found.")}
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
            </CardContent>
            {index < arr.length - 1 && (
              <Box sx={{ mt: 3, mb: 2, borderBottomWidth: '1px' }} />
            )}
          </Card>
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
