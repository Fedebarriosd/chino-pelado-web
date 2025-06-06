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
        {/* 1) Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* 2) Ruta de Pedidos para usuario normal (si la tienes) */}
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute usuario={usuario}>
              <Pedidos />
            </ProtectedRoute>
          }
        />

        {/* 3) Bloque de rutas para admin, todas bajo /admin/* */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute usuario={usuario} requiereAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* 
            Rutas hijas de /admin/* 
            3.a) /admin            → AdminUsuarios (Gestión de usuarios) 
            3.b) /admin/stock      → Stock (Gestión de stock) 
            3.c) /admin/pedidos    → Pedidos (reutiliza tu Pedidos original)
          */}
          <Route index element={<AdminUsuarios />} />
          <Route path="stock" element={<Stock />} />
          <Route path="pedidos" element={<Pedidos />} />
        </Route>

        {/* 4) Cualquier otra URL redirige a /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
