import { Row, Col, Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminLayout({ onLogout }) {
  return (
    <Row className="g-0 vh-100">
        <Col
            xs={2}
            className="bg-light border-end d-flex flex-column"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                zIndex: 1000,
            }}
        >
            <Sidebar />
        </Col>


        <Col xs={10} style={{ marginLeft: '220px', padding: '2rem', overflowY: 'auto' }}>
            <Outlet />
        </Col>
    </Row>
  );
}
