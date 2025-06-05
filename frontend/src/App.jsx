// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import Admin from './pages/Admin';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  // Obtenemos el usuario guardado en localStorage (puede ser null si no hay sesión)
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  console.log('App.jsx recuperó usuario:', usuario);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida para usuarios normales y administradores */}
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute usuario={usuario}>
              <Pedidos />
            </ProtectedRoute>
          }
        />

        {/* Ruta protegida que sólo permite acceso a administradores */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute usuario={usuario} requiereAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Cualquier otra ruta redirige automáticamente a /login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
