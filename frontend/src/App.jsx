import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login          from './pages/Login';
import Pedidos        from './pages/Pedidos';      // tu Pedidos original
import AdminUsuarios  from './pages/Admin';        // módulo Usuarios
import Stock          from './pages/Stock';        // módulo Stock
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout    from './layouts/AdminLayout';

export default function App() {
  // Obtiene { usuario, rol } desde localStorage, o null si no hay
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  return (
    <BrowserRouter>
      <Routes>
        {/* 1) Ruta pública de login: NO usa AdminLayout */}
        <Route path="/login" element={<Login />} />

        {/* 2) Ruta de Pedidos para usuario normal: fuera de AdminLayout */}
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute usuario={usuario}>
              <Pedidos />
            </ProtectedRoute>
          }
        />

        {/* 3) Rutas de Admin: todas bajo /admin, dentro de AdminLayout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute usuario={usuario} requiereAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* /admin → Gestión de usuarios */}
          <Route index element={<AdminUsuarios />} />
          {/* /admin/stock → Gestión de stock */}
          <Route path="stock" element={<Stock />} />
          {/* /admin/pedidos → Reutiliza tu Pedidos original */}
          <Route path="pedidos" element={<Pedidos />} />
        </Route>

        {/* 4) Cualquier otra URL redirige a /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
