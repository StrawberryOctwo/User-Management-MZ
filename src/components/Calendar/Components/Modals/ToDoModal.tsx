import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { t } from 'i18next';

type ToDoModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (todo: { title: string; description: string }) => void;
};

export default function ToDoModal({ isOpen, onClose, onSave }: ToDoModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        onSave({ title, description });
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add a New To-Do</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label={t("(title")}
                    type="text"
                    fullWidth
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label={t("description")}
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("(cancel")}</Button>
                <Button onClick={handleSave} variant="contained" color="primary">{t("(save")}</Button>
            </DialogActions>
        </Dialog>
    );
}
