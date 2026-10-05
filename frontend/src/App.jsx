import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AdminGate from './components/AdminGate.jsx';
import HomePage from './pages/HomePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ManagePage from './pages/ManagePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="nosotros" element={<AboutPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route
          path="panel-de-control"
          element={
            <AdminGate>
              <ManagePage />
            </AdminGate>
          }
        />
        <Route
          path="api/products"
          element={
            <AdminGate>
              <ManagePage />
            </AdminGate>
          }
        />
        <Route path="gestion" element={<Navigate to="/panel-de-control" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
