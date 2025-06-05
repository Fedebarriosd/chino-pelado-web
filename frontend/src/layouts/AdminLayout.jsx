import { Row, Col, Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  return (
    <Row className="g-0 vh-100">
      {/* Sidebar fijo en columna izquierda */}
      <Col xs={3} className="bg-light border-end">
        <Sidebar />
      </Col>

      {/* Área de contenido para rutas hijas */}
      <Col xs={9}>
        <Container className="py-4 h-100 overflow-auto">
          <Outlet />
        </Container>
      </Col>
    </Row>
  );
}
