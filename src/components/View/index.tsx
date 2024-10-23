import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Divider, Link } from '@mui/material';
import { DataGrid, GridColDef, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';

interface DetailFieldConfig {
    name: string;
    label: string;
    type?: string;
    section?: string;
    component?: React.ReactNode | ((data: any) => React.ReactNode);
    isArray?: boolean;
    isTable?: boolean; // New flag to decide between table or list (default true)
    linkUrl?: (id: number) => string; // URL generator function for clickable items
    columns?: { field: string; headerName: string }[];
}

interface ReusableDetailsProps {
    fields: DetailFieldConfig[];
    data: Record<string, any>;
    entityName: string;
}

const ReusableDetails: React.FC<ReusableDetailsProps> = ({ fields, data, entityName }) => {
    const [pageSize, setPageSize] = useState(5); // State to manage page size
    const groupedFields = fields.reduce((acc, field) => {
        const sectionName = field.section || 'General';
        if (!acc[sectionName]) acc[sectionName] = [];
        acc[sectionName].push(field);
        return acc;
    }, {} as Record<string, DetailFieldConfig[]>);

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 4, mt: 2, textAlign: 'center' }}>
                {entityName} Details
            </Typography>
            {Object.entries(groupedFields).map(([section, fields], index, arr) => (
                <Box key={section} sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, ml: 1 }}>
                        <strong>{section}</strong>
                    </Typography>
                    <Grid container spacing={2}>
                        {fields.map((field) => (
                            <Grid item xs={12} key={field.name}>
                                {field.isArray ? (
                                    field.isTable !== false ? (
                                        <DataGrid
                                            autoHeight
                                            rows={data[field.name] || []}
                                            columns={field.columns as GridColDef[]}
                                            pageSize={pageSize}
                                            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                                            rowsPerPageOptions={[5, 10, 25]}
                                            pagination
                                            components={{
                                                Toolbar: CustomToolbar
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
                                                ml: 1,
                                                '& .MuiDataGrid-main': { borderTop: '1px solid #ddd' },
                                                '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 'bold' },
                                                '& .MuiDataGrid-columnHeader': { borderRight: '1px solid #ddd' },
                                                '& .MuiDataGrid-cell': { borderRight: '1px solid #ddd' },
                                                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                                                '& .MuiDataGrid-cell:focus-within': { outline: 'none' },
                                            }}
                                        />

                                    ) : (
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', ml: 1 }}>
                                            {(data[field.name] as Array<any>).map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={field.linkUrl ? field.linkUrl(item.id) : '#'}
                                                    underline="hover"
                                                    target="_blank" // Open in new window
                                                    rel="noopener noreferrer" // Prevents security risks
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </Box>
                                    )
                                ) : typeof field.component === 'function' ? (
                                    field.component(data)
                                ) : (
                                    field.component || (
                                        <Typography variant="body2" sx={{ ml: 1 }}>
                                            {field.label}: {data[field.name]}
                                        </Typography>
                                    )
                                )}
                            </Grid>
                        ))}
                    </Grid>
                    {index < arr.length - 1 && <Divider sx={{ mt: 5, mb: 2, borderBottomWidth: '2px' }} />}
                </Box>
            ))}
        </Paper>
    );
};

function CustomToolbar() {
    return (
        <GridToolbarContainer sx={{ ml: 1, my: 1 }}>
            <GridToolbarFilterButton />
            <GridToolbarColumnsButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport
                slotProps={{
                    tooltip: { title: 'Export data' },
                }}
            />
            <Box sx={{ flex: 1 }}></Box>
            <GridToolbarQuickFilter />
        </GridToolbarContainer>
    );
}

export default ReusableDetails;
