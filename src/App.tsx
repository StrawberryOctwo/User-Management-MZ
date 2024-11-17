import { useRoutes } from 'react-router-dom';
import router from 'src/router';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { CssBaseline } from '@mui/material';
import ThemeProvider from './theme/ThemeProvider';
import { SessionExpirationProvider } from './contexts/SessionExpirationContext';
import { SnackbarProvider } from './contexts/SnackbarContext'; // Import SnackbarProvider
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AxiosInterceptorSetup } from './services/useAxiosSetup';
import { SessionProvider } from './components/Calendar/Components/SessionContext';

function App() {
  const content = useRoutes(router);

  return (
    <I18nextProvider i18n={i18n}>
      <SnackbarProvider>
        {' '}
        {/* Wrap app with SnackbarProvider */}
        <SessionProvider>
          <SessionExpirationProvider>
            <ThemeProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                {content}
                <AxiosInterceptorSetup /> {/* Setup Axios Interceptors */}
              </LocalizationProvider>
            </ThemeProvider>
          </SessionExpirationProvider>
        </SessionProvider>
      </SnackbarProvider>
    </I18nextProvider>
  );
}

export default App;
