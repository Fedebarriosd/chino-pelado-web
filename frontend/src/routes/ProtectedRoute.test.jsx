import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Un dummy component para verificar render
function Dummy() {
  return <div>Zona Segura</div>;
}

describe('ProtectedRoute', () => {
  test('redirige a /login si no hay usuario', () => {
    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <Routes>
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute usuario={null}>
                <Dummy />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    // Debe verse el texto de Login Page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('muestra children si hay usuario normal', () => {
    const mockUser = { usuario: 'pepe', rol: 'usuario' };
    render(
      <MemoryRouter initialEntries={['/pedidos']}>
        <Routes>
          <Route
            path="/pedidos"
            element={
              <ProtectedRoute usuario={mockUser}>
                <Dummy />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );
    // Debe verse el contenido de Dummy
    expect(screen.getByText('Zona Segura')).toBeInTheDocument();
  });

  test('redirige a /pedidos si requiereAdmin y rol distinto', () => {
    const mockUser = { usuario: 'pepe', rol: 'usuario' };
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute usuario={mockUser} requiereAdmin>
                <Dummy />
              </ProtectedRoute>
            }
          />
          <Route path="/pedidos" element={<div>Pedidos Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Pedidos Page')).toBeInTheDocument();
  });
});
