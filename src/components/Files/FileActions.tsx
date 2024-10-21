import React from 'react';
import { Button } from '@mui/material';
import { t } from 'i18next';
import { Cookies } from 'react-cookie';

// Create an instance of Cookies to retrieve the token
const cookies = new Cookies();

interface FileActionsProps {
    fileId: any;
    fileName: string;
}

const FileActions: React.FC<FileActionsProps> = ({ fileId, fileName }) => {
    // Function to get the token from cookies
    const getToken = () => {
        return cookies.get('token');
    };

    const handleViewFile = async () => {
        const token = getToken();
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3003/api/files/download/${fileId}?action=view`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url); // Open the blob URL in a new tab
            } else {
                console.error('Failed to view file', response.status);
            }
        } catch (error) {
            console.error('Error viewing file:', error);
        }
    };

    const handleDownloadFile = async () => {
        const token = getToken();
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        try {
            const response = await fetch(`http://localhost:3003/api/files/download/${fileId}?action=download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName); // Set the download file name
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link); // Clean up after download
            } else {
                console.error('Failed to download file', response.status);
            }
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    return (
        <>
            <Button variant="text" color="secondary" onClick={handleViewFile}>
                {t('view')}
            </Button>
            <Button variant="text" color="primary" onClick={handleDownloadFile}>
                {t('download')}
            </Button>
        </>
    );
};

export default FileActions;
