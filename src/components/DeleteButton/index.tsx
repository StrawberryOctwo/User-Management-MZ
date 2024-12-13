import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';
import { t } from "i18next"
export default function DeleteButtonWithConfirmation({ onDelete }: { onDelete: () => void }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirmDelete = () => {
        onDelete();  // Call the delete function
        setOpen(false);
    };

    return (
        <>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, cursor: 'pointer' }}>
                <Button onClick={handleClickOpen}>{t("delete")}</Button>
            </Typography>

            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this item? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t("cancel")}
                    </Button>
                    <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
