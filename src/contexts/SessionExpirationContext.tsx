import React, { createContext, useState, useContext } from 'react';
// import ReusableDialog from '../components/ReusableComponents/ReusableDialog';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import ReusableDialog from 'src/content/pages/Components/Dialogs';

interface SessionExpirationContextProps {
    triggerSessionExpiration: () => void;
}

const SessionExpirationContext = createContext<SessionExpirationContextProps | undefined>(undefined);

export const useSessionExpiration = () => {
    const context = useContext(SessionExpirationContext);
    if (!context) {
        throw new Error('useSessionExpiration must be used within a SessionExpirationProvider');
    }
    return context;
};

export const SessionExpirationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [isDialogOpen, setDialogOpen] = useState(false);

    const triggerSessionExpiration = () => {
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false); // Close the dialog
        navigate('/logout'); // Navigate to the login page (or logout page)
    };

    return (
        <SessionExpirationContext.Provider value={{ triggerSessionExpiration }}>
            {children}

            {/* Session Expired Dialog */}
            <ReusableDialog
                open={isDialogOpen}
                title="Session Expired"
                onClose={handleDialogClose} // Close dialog and navigate
                actions={
                    <Button onClick={handleDialogClose} color="primary">
                        Login
                    </Button>
                }
            >
                Your session has expired. Please log in again.
            </ReusableDialog>
        </SessionExpirationContext.Provider>
    );
};
