// CheckboxQuestion.tsx
import { Box, Typography, Checkbox, TextField, IconButton, List, ListItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function CheckboxQuestion({ question, onChange }) {
  const addCheckboxOption = () => {
    onChange({ ...question, options: [...(question.options || []), ''] });
  };

  const updateCheckboxOption = (index, value) => {
    const options = [...question.options];
    options[index] = value;
    onChange({ ...question, options });
  };

  const removeCheckboxOption = (index) => {
    const options = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options });
  };

  return (
    <Box p={2}>
      <Typography variant="body1">Question:</Typography>
      <TextField
        fullWidth
        placeholder="Enter your question here"
        value={question.text}
        onChange={(e) => onChange({ ...question, text: e.target.value })}
        sx={{ mb: 2 }}
      />

      <Typography variant="body2" sx={{ mb: 1 }}>
        Checkbox Options:
      </Typography>
      <List>
        {question.options?.map((option, index) => (
          <ListItem key={index} sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox disabled />
            <TextField
              fullWidth
              placeholder="Option"
              value={option}
              onChange={(e) => updateCheckboxOption(index, e.target.value)}
              sx={{ mr: 1 }}
            />
            <IconButton onClick={() => removeCheckboxOption(index)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <IconButton onClick={addCheckboxOption} size="small">
        <AddIcon /> Add Option
      </IconButton>
    </Box>
  );
}

export default CheckboxQuestion;
