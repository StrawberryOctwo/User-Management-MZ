import React, { useState } from 'react';
import { Box, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { createToDo } from 'src/services/todoService';
import { useTranslation } from 'react-i18next';

interface AddToDoFormProps {
    onAdd: () => void;
}

const AddToDoForm: React.FC<AddToDoFormProps> = ({ onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [dueDate, setDueDate] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { t } = useTranslation(); 
    const handleAddToDo = async () => {
        if (!title || !dueDate) {
            setErrorMessage('ToDo title and due date are required.');
            return;
        }
        await createToDo({
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
        });

        onAdd();
        handleReset();
    };

    const handleReset = () => {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setDueDate('');
        setErrorMessage(null);
    };

    return (
        <Box mt={2}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        label={t("(title")}
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label={t("description")}
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        label="Due Date"
                        type="date"
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Priority</InputLabel>
                        <Select
                            label="Priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button onClick={handleAddToDo} color="primary" variant="contained">
                    {t("(save")} ToDo
                </Button>
            </Box>
            {errorMessage && <Box mt={1} color="error.main">{errorMessage}</Box>}
        </Box>
    );
};

export default AddToDoForm;
