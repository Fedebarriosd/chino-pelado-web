// frontend/src/components/Sidebar.jsx
import { Nav } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const links = [
    { to: '/admin',         label: 'Usuarios' },
    { to: '/admin/stock',   label: 'Stock'    },
    { to: '/admin/pedidos', label: 'Pedidos'  },
  ];

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <Nav className="sidebar d-flex flex-column" style={{ overflowY: 'auto' }}>
      <div className="sidebar-header mb-4">
        <h5>Panel Admin</h5>
      </div>

      {links.map(link => (
        <Nav.Link
          as={NavLink}
          to={link.to}
          end={link.to === '/admin'}
          key={link.to}
          className="sidebar-link mb-2"
        >
          {link.label}
        </Nav.Link>
      ))}

      <hr className="sidebar-divider" />

      <Button
        variant="light"
        className="btn-logout mt-auto"
        onClick={handleLogout}
      >
        Cerrar sesión
      </Button>
    </Nav>
  );
}
