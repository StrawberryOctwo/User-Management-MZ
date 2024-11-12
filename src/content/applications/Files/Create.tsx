import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useSnackbar } from 'src/contexts/SnackbarContext';
import { addDocument, addUserDocument } from 'src/services/fileUploadService';
import UploadSection from 'src/components/Files/UploadDocuments';

export default function FileUploadPage() {
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { showMessage } = useSnackbar();

    // Handler to update files when selected
    const handleFilesChange = (files: any[]) => {
        setUploadedFiles(files);
    };

    // Submit selected files to the server
    const handleFileSubmit = async () => {
        if (uploadedFiles.length === 0) {
            showMessage('No files selected for upload', 'error');
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

            showMessage('Files uploaded successfully', 'success');
            setUploadedFiles([]); // Clear files after successful upload
        } catch (error) {
            console.error('Error uploading files:', error);
            showMessage('Error uploading files', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 4 }}>
            <UploadSection onUploadChange={handleFilesChange} />
            <Button
                variant="contained"
                color="primary"
                onClick={handleFileSubmit}
                disabled={loading || uploadedFiles.length === 0}
            >
                {loading ? 'Uploading...' : 'Upload Files'}
            </Button>
        </Box>
    );
}
