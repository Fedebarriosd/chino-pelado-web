import { Nav } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  const links = [
    { to: '/admin',        label: 'Usuarios' },
    { to: '/admin/stock',  label: 'Stock'    },
    { to: '/admin/pedidos',label: 'Pedidos'  }
  ]

  return (
    <Nav
      className="flex-column bg-light vh-100 p-3"
      style={{ width: '200px', position: 'fixed' }}
    >
      <h5 className="mb-4">Panel Admin</h5>
      {links.map((link) => (
        <Nav.Link
          as={NavLink}
          to={link.to}
          key={link.to}
          className="mb-2"
          style={({ isActive }) => ({
            fontWeight: isActive ? 'bold' : 'normal',
          })}
        >
          {link.label}
        </Nav.Link>
      ))}
    </Nav>
  )
}
