import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { NotificationProvider } from './components/Notifications.jsx';
import { ProductsProvider } from './components/ProductsProvider.jsx';
import { AdminProvider } from './components/AdminProvider.jsx';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/mulish';
import './styles/global.css';
import './styles/admin.css';
import './styles/panel.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AdminProvider>
          <ProductsProvider>
            <App />
          </ProductsProvider>
        </AdminProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
