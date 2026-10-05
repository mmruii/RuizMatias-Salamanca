import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { NotificationProvider } from './components/Notifications.jsx';
import { ProductsProvider } from './components/ProductsProvider.jsx';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/mulish';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <ProductsProvider>
          <App />
        </ProductsProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
