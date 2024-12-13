import { useState, useRef, useEffect } from 'react';
import {
    alpha,
    Badge,
    Box,
    Divider,
    IconButton,
    List,
    ListItem,
    Tooltip,
    Typography,
    Popover,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, formatDistance, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { getSelfAbsences, fetchAbsenceById, assignFilesToAbsence, updateAbsenceReason } from 'src/services/absence';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { fetchSelfFiles, addUserDocument } from 'src/services/fileUploadService';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import UploadSection from 'src/components/Files/UploadDocuments';
import { useTranslation } from 'react-i18next';

const AbsencesBadge = styled(Badge)(
    ({ theme }) => `
    .MuiBadge-badge {
      background-color: ${alpha(theme.palette.error.main, 0.1)};
      color: ${theme.palette.error.main};
      min-width: 16px;
      height: 16px;
      padding: 0;

      &::after {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        box-shadow: 0 0 0 1px ${alpha(theme.palette.error.main, 0.3)};
        content: "";
      }
    }
`
);

function AbsenceNotifications() {
    const { t } = useTranslation();
    const ref = useRef<HTMLButtonElement>(null);
    const [isOpen, setOpen] = useState(false);
    const [absences, setAbsences] = useState<any[]>([]);
    const [selectedAbsence, setSelectedAbsence] = useState<any>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 5;

    // States from FileUploadPage
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { showMessage } = useSnackbar();

    const handleOpen = async () => {
        setOpen(true);
        await fetchAbsences(1);
    };

    useEffect(() => {
        fetchAbsences(1);
    }, []);

    const fetchAbsences = async (pageNumber: number) => {
        try {
            const data = await getSelfAbsences(pageNumber, limit);
            setAbsences((prevAbsences) => (pageNumber === 1 ? data.data : [...prevAbsences, ...data.data]));
            setPage(pageNumber);
        } catch (error) {
            console.error('Failed to fetch absences:', error);
            showMessage(t('failed_to_fetch_absences'), 'error');
        }
    };

    const handleClose = () => setOpen(false);

    // Handler for selecting existing files
    const handleFileSelection = (selectedFiles: any[]) => {
        setFiles(selectedFiles);
    };

    // Handler for uploaded files
    const handleUploadedFiles = (newUploadedFiles: any[]) => {
        const formattedFiles = newUploadedFiles.map(file => ({
            id: file.id, // Assuming the uploaded file has an ID returned from the server
            name: file.name,
            path: file.path,
            type: file.type,
            file: file // Original file object if needed
        }));
        setUploadedFiles(formattedFiles);
    };

    // Handler to update files when selected (from FileUploadPage)
    const handleFilesChange = (files: any[]) => {
        setUploadedFiles(files);
    };

    // Submit selected files to the server (from FileUploadPage)
    const handleFileSubmit = async () => {
        if (uploadedFiles.length === 0) {
            showMessage(t('No files selected for upload'), 'error');
            return;
        }

        setLoading(true);
        try {
            for (const file of uploadedFiles) {
                const documentPayload = {
                    type: file.fileType,         // Type of file
                    customFileName: file.fileName // Custom name for the file
                };
                await addUserDocument(documentPayload, file.file);
            }

            setUploadedFiles([]); // Clear files after successful upload
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditAbsence = async (absence: any) => {
        if (absence.status === null) {
            try {
                const data = await fetchAbsenceById(absence.id); // Fetch the full absence details including files
                setSelectedAbsence({
                    ...data,
                    reason: data.reason,
                });
                setFiles(data.files || []); // Set files associated with the absence
                setDialogOpen(true);
            } catch (error) {
                console.error('Failed to fetch absence details:', error);
                showMessage(t('failed_to_fetch_absence_details'), 'error');
            }
        }
    };

    const handleSubmitProof = async () => {
        if (!selectedAbsence) return;

        try {
            // First, upload any new files
            if (uploadedFiles.length > 0) {
                await handleFileSubmit();
            }

            // Combine existing file IDs with newly uploaded file IDs
            const allFileIds = files.map((file) => file.id);

            // Assign all file IDs to the absence
            await assignFilesToAbsence(selectedAbsence.id, allFileIds);

            // Update the absence reason
            await updateAbsenceReason(selectedAbsence.id, selectedAbsence.reason);

            setSelectedAbsence(null);
            setFiles([]);
            setUploadedFiles([]);
            setDialogOpen(false);
            await fetchAbsences(page);
        } catch (error) {
            console.error('Failed to update absence:', error);

        }
    };

    const renderStatus = (status: any) => {
        if (status === null) return <Typography color="textSecondary">{t("pending")}</Typography>;
        if (status) return <Typography color="success.main">{t("accepted")}</Typography>;
        return <Typography color="error.main">{t("rejected")}</Typography>;
    };

    const formatGermanDate = (dateString: string) => {
        return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
    };

    return (
        <>
            <Tooltip arrow title={t("absences")}>
                <IconButton color="primary" ref={ref} onClick={handleOpen}>
                    <AbsencesBadge badgeContent={absences.filter(absence => absence.status === null).length}>
                        <EventBusyIcon />
                    </AbsencesBadge>
                </IconButton>
            </Tooltip>
            <Popover
                anchorEl={ref.current}
                onClose={handleClose}
                open={isOpen}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                PaperProps={{
                    sx: {
                        maxWidth: '400px', // Set maximum width for the Popover
                        width: '100%', // Ensure it doesn't exceed the viewport width
                    },
                }}
            >
                <Box sx={{ p: 2 }} display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" fontWeight="bold">{t("your_absences")}</Typography>
                </Box>
                <Divider />
                <List sx={{ p: 0 }}>
                    {absences.map((absence) => (
                        <ListItem key={absence.id} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <Box flex="1">
                                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium', mt: 1 }}>
                                    {t("class_session")}: <span style={{ fontWeight: 'bold' }}>{formatGermanDate(absence.classSessionDate)}</span>
                                </Typography>
                                {renderStatus(absence.status)}
                                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                                    {t("reported")}: <span style={{ fontWeight: 'bold' }}>{formatDistance(new Date(absence.date), new Date(), { addSuffix: true })}</span>
                                </Typography>
                            </Box>
                            <Tooltip title={t("edit_absence")}>
                                <IconButton onClick={() => handleEditAbsence(absence)} disabled={absence.status !== null}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>
                {absences.length >= limit * page && (
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                        <Button onClick={() => fetchAbsences(page + 1)} color="primary">
                            {t("see_more")}
                        </Button>
                    </Box>
                )}
            </Popover>

            {/* Dialog for editing absence */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t("edit_absence")}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={t("reason")}
                        fullWidth
                        margin="dense"
                        value={selectedAbsence?.reason || ''}
                        onChange={(e) => setSelectedAbsence({ ...selectedAbsence, reason: e.target.value })}
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">{t("select_existing_files")}:</Typography>
                        {/* MultiSelectWithCheckboxes for selecting existing files */}
                        <MultiSelectWithCheckboxes
                            label={t("select_files")}
                            fetchData={(query) => fetchSelfFiles(1, 5, query).then((data) => data.data)}
                            onSelect={handleFileSelection} // Update files state on selection
                            displayProperty="name"
                            placeholder={t("type_to_search_files")}
                            initialValue={files} // Set initial files from the current state
                        />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">{t("upload_new_files")}:</Typography>
                        {/* UploadSection for uploading new files */}
                        <UploadSection onUploadChange={handleFilesChange} />
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleFileSubmit}
                                disabled={loading || uploadedFiles.length === 0}
                                startIcon={loading && <CircularProgress size={20} />}
                            >
                                {loading ? t('uploading') : t('upload_files')}
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">{t("associated_files")}:</Typography>
                        <List>
                            {files.map((file, index) => (
                                <ListItem key={index}>
                                    {file.type?.startsWith('image') ? (
                                        <img src={file.path} alt={file.name} width={50} />
                                    ) : (
                                        <Typography variant="body2">{file.name}</Typography>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="secondary">
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleSubmitProof} color="primary" variant="contained">
                        {t("submit")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );

}

export default AbsenceNotifications;
