import React, { useState, useEffect } from 'react';
import { Box, Button, Grid, TextField, MenuItem, Typography, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { deleteFiles } from '../../services/fileUploadService';
import { t } from 'i18next';
import ReusableDialog from 'src/content/pages/Components/Dialogs';
import FileView from './FileView';

interface UploadedFile {
    id?: number;  // `id` is optional because a file might not be saved yet
    file: File | null;
    fileName: string;
    fileType: string;
    path?: string;
}

interface UploadSectionProps {
    onUploadChange: (files: UploadedFile[]) => void;
    initialDocuments?: UploadedFile[];
}

const UploadSection: React.FC<UploadSectionProps> = ({ onUploadChange, initialDocuments = [] }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialDocuments);
    const [openDialog, setOpenDialog] = useState(false); // Dialog state
    const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null); // File to delete

    useEffect(() => {
        if (initialDocuments.length > 0) {
            setUploadedFiles(initialDocuments);
        }
    }, [initialDocuments]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!selectedFile || !fileName || !fileType) {
            alert('Please select a file, set a name, and choose a type.');
            return;
        }

        const newFile: UploadedFile = {
            file: selectedFile,
            fileName,
            fileType,
        };

        const updatedFiles = [...uploadedFiles, newFile];
        setUploadedFiles(updatedFiles);
        onUploadChange(updatedFiles);

        // Reset after uploading
        setSelectedFile(null);
        setFileName('');
        setFileType('');
    };

    const handleDelete = (index: number) => {
        const file = uploadedFiles[index];
        if (file.id) {
            // File has an ID, meaning it is already saved in the DB -> show the confirmation dialog
            setFileToDelete(file); // Set the file to delete
            setOpenDialog(true); // Open the confirmation dialog
        } else {
            // File doesn't have an ID -> delete it directly without showing the dialog
            const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
            setUploadedFiles(updatedFiles);
            onUploadChange(updatedFiles);
        }
    };

    const confirmDelete = async () => {
        if (fileToDelete && fileToDelete.id) {
            try {
                // Call the deleteFiles function from the service
                await deleteFiles([fileToDelete.id]);

                // Remove the file from the state after successful deletion
                const updatedFiles = uploadedFiles.filter((file) => file.id !== fileToDelete.id);
                setUploadedFiles(updatedFiles);
                onUploadChange(updatedFiles);
                alert('File deleted successfully');
            } catch (error) {
                console.error('Error deleting file:', error);
                alert('Error deleting file');
            }
        }

        // Close the dialog and reset the state
        setOpenDialog(false);
        setFileToDelete(null);
    };

    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Grid container spacing={6}>
                <Grid item xs={12} sm={6}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<UploadFileIcon />}
                            >
                                Select File
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <TextField
                                label={t("file_name")}
                                fullWidth
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                placeholder="Enter file name"
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <TextField
                                label={t("file_type")}
                                select
                                fullWidth
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value)}
                                placeholder="Select file type"
                            >
                                <MenuItem value="fee_agreement">{t('fee_agreement')}</MenuItem>
                                <MenuItem value="affidavit">{t('affidavit')}</MenuItem>
                                <MenuItem value="confidentiality_agreement">{t('confidentiality_agreement')}</MenuItem>
                                <MenuItem value="non_compete_agreement">{t('non_compete_agreement')}</MenuItem>
                                <MenuItem value="contract">{t('contract')}</MenuItem>
                                <MenuItem value="absence">{t('absence')}</MenuItem>

                            </TextField>
                        </Grid>

                        <Grid container item xs={12} justifyContent="space-between" alignItems="center">
                            <Grid item xs={9}>
                                {selectedFile && (
                                    <Typography variant="body2">
                                        File: {selectedFile.name}
                                    </Typography>
                                )}
                            </Grid>
                            <Grid item xs={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleUpload}
                                    fullWidth
                                >
                                    Upload File
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} sm={5} sx={{ mx: 'auto' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Uploaded Files
                    </Typography>
                    {uploadedFiles.length > 0 ? (
                        <Box>
                            <List>
                                {uploadedFiles.map((uploadedFile, index) => (
                                    <Box key={index}>
                                        <Divider />
                                        <ListItem>
                                            <ListItemText
                                                primary={uploadedFile.fileName}
                                                secondary={`Type: ${uploadedFile.fileType}`}
                                            />
                                            {/* Use FileView component */}
                                            {uploadedFile.path && (
                                                <FileView fileId={uploadedFile.id} />
                                            )}
                                            <ListItemSecondaryAction>
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(index)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    </Box>
                                ))}
                            </List>
                        </Box>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '80%',
                            minHeight: '150px',
                        }}>
                            <Typography variant="body2" color="textSecondary">
                                No files selected
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* Reusable Dialog for confirming deletion */}
            <ReusableDialog
                open={openDialog}
                title="Confirm Deletion"
                onClose={() => setOpenDialog(false)}
                actions={
                    <>
                        <Button onClick={() => setOpenDialog(false)}>{t("(cancel")}</Button>
                        <Button color="error" onClick={confirmDelete}>{t("delete")}</Button>
                    </>
                }
            >
                <Typography>
                    {t("are_you_sure_you_want_to_delete_this_file?")}
                </Typography>
            </ReusableDialog>
        </Box>
    );
};

export default UploadSection;
