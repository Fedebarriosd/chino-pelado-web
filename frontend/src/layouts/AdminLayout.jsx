import { Row, Col, Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout() {
  return (
    <Row className="g-0 vh-100">
      <Col xs={2} className="bg-light border-end d-flex flex-column vh-100">
        <Sidebar />
      </Col>

      <Col xs={9} className="d-flex flex-column">
        <Container className="py-4 h-100 overflow-auto">
          <Outlet />
        </Container>
      </Col>
    </Row>
  );
}
