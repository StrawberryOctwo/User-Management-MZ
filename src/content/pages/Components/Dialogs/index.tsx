// ReusableComponents/ReusableDialog.tsx

import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface ReusableDialogProps {
    open: boolean;
    title?: string;
    children?: React.ReactNode; // Custom content
    actions?: React.ReactNode;  // Custom actions
    onClose: () => void;
}

const ReusableDialog: React.FC<ReusableDialogProps> = ({ open, title, children, actions, onClose }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="dialog-title"
        >
            {title && <DialogTitle id="dialog-title">{title}</DialogTitle>}
            <DialogContent>
                {children}
            </DialogContent>
            {actions && (
                <DialogActions>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ReusableDialog;
