import React from 'react';
import { Button } from '@mui/material';
import { t } from 'i18next';
import { Cookies } from 'react-cookie';

// Create an instance of Cookies to retrieve the token
const cookies = new Cookies();

interface FileViewProps {
    fileId: any;
}

const FileView: React.FC<FileViewProps> = ({ fileId }) => {
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


    return (
        <>
            <Button variant="text" color="secondary" onClick={handleViewFile}>
                {t('view')}
            </Button>
        </>
    );
};

export default FileView;
