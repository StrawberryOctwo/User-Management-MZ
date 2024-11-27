import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, Button,
    TextField, Typography, MenuItem, Select, FormControl,
    InputLabel, SelectChangeEvent, Switch, FormControlLabel, Box,
    IconButton, List, ListItem, Paper
} from '@mui/material';
import { getAbsenceDetails, createAbsence, deleteAbsence, updateAbsenceStatus } from 'src/services/absence';
import { calendarsharedService } from '../../CalendarSharedService';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PreviewIcon from '@mui/icons-material/Visibility';
import { downloadFile } from 'src/services/fileUploadService';

interface AbsenceTabProps {
    classSessionId: string;
    isOpen: boolean;
    student: any;
    onClose: () => void;
}

const AbsenceTab: React.FC<AbsenceTabProps> = ({ classSessionId, isOpen, student, onClose }) => {
    const [reason, setReason] = useState<string>('');
    const [status, setStatus] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [absenceId, setAbsenceId] = useState<number | null>(null);
    const [isStatusEditable, setIsStatusEditable] = useState(true);
    const [confirmStatusChange, setConfirmStatusChange] = useState(false);
    const [originalStatus, setOriginalStatus] = useState<boolean | null>(null);
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && student) {
            setLoading(true);
            getAbsenceDetails(student.id, classSessionId)
                .then((data) => {
                    if (data && data.absences?.length) {
                        const absence = data.absences[0];
                        setReason(absence.reason || '');
                        setStatus(absence.status ?? null);
                        setOriginalStatus(absence.status ?? null);
                        setAbsenceId(absence.absenceId);
                        setFiles(absence.files || []);
                        setIsStatusEditable(!(absence.status !== null || !absence.reason));
                    } else {
                        resetForm();
                    }
                })
                .catch((error) => console.error('Failed to fetch absence details:', error))
                .finally(() => setLoading(false));
        } else {
            resetForm();
        }
    }, [isOpen, student, classSessionId]);

    const resetForm = () => {
        setReason('');
        setStatus(null);
        setOriginalStatus(null);
        setAbsenceId(null);
        setIsStatusEditable(true);
        setFiles([]);
    };

    const handleToggleAbsent = async () => {
        // setLoading(true);
        try {
            if (absenceId) {
                await deleteAbsence(absenceId);
                resetForm();
                calendarsharedService.emit('absenceUpdated');
            } else {
                const newAbsence = await createAbsence(student.id, Number(classSessionId));
                getAbsenceDetails(student.id, classSessionId)
                    .then((data) => {
                        if (data && data.absences?.length) {
                            const absence = data.absences[0];
                            setReason(absence.reason || '');
                            setStatus(absence.status ?? null);
                            setOriginalStatus(absence.status ?? null);
                            setAbsenceId(absence.absenceId);
                            setFiles(absence.files || []);
                            setIsStatusEditable(!(absence.status !== null || !absence.reason));
                        }
                    })
                    .catch((error) => console.error('Failed to fetch absence details:', error));
                calendarsharedService.emit('absenceUpdated');
            }
        } catch (error) {
            console.error('Failed to toggle absence:', error);
        } finally {
            // setLoading(false);
        }
    };


    const handleStatusChange = (event: SelectChangeEvent) => {
        const newStatus = event.target.value === 'true' ? true : event.target.value === 'false' ? false : null;
        setStatus(newStatus);
        setIsStatusEditable(newStatus === null && Boolean(reason));

        if (newStatus !== null) {
            setConfirmStatusChange(true);
        }
    };

    const handlePreviewFile = async (fileId: number) => {
        try {
            const { url } = await downloadFile(fileId);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to preview file:', error);
        }
    };

    const confirmStatusUpdate = async () => {
        try {
            await updateAbsenceStatus(absenceId!, status);
            setOriginalStatus(status);
            calendarsharedService.emit('absenceUpdated');
        } catch (error) {
            console.error('Failed to update absence status:', error);
        }
        setConfirmStatusChange(false);
    };

    const cancelStatusChange = () => {
        setStatus(originalStatus);
        setConfirmStatusChange(false);
        setIsStatusEditable(true);
    };

    return (
        <Dialog
            open={isOpen}
            onClose={() => {
                onClose();
                resetForm();
            }}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    overflowY: 'visible', // Allow content overflow
                    display: 'flex',      // Ensure proper flex behavior
                    flexDirection: 'column',
                },
            }}
        >
            <DialogTitle>
                {absenceId
                    ? `Edit Absence for ${student?.user.firstName} ${student?.user.lastName}`
                    : `Add Absence for ${student?.user.firstName} ${student?.user.lastName}`}
            </DialogTitle>
            <DialogContent
                sx={{
                    mt: 2,
                    overflowY: 'visible', // Ensure no scrollbars appear
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,               // Add spacing between elements
                }}
            >
                {loading ? (
                    <Typography>Loading absence data...</Typography>
                ) : (
                    <>
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            width="100%"
                        >
                            <Typography
                                variant="h6"
                                color={absenceId ? 'error.main' : 'success.main'}
                                sx={{ flexShrink: 0 }}
                            >
                                {student?.user.firstName} {student?.user.lastName} is
                                currently:
                            </Typography>
                            <Box display="flex" alignItems="center" flexShrink={0}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={Boolean(absenceId)}
                                            onChange={handleToggleAbsent}
                                            color={absenceId ? 'error' : 'success'}
                                        />
                                    }
                                    label={
                                        <Typography
                                            sx={{
                                                fontWeight: 'bold',
                                                color: absenceId
                                                    ? 'error.main'
                                                    : 'success.main',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {absenceId ? 'Absent' : 'Present'}
                                        </Typography>
                                    }
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                            </Box>
                        </Box>

                        {absenceId ? (
                            reason !== "" ? (
                                <>
                                    <TextField
                                        label="Reason for Absence"
                                        value={reason}
                                        fullWidth
                                        sx={{ mb: 1 }}
                                        disabled
                                    />
                                    <FormControl fullWidth sx={{ mb: 1 }}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            label="Status"
                                            value={
                                                status === null
                                                    ? ''
                                                    : status
                                                        ? 'true'
                                                        : 'false'
                                            }
                                            onChange={handleStatusChange}
                                            disabled={!isStatusEditable}
                                        >
                                            <MenuItem value="true">Accepted</MenuItem>
                                            <MenuItem value="false">Rejected</MenuItem>
                                            <MenuItem value="">
                                                Awaiting Student Proof
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ mt: 1 }}
                                    >
                                        Files:
                                    </Typography>
                                    <List>
                                        {files.length > 0 ? (
                                            files.map((file) => (
                                                <ListItem key={file.id} sx={{ p: 0 }}>
                                                    <Paper
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            p: 1,
                                                            width: '100%',
                                                            borderRadius: 1,
                                                            boxShadow: 1,
                                                            mb: 1,
                                                            backgroundColor: 'grey.100',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                flex: 1,
                                                                ml: 1,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {file.name}
                                                        </Typography>
                                                        <IconButton
                                                            onClick={() =>
                                                                handlePreviewFile(file.id)
                                                            }
                                                            color="primary"
                                                            aria-label="preview"
                                                        >
                                                            <PreviewIcon />
                                                        </IconButton>
                                                    </Paper>
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                color="textSecondary"
                                            >
                                                No files attached to this absence.
                                            </Typography>
                                        )}
                                    </List>
                                </>
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ mt: 2 }}
                                >
                                    Awaiting reasoning from student...
                                </Typography>
                            )
                        ) : null}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onClose();
                        resetForm();
                    }}
                    color="secondary"
                >
                    Cancel
                </Button>
            </DialogActions>

            {confirmStatusChange && (
                <Dialog open={confirmStatusChange} onClose={cancelStatusChange} maxWidth="xs" fullWidth>
                    <DialogTitle>
                        <WarningAmberIcon fontSize="large" color="error" sx={{ verticalAlign: 'middle', mr: 1 }} />
                        Confirm Status Change
                    </DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to {status === true ? "accept" : "reject"} this absence?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={cancelStatusChange} color="secondary">Cancel</Button>
                        <Button onClick={confirmStatusUpdate} color="primary" variant="contained">
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Dialog>

    );
};

export default AbsenceTab;
