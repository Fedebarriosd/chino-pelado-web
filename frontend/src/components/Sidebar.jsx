// frontend/src/components/Sidebar.jsx
import { Nav } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

export default function Sidebar() {
  const navigate = useNavigate();

  const links = [
    { to: '/admin',         label: 'Usuarios' },
    { to: '/admin/stock',   label: 'Stock'    },
    { to: '/admin/pedidos', label: 'Pedidos'  },
  ];

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <Nav
      className="flex-column bg-light p-3 flex-grow-1"
      style={{ overflowY: 'auto' }}
      /* 
       - `flex-grow-1` hace que el Nav llene todo el espacio vertical 
         que le da su padre (<Col xs={3} d-flex flex-column vh-100>).
       - Con `overflowY: 'auto'` añadimos scroll interno si hay más enlaces de los que caben.
      */
      activeKey="/admin"
    >
      <h5 className="mb-4">Panel Admin</h5>

      {links.map((link) => (
        <Nav.Link
          as={NavLink}
          to={link.to}
          end={link.to === '/admin'}
          key={link.to}
          className="mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
          })}
        >
          {link.label}
        </Nav.Link>
      ))}

      <hr />

      <Button variant="outline-danger" size="sm" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </Nav>
  );
}
