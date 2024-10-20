import { useRoutes } from 'react-router-dom';
import router from 'src/router';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { CssBaseline } from '@mui/material';
import ThemeProvider from './theme/ThemeProvider';
import { SessionExpirationProvider } from './contexts/SessionExpirationContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

function App() {
  const content = useRoutes(router);

  return (
    <I18nextProvider i18n={i18n}>
    <SessionExpirationProvider>
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        {content}
      </LocalizationProvider> 
    </ThemeProvider>
    </SessionExpirationProvider>
    </I18nextProvider>

  );
}
export default App;
