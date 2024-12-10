import { Box, Button, CircularProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ReusableTable from 'src/components/Table';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { deleteTopic, fetchTopics } from 'src/services/topicService';
import { useNavigate } from 'react-router-dom';
import { Topic } from 'src/models/TopicModel';
import { useTranslation } from 'react-i18next';


export default function ViewTopicPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(25);
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    loadTopics();
  }, [limit, page]);

  const loadTopics = async (searchQuery = '') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { data, total } = await fetchTopics(page + 1, limit, searchQuery);
      const flattenedTopics = data.map((topic: { id: any; name: any; franchise: { name: any; }; createdAt: string }) => ({
        id: topic.id,
        name: topic.name,
        franchiseName: topic.franchise?.name || 'N/A',
        createdAt: topic.createdAt,
      }));
      setTopics(flattenedTopics);
      setTotalCount(total);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setErrorMessage('Failed to load topics. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const columns = [
    { field: 'name', headerName: t('topic_name') },
    { field: 'franchiseName', headerName: t('franchise') },
    { field: 'createdAt', headerName: 'Created At', render: (value: any) => new Date(value).toLocaleDateString() },
  ];
  // const handleEdit = (id: any) => {
  //   navigate(`edit/${id}`);
  // };

  const handleView = (id: any) => {
    navigate(`view/${id}`);
  };

  const handleDelete = async () => {
    setDialogOpen(false);
    setLoading(true);

    try {
      const response = await deleteTopic(selectedIds[0]);
      showMessage(response.message, 'success');
      await loadTopics();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete topics.';
      showMessage(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (ids: number | number[]) => {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    setSelectedIds(idsArray);
    setDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(0);
  };

  if (errorMessage) return <div>{errorMessage}</div>;

  return (
    <Box>
      <ReusableTable
        data={topics}
        columns={columns}
        title="Topic List"
        // onEdit={handleEdit}
        onView={handleView}
        onDelete={confirmDelete}
        onSearchChange={loadTopics}
        loading={loading}
        error={!!errorMessage}
        page={page}
        limit={limit}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

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
        <p>Are you sure you want to delete the selected topics?</p>
      </ReusableDialog>
    </Box>
  );
}
