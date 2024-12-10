import React from 'react';
import { TextField, Box } from '@mui/material';
import { t } from 'i18next';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, placeholder = t("search_bar") }) => {
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
