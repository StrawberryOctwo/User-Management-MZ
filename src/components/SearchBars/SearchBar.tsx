import React from 'react';
import { TextField, Box } from '@mui/material';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, placeholder = "Search..." }) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <Box sx={{ padding: '16px' }}>
      <TextField
        label={placeholder}
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
      />
    </Box>
  );
};

export default SearchBar;
