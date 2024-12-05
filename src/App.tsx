import { useRoutes } from 'react-router-dom';
import router from 'src/router';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { CssBaseline } from '@mui/material';
import ThemeProviderWrapper from './theme/ThemeProvider'; // Use the correct ThemeProviderWrapper
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
      <ThemeProviderWrapper> 
        <SnackbarProvider> 
          <SessionProvider>
            <SessionExpirationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                {content}
                <AxiosInterceptorSetup />
              </LocalizationProvider>
            </SessionExpirationProvider>
          </SessionProvider>
        </SnackbarProvider>
      </ThemeProviderWrapper>
    </I18nextProvider>
  );
}

export default App;
