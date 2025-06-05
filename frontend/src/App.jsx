import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login    from './pages/Login'
import Pedidos  from './pages/Pedidos'
import Admin    from './pages/Admin'   // corresponde a /admin
import Stock    from './pages/Stock'   // corresponde a /admin/stock
import ProtectedRoute from './routes/ProtectedRoute'
import AdminLayout    from './layouts/AdminLayout'

export default function App() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas de usuario normal (sin sidebar) */}
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute usuario={usuario}>
              <Pedidos />
            </ProtectedRoute>
          }
        />

        {/* Agrupamos las rutas de admin bajo /admin/* */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute usuario={usuario} requiereAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Rutas hijas (se insertan en <Outlet /> dentro de AdminLayout) */}
          <Route index element={<Admin />} />        {/* /admin */}
          <Route path="stock" element={<Stock />} />{/* /admin/stock */}
          {/* Puedes agregar más rutas hijas aquí, ej: <Route path="pedidos" element={<PedidosAdmin />} /> */}
        </Route>

        {/* Cualquier otra ruta redirige a /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
