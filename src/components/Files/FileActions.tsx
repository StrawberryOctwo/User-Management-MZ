import React from 'react';
import { Button } from '@mui/material';
import { downloadFile } from 'src/services/fileUploadService';
import { useTranslation } from 'react-i18next';

interface FileActionsProps {
  fileId: any;
  fileName: string;
}

const FileActions: React.FC<FileActionsProps> = ({ fileId, fileName }) => {
    const { t } = useTranslation();
    const handleFileAction = async (action: 'view' | 'download') => {
        try {
            const { url, contentType } = await downloadFile(fileId);

      // Define MIME types that can be opened in the browser
      const viewableTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'text/plain'
      ];

      if (action === 'view' && viewableTypes.includes(contentType)) {
        // Open in a new tab if viewable
        window.open(url, '_blank');
      } else {
        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Use specified file name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Cleanup
      }
    } catch (error) {
      console.error(`Error ${action}ing file:`, error);
    }
  };

  return (
    <>
      <Button
        variant="text"
        color="secondary"
        onClick={() => handleFileAction('view')}
      >
        {t('view')}
      </Button>
      <Button
        variant="text"
        color="primary"
        onClick={() => handleFileAction('download')}
      >
        {t('download')}
      </Button>
    </>
  );
};

export default FileActions;
