import {
  alpha,
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Popover,
  Tooltip,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate'; // Use a translate icon for localization
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook for i18next

function HeaderLocalization() {
  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  const { i18n } = useTranslation(); // Access i18n instance from useTranslation hook
  const [language, setLanguage] = useState<string>(i18n.language); // Current language
  const [, setForceRender] = useState(false); // This is just to force re-render

  // Available languages for selection
  const availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'German' },
    { code: 'fr', label: 'French' }
  ];

  // Load language preference from localStorage when component mounts
  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage); // Set the saved language
      setLanguage(savedLanguage); // Update the language state
    }

    // Re-render on language change
    i18n.on('languageChanged', () => {
      setForceRender((prev) => !prev); // Force a re-render when language changes
    });

    // Cleanup listener when component unmounts
    return () => {
      i18n.off('languageChanged');
    };
  }, [i18n]);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleLanguageChange = async (event: SelectChangeEvent<string>) => {
    const selectedLanguage = event.target.value;
    await i18n.changeLanguage(selectedLanguage); // Change the language in i18n
    setLanguage(selectedLanguage); // Update local state
    localStorage.setItem('appLanguage', selectedLanguage); // Persist the selected language
  };

  return (
    <>
      <Tooltip arrow title="Change Language">
        <IconButton color="primary" ref={ref} onClick={handleOpen}>
          <TranslateIcon />
        </IconButton>
      </Tooltip>

      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Box
          sx={{ p: 2 }}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h5">Select Language</Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
          <ListItem
            sx={{ p: 2, minWidth: 200, display: { xs: 'block', sm: 'flex' } }}
          >
            <Select
              labelId="language-select-label"
              id="language-select"
              value={language}
              onChange={handleLanguageChange} // Handle language change
              fullWidth
              variant="outlined"
            >
              {availableLanguages.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </ListItem>
        </List>
      </Popover>
    </>
  );
}

export default HeaderLocalization;
