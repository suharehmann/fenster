import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar/Navbar';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import ContactPage from '@/pages/ContactPage';
import ConfiguratorPage from '@/pages/ConfiguratorPage';
import AdminPage from '@/pages/AdminPage';
import WindowConfigurator from '@/components/WindowConfigurator/WindowConfigurator';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="content-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/konfigurator" element={<ConfiguratorPage />} />
          <Route path="/konfigurator-v2" element={<WindowConfigurator />} />
          <Route path="/leistungen" element={<ServicesPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
