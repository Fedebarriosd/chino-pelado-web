// frontend/src/layouts/UserLayout.jsx
import { Row, Col, Container, Nav, Button } from 'react-bootstrap';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function UserLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login', { replace: true });
  };

  return (
    <Row className="g-0 vh-100">
      {/* Sidebar usuario */}
      <Col xs={2} className="sidebar d-flex flex-column">
        <div className="sidebar-header mb-4">
          <h5>Menú</h5>
        </div>
        <Nav className="flex-column">
          <Nav.Link
            as={NavLink}
            to="/pedidos"
            className="sidebar-link mb-2"
          >
            Pedidos
          </Nav.Link>
          <Nav.Link
            as={NavLink}
            to="/stock"
            className="sidebar-link mb-2"
          >
            Stock
          </Nav.Link>
        </Nav>
        <hr className="sidebar-divider" />
        <Button
          variant="light"
          className="btn-logout mt-auto"
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </Col>

      {/* Contenido principal */}
      <Col xs={10}>
        <Container className="py-4 h-100 overflow-auto">
          <Outlet />
        </Container>
      </Col>
    </Row>
  );
}
