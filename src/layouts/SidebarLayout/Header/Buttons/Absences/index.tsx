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
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { format, formatDistance, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { getSelfAbsences, fetchAbsenceById, assignFilesToAbsence, updateAbsenceReason } from 'src/services/absence';
import MultiSelectWithCheckboxes from 'src/components/SearchBars/MultiSelectWithCheckboxes';
import { fetchSelfFiles } from 'src/services/fileUploadService';

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
    const ref = useRef(null);
    const [isOpen, setOpen] = useState(false);
    const [absences, setAbsences] = useState([]);
    const [selectedAbsence, setSelectedAbsence] = useState(null);
    const [files, setFiles] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 5;

    const handleOpen = async () => {
        setOpen(true);
        await fetchAbsences(1);
    };

    useEffect(() => {
        fetchAbsences(1);
      }, []);

      
    const fetchAbsences = async (pageNumber) => {
        try {
            const data = await getSelfAbsences(pageNumber, limit);
            setAbsences((prevAbsences) => (pageNumber === 1 ? data.data : [...prevAbsences, ...data.data]));
            console.log(data)
            setPage(pageNumber);
        } catch (error) {
            console.error('Failed to fetch absences:', error);
        }
    };

    const handleClose = () => setOpen(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const handleEditAbsence = async (absence) => {
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
            }
        }
    };

    const handleSubmitProof = async () => {
        if (!selectedAbsence) return;

        try {
            const fileIds = files.map((file) => file.id); // Get IDs of selected files
            await assignFilesToAbsence(selectedAbsence.id, fileIds);
            await updateAbsenceReason(selectedAbsence.id, selectedAbsence.reason); 
            setSelectedAbsence(null);
            setFiles([]);
            setDialogOpen(false);
            await fetchAbsences(page);
        } catch (error) {
            console.error('Failed to update absence:', error);
        }
    };

    const renderStatus = (status) => {
        if (status === null) return <Typography color="textSecondary">Pending</Typography>;
        if (status) return <Typography color="success.main">Accepted</Typography>;
        return <Typography color="error.main">Rejected</Typography>;
    };

    const formatGermanDate = (dateString) => {
        return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: de });
    };

    return (
        <>
            <Tooltip arrow title="Absences">
                <IconButton color="primary" ref={ref} onClick={handleOpen}>
                    <AbsencesBadge badgeContent={ absences.filter(absence => absence.status === null).length}>
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
                    <Typography variant="h5" fontWeight="bold">Your Absences</Typography>
                </Box>
                <Divider />
                <List sx={{ p: 0 }}>
                    {absences.map((absence) => (
                        <ListItem key={absence.id} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                            <Box flex="1">
                                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium', mt: 1 }}>
                                    Class Session: <span style={{ fontWeight: 'bold' }}>{formatGermanDate(absence.classSessionDate)}</span>
                                </Typography>
                                {renderStatus(absence.status)}
                                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                                    Reported: <span style={{ fontWeight: 'bold' }}>{formatDistance(new Date(absence.date), new Date(), { addSuffix: true })}</span>
                                </Typography>
                            </Box>
                            <Tooltip title="Edit Absence">
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
                            See More
                        </Button>
                    </Box>
                )}
            </Popover>

            {/* Dialog for editing absence */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Absence</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Reason"
                        fullWidth
                        margin="dense"
                        value={selectedAbsence?.reason || ''}
                        onChange={(e) => setSelectedAbsence({ ...selectedAbsence, reason: e.target.value })}
                    />

                    <Typography sx={{ mt: 2 }}></Typography>
                    <MultiSelectWithCheckboxes
                        label="Select Files"
                        fetchData={(query) => fetchSelfFiles(1, 5, query).then((data) => data.data)}
                        onSelect={(selectedFiles) => setFiles(selectedFiles)} // Update files state on selection
                        displayProperty="name"
                        placeholder="Type to search files"
                        initialValue={files} // Set initial files from the current state
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">Files:</Typography>
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
                        Cancel
                    </Button>
                    <Button onClick={handleSubmitProof} color="primary" variant="contained">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AbsenceNotifications;
