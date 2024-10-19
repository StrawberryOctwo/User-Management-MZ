import { api } from './api';

// Backup the database
export const backupDatabase = async () => {
    try {
        const response = await api.get('/backup', {
            responseType: 'blob'  // Set responseType as 'blob' to handle the file download
        });

        // Create a link to download the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'newbackup.backup'); // Set the default file name for the backup
        document.body.appendChild(link);
        link.click();
        link.remove();

        return response.data;
    } catch (error) {
        console.error('Error backing up the database:', error);
        throw error;
    }
};

// Restore the database
export const restoreDatabase = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('backupFile', file); // Append the uploaded backup file

        const response = await api.post('/restore', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error restoring the database:', error);
        throw error;
    }
};
