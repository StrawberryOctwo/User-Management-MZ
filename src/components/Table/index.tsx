import { FC, ChangeEvent, useState, useEffect } from 'react';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TableContainer,
    Typography,
    Box,
    Divider,
    CardHeader,
    Tooltip,
    IconButton,
    useTheme,
    TableSortLabel,
    TextField,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import Label from 'src/components/Label';
import ClearIcon from '@mui/icons-material/Clear';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import useTableSort from './useTableSort';
import { CSVLink } from 'react-csv';
import React from 'react';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone';

interface Column {
    field: string;
    headerName: string;
    render?: (value: any, row: any) => JSX.Element | string;
}

interface ReusableTableProps {
    data: any[];
    columns: Column[];
    title: string;
    onEdit?: (id: any) => void;
    onView?: (id: any) => void;
    onDelete?: (selectedIds: number[]) => void;
    onSearchChange?: (query: string) => void;
    onDownload?: (row: any) => void;
    loading: boolean;
    error?: boolean;
    page: number;
    limit: number;
    onPageChange: (newPage: number) => void;
    onLimitChange: (newLimit: number) => void;
    totalCount: number;
    showDefaultActions?: boolean;
}

const getStatusLabel = (status: string): JSX.Element => {
    console.log(status)
    const map = {
        active: { text: 'Active', color: 'success' },
        inactive: { text: 'Inactive', color: 'error' },
        interested: { text: 'Interested', color: 'info' },
    };

    const { text, color } = map[status] || { text: 'Unknown', color: 'default' };
    return <Label color={color}>{text}</Label>;
};

export default function ReusableTable({
    data = [],
    columns,
    title,
    onEdit,
    onView,
    onDelete,
    onSearchChange,
    onDownload,
    loading = false,
    error = false,
    page,
    limit,
    onPageChange,
    onLimitChange,
    totalCount,
    showDefaultActions = true
}: ReusableTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const { order, orderBy, handleRequestSort, sortData } = useTableSort(columns[0]?.field || '');
    const sortedData = sortData(data);
    const allSelected = selectedRows.length === data.length;
    const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const theme = useTheme();

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            if (onSearchChange) {
                onSearchChange(searchQuery);
            }
        }, 500);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchQuery]);

    const handlePageChange = (_event: any, newPage: number) => {
        onPageChange(newPage);
    };

    const handleLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newLimit = parseInt(event.target.value, 10);
        onLimitChange(newLimit);
    };

    const csvData = sortedData.map((row) =>
        columns.reduce((acc: any, column) => {
            acc[column.headerName] = row[column.field];
            return acc;
        }, {})
    );

    const renderTableBody = () => {

        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length + 2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 200,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    </TableCell>
                </TableRow>
            );
        }

        if (error) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length + 2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 200,
                            }}
                        >
                            <Typography variant="h6" color="error">
                                Error fetching data
                            </Typography>
                        </Box>
                    </TableCell>
                </TableRow>
            );
        }

        if (!sortedData || sortedData.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length + 2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 200,
                            }}
                        >
                            <Typography variant="h6">No Data Available</Typography>
                        </Box>
                    </TableCell>
                </TableRow>
            );
        }

        return sortedData.map((row) => (
            <TableRow key={row.id} hover sx={{ px: 4 }}>
                {
                    columns.map((column) => (
                        <TableCell key={column.field}>
                            {column.field === 'status' ? (
                                getStatusLabel(row[column.field])
                            ) : column.field === 'createdAt' ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    noWrap
                                >
                                    {column.render
                                        ? column.render(row[column.field], row)
                                        : row[column.field]}
                                </Typography>
                            ) : (
                                <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                    color="text.primary"
                                    gutterBottom
                                    noWrap
                                >
                                    {column.render
                                        ? column.render(row[column.field], row)
                                        : row[column.field]}
                                </Typography>
                            )}
                        </TableCell>
                    ))
                }
                <TableCell align="right">
                    {onView && (
                        <Tooltip title="View" arrow>
                            <IconButton
                                onClick={() => onView(row.id)}
                                sx={{
                                    '&:hover': {
                                        background: theme.colors.secondary.lighter,
                                    },
                                    color: theme.palette.secondary.main,
                                }}
                                size="small"
                            >
                                <VisibilityTwoToneIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onEdit && (
                        <Tooltip title="Edit" arrow>
                            <IconButton
                                onClick={() => onEdit(row.id)}
                                sx={{
                                    '&:hover': {
                                        background: theme.colors.primary.lighter,
                                    },
                                    color: theme.palette.primary.main,
                                }}
                                size="small"
                            >
                                <EditTwoToneIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onDelete && (
                        <Tooltip title="Delete" arrow>
                            <IconButton
                                onClick={() => onDelete(row.id)}
                                sx={{
                                    '&:hover': {
                                        background: theme.colors.error.lighter,
                                    },
                                    color: theme.palette.error.main,
                                }}
                                size="small"
                            >
                                <DeleteTwoToneIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {onDownload && (
                        <Tooltip title="Download" arrow>
                            <IconButton
                                onClick={() => onDownload(row)}
                                sx={{
                                    '&:hover': {
                                        background: theme.colors.secondary.lighter,
                                    },
                                    color: theme.palette.info.dark,
                                }}
                                size="small"
                            >
                                <DownloadTwoToneIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                    )}
                </TableCell>
            </TableRow >
        ));
    };

    return (
        <Card sx={{ position: 'relative' }}>
            <CardHeader
                title={
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2,
                            width: '100%',
                        }}
                    >
                        {title}

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flex: 1,
                                width: '100%',
                                justifyContent: { xs: 'space-between', sm: 'flex-end' },
                            }}
                        >
                            <TextField
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
                                sx={{
                                    width: { xs: '100%', sm: 300 },
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {searchQuery && (
                                                <IconButton
                                                    onClick={() => setSearchQuery('')}
                                                    aria-label="clear search"
                                                    edge="end"
                                                >
                                                    <ClearIcon />
                                                </IconButton>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <CSVLink data={csvData} filename={`${title}-export.csv`}>
                                <IconButton aria-label="download" sx={{ margin: 1 }}>
                                    <CloudDownloadIcon fontSize="medium" />
                                </IconButton>
                            </CSVLink>
                        </Box>
                    </Box>
                }
            />
            <Divider />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.field}>
                                    <TableSortLabel
                                        active={orderBy === column.field}
                                        direction={orderBy === column.field ? order : 'asc'}
                                        onClick={() => {
                                            handleRequestSort(column.field);
                                        }}
                                    >
                                        {column.headerName}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            {/* Conditionally render the Actions column */}
                            {showDefaultActions && (
                                <TableCell align="right">Actions</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>{renderTableBody()}</TableBody>
                </Table>
            </TableContainer>
            <Box p={2}>
                <TablePagination
                    component="div"
                    count={totalCount}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={limit}
                    onRowsPerPageChange={handleLimitChange}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
            </Box>
        </Card>
    );

};
