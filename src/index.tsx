import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import 'nprogress/nprogress.css';
import App from 'src/App';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import * as serviceWorker from 'src/serviceWorker';
import { WebSocketProvider } from './utils/webSocketProvider';
import { HeaderMenuProvider } from './components/Calendar/Components/CustomizedCalendar/HeaderMenuContext';

ReactDOM.render(
  <WebSocketProvider>
    <HelmetProvider>
      <HeaderMenuProvider>
        <SidebarProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SidebarProvider>
      </HeaderMenuProvider>
    </HelmetProvider>
  </WebSocketProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
