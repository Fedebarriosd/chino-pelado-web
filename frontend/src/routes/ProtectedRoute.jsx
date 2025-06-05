import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ usuario, requiereAdmin = false, children }) {
  if (!usuario) return <Navigate to="/login" />;

  if (requiereAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/pedidos" />;
  }

  return children;
}
