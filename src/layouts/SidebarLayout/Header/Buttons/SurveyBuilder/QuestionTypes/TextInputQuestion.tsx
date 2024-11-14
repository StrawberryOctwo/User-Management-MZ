// TextInputQuestion.tsx
import { Box, Typography, TextField } from '@mui/material';

function TextInputQuestion({ question, onChange }) {
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
      <Typography variant="body2" color="textSecondary">
        Answer: User will enter a free-text response
      </Typography>
    </Box>
  );
}

export default TextInputQuestion;
