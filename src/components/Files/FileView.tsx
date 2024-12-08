import React from 'react';
import { Button } from '@mui/material';
import { downloadFile } from 'src/services/fileUploadService';
import { useTranslation } from 'react-i18next';

interface FileViewProps {
    fileId: any;
}
const FileView: React.FC<FileViewProps> = ({ fileId }) => {
    const { t } = useTranslation();

    const handleViewFile = async () => {
        try {
            const { url, contentType } = await downloadFile(fileId);

            // Define MIME types that can be opened in the browser
            const viewableTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'];

            if (viewableTypes.includes(contentType)) {
                // Open in a new tab if viewable
                window.open(url, '_blank');
            } else {
                // Trigger download if not viewable
                const link = document.createElement('a');
                link.href = url;
                link.download = 'downloaded-file'; // Specify a default file name
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error('Error viewing file:', error);
        }
    };

    return (
        <Button variant="text" color="secondary" onClick={handleViewFile}>
            {t('view')}
        </Button>
    );
};

export default FileView;
