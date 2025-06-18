import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ usuario, requiereAdmin = false, children }) {
  if (!usuario) {
    // Si no hay usuario en localStorage, redirige a /login
    return <Navigate to="/login" />;
  }
  if (requiereAdmin && usuario.rol !== 'admin') {
    // Si la ruta exige admin y el rol es distinto, redirige a /pedidos (o donde prefieras)
    return <Navigate to="/pedidos" />;
  }
  return children;
}
