import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Button
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

function HeaderLocalization() {
  const ref = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'German' },
    { code: 'fr', label: 'French' }
  ];

  useEffect(() => {
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
      setLanguage(savedLanguage);
    }
  }, [i18n]);

  const handleOpen = (event) => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLanguageChange = async (selectedLanguage) => {
    await i18n.changeLanguage(selectedLanguage);
    setLanguage(selectedLanguage);
    localStorage.setItem('appLanguage', selectedLanguage);
    window.location.reload();
    handleClose();
  };

  return (
    <>
      <Button
        color="primary"
        ref={ref}
        onClick={handleOpen}
        fullWidth
        startIcon={<TranslateIcon />}
      >
        {availableLanguages.find((lang) => lang.code === language)?.label}
      </Button>

      <Menu
        anchorEl={ref.current}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">{t("select_language")}</Typography>
        </Box>
        <Divider />
        <List>
          {availableLanguages.map((lang) => (
            <ListItem
              button
              key={lang.code}
              selected={lang.code === language}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <Typography variant="body1">{lang.label}</Typography>
            </ListItem>
          ))}
        </List>
      </Menu>
    </>
  );
}

export default HeaderLocalization;
