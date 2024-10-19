// src/components/ReusableTable.tsx

import { FC, ChangeEvent, useState } from 'react';
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
    Checkbox,
    Box,
    Divider,
    CardHeader,
    Tooltip,
    IconButton,
    useTheme,
    TableSortLabel,
} from '@mui/material';
import Label from 'src/components/Label';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import useTableSort from './useTableSort';

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
}

const getStatusLabel = (status: string): JSX.Element => {
    console.log(status)
    const map = {
        1: { text: 'Active', color: 'success' },
        0: { text: 'Inactive', color: 'error' },
    };

    const { text, color } = map[status] || { text: 'Unknown', color: 'default' };
    return <Label color={color}>{text}</Label>;
};

const applyPagination = (
    data: any[],
    page: number,
    limit: number
): any[] => data.slice(page * limit, page * limit + limit);

const ReusableTable: FC<ReusableTableProps> = ({
    data = [],
    columns,
    title,
    onEdit,
    onView,
    onDelete
}) => {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [page, setPage] = useState<number>(0);
    const [limit, setLimit] = useState<number>(5);
    const { order, orderBy, handleRequestSort, sortData } = useTableSort(columns[0]?.field || '');
    const sortedData = sortData(data);
    const paginatedData = applyPagination(sortedData, page, limit);
    const allSelected = selectedRows.length === data.length;

    const theme = useTheme();

    const handleSelectAll = (event: ChangeEvent<HTMLInputElement>) => {
        setSelectedRows(event.target.checked ? data.map((item) => item.id) : []);
    };

    const handleSelectOne = (
        event: ChangeEvent<HTMLInputElement>,
        id: any
    ) => {
        setSelectedRows((prev) =>
            event.target.checked ? [...prev, id] : prev.filter((i) => i !== id)
        );
    };

    const handlePageChange = (event: any, newPage: number) => setPage(newPage);
    const handleLimitChange = (event: ChangeEvent<HTMLInputElement>) =>
        setLimit(parseInt(event.target.value, 10));



    return (
        <Card>
            <CardHeader title={title} />
            <Divider />
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={allSelected}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            {columns.map((column) => (
                                <TableCell key={column.field}>
                                    <TableSortLabel
                                        active={orderBy === column.field}
                                        direction={orderBy === column.field ? order : 'asc'}
                                        onClick={() => handleRequestSort(column.field)}
                                    >
                                        {column.headerName}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        checked={selectedRows.includes(row.id)}
                                        onChange={(event) => handleSelectOne(event, row.id)}
                                    />
                                </TableCell>
                                {columns.map((column) => (
                                    <TableCell key={column.field}>
                                        {column.field === 'status' ? (
                                            getStatusLabel(row[column.field])
                                        ) : column.field === 'created_at' ? (
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
                                ))}
                                <TableCell align="right">
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box p={2}>
                <TablePagination
                    component="div"
                    count={data.length}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={limit}
                    onRowsPerPageChange={handleLimitChange}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Box>
        </Card>
    );
};

export default ReusableTable;
