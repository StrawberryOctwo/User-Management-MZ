// src/components/RecentOrdersTable.tsx

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
} from '@mui/material';
import Label from 'src/components/Label';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { Franchise } from 'src/models/FranchiseModel';

interface RecentOrdersTableProps {
  franchises: Franchise[];
}

const getStatusLabel = (status: string): JSX.Element => {
  const map = {
    Active: { text: 'Active', color: 'success' },
    Inactive: { text: 'Inactive', color: 'error' },
  };

  const { text, color } = map[status];
  return <Label color={color}>{text}</Label>;
};

const applyPagination = (
  franchises: Franchise[],
  page: number,
  limit: number
): Franchise[] => franchises.slice(page * limit, page * limit + limit);

const RecentOrdersTable: FC<RecentOrdersTableProps> = ({ franchises }) => {
  const [selectedFranchises, setSelectedFranchises] = useState<number[]>([]);
  const [page, setPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const theme = useTheme();

  const handleSelectAllFranchises = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFranchises(
      event.target.checked ? franchises.map((f) => f.id) : []
    );
  };

  const handleSelectOneFranchise = (
    event: ChangeEvent<HTMLInputElement>,
    franchiseId: number
  ) => {
    if (!selectedFranchises.includes(franchiseId)) {
      setSelectedFranchises((prev) => [...prev, franchiseId]);
    } else {
      setSelectedFranchises((prev) =>
        prev.filter((id) => id !== franchiseId)
      );
    }
  };

  const handlePageChange = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLimit(parseInt(event.target.value, 10));
  };

  const paginatedFranchises = applyPagination(franchises, page, limit);
  const selectedAllFranchises =
    selectedFranchises.length === franchises.length;

  return (
    <Card>
      <CardHeader title="Franchise List" />
      <Divider />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selectedAllFranchises}
                  onChange={handleSelectAllFranchises}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Owner Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Employees</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedFranchises.map((franchise) => {
              const status = franchise.status === '1' ? 'Active' : 'Inactive';

              return (
                <TableRow key={franchise.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedFranchises.includes(franchise.id)}
                      onChange={(event) =>
                        handleSelectOneFranchise(event, franchise.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {franchise.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      ID: {franchise.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {franchise.ownerName}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusLabel(status)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="text.primary"
                      gutterBottom
                      noWrap
                    >
                      {franchise.totalEmployees}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                    >
                      {new Date(franchise.created_at).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Franchise" arrow>
                      <IconButton
                        sx={{
                          '&:hover': { background: theme.colors.primary.lighter },
                          color: theme.palette.primary.main,
                        }}
                        size="small"
                        onClick={() =>
                          window.open(`/franchise/edit/${franchise.id}`, '_blank')
                        }
                      >
                        <EditTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Franchise" arrow>
                      <IconButton
                        sx={{
                          '&:hover': { background: theme.colors.error.lighter },
                          color: theme.palette.error.main,
                        }}
                        size="small"
                        onClick={() => console.log('Delete franchise', franchise.id)}
                      >
                        <DeleteTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box p={2}>
        <TablePagination
          component="div"
          count={franchises.length}
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

export default RecentOrdersTable;
