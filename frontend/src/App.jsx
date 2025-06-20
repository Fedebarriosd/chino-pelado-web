import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import AdminUsuarios from './pages/Admin';
import Stock from './pages/Stock';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import ReporteVentas from './pages/ReporteVentas';

export default function App() {
  // Obtiene { usuario, rol } desde localStorage, o null si no hay
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem('usuario'))
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* 1) Ruta pública de login: NO usa AdminLayout */}
        <Route path="/login" element={<Login onLogin={setUsuario} />} />

        {/* 2) Rutas usuario normal con sidebar */}
        <Route
          element={
            <ProtectedRoute usuario={usuario}>
              <UserLayout onLogout={() => setUsuario(null)} />
            </ProtectedRoute>
          }
        >
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/stock"   element={<Stock />} />
        </Route>


        {/* 3) Rutas de Admin: todas bajo /admin, dentro de AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute usuario={usuario} requiereAdmin>
              <AdminLayout onLogout={() => setUsuario(null)} />
            </ProtectedRoute>
          }
        >
          {/* /admin → Gestión de usuarios */}
          <Route index element={<AdminUsuarios />} />
          {/* /admin/stock → Gestión de stock */}
          <Route path="stock" element={<Stock />} />
          {/* /admin/pedidos → Reutiliza tu Pedidos original */}
          <Route path="pedidos" element={<Pedidos />} />
          {/* /admin/reporte-ventas → Nuevo reporte de ventas */}
          <Route path="reporte-ventas" element={<ReporteVentas />} />
        </Route>

        {/* 4) Cualquier otra URL redirige a /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
