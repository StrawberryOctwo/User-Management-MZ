import { Box, Button, CircularProgress, Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { deleteClosingDay, deleteHoliday, fetchClosingDaysByLocationIds, fetchHolidaysByLocationIds } from 'src/services/specialDaysService';
import { t } from "i18next"

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`days-off-tabpanel-${index}`}
      aria-labelledby={`days-off-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DaysOffContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [holidays, setHolidays] = useState([]);
  const [closingDays, setClosingDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [deleteType, setDeleteType] = useState<'holiday' | 'closingDay'>('holiday');

  // Separate pagination states for each tab
  const [holidayPage, setHolidayPage] = useState(0);
  const [holidayLimit, setHolidayLimit] = useState(10);
  const [holidayTotal, setHolidayTotal] = useState(0);

  const [closingDayPage, setClosingDayPage] = useState(0);
  const [closingDayLimit, setClosingDayLimit] = useState(10);
  const [closingDayTotal, setClosingDayTotal] = useState(0);

  const navigate = useNavigate();

  const loadHolidays = async (searchQuery = '') => {
    setLoading(true);
    try {
      const result = await fetchHolidaysByLocationIds(undefined, holidayPage + 1, holidayLimit);
      const formattedData = result.data.map((holiday: any) => ({
        ...holiday,
        start_date: format(new Date(holiday.start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(holiday.end_date), 'yyyy-MM-dd')
      }));
      setHolidays(formattedData);
      setHolidayTotal(result.total);
    } catch (error) {
      setErrorMessage('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const loadClosingDays = async (searchQuery = '') => {
    setLoading(true);
    try {
      const result = await fetchClosingDaysByLocationIds(undefined, closingDayPage + 1, closingDayLimit);
      const formattedData = result.data.map((day: any) => ({
        ...day,
        start_date: format(new Date(day.start_date), 'yyyy-MM-dd'),
        end_date: format(new Date(day.end_date), 'yyyy-MM-dd')
      }));
      setClosingDays(formattedData);
      setClosingDayTotal(result.total);
    } catch (error) {
      setErrorMessage('Failed to load closing days');
    } finally {
      setLoading(false);
    }
  };

  // Separate useEffects for initial load and pagination changes
  useEffect(() => {
    if (activeTab === 0) {
      loadHolidays();
    }
  }, [holidayPage, holidayLimit]);

  useEffect(() => {
    if (activeTab === 1) {
      loadClosingDays();
    }
  }, [closingDayPage, closingDayLimit]);

  const handleEdit = (id: number) => {
    const type = activeTab === 0 ? 'holiday' : 'closingDay';
    navigate(`${type}/edit/${id}`);
  };

  const handleDelete = async () => {
    setDialogOpen(false);
    setLoading(true);

    try {
      if (deleteType === 'holiday') {
        await deleteHoliday(selectedIds);
        await loadHolidays();
      } else {
        await deleteClosingDay(selectedIds);
        await loadClosingDays();
      }
    } catch (error) {
      setErrorMessage(`Failed to delete ${deleteType}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (ids: number | number[]) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setSelectedIds(idsArray);
    setDeleteType(activeTab === 0 ? 'holiday' : 'closingDay');
    setDialogOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (newPage: number) => {
    if (activeTab === 0) {
      setHolidayPage(newPage);
    } else {
      setClosingDayPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (activeTab === 0) {
      setHolidayLimit(newLimit);
      setHolidayPage(0);
    } else {
      setClosingDayLimit(newLimit);
      setClosingDayPage(0);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name' },
    { field: 'start_date', headerName: 'Start Date' },
    { field: 'end_date', headerName: 'End Date' },
    { field: 'locationId', headerName: 'Location ID' }
  ];

  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Holidays" />
          <Tab label="Closing Days" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <ReusableTable
          data={holidays}
          columns={columns}
          title="Holidays"
          onEdit={handleEdit}
          onDelete={confirmDelete}
          onSearchChange={loadHolidays}
          loading={loading}
          page={holidayPage}
          limit={holidayLimit}
          totalCount={holidayTotal}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <ReusableTable
          data={closingDays}
          columns={columns}
          title="Closing Days"
          onEdit={handleEdit}
          onDelete={confirmDelete}
          onSearchChange={loadClosingDays}
          loading={loading}
          page={closingDayPage}
          limit={closingDayLimit}
          totalCount={closingDayTotal}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </TabPanel>

      <ReusableDialog
        open={dialogOpen}
        title="Confirm Deletion"
        onClose={() => setDialogOpen(false)}
        actions={
          <>
            <Button onClick={() => setDialogOpen(false)} color="inherit" disabled={loading}>
              {t("(cancel")}
            </Button>
            <Button
              onClick={handleDelete}
              color="primary"
              autoFocus
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t("confirm")}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the selected {deleteType}?</p>
      </ReusableDialog>
    </Box>
  );
}