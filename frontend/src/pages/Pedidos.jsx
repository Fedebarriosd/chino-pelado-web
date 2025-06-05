// frontend/src/pages/Pedidos.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';

export default function Pedidos() {
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);

  // 1) Cargar pedidos pendientes al montar
  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = () => {
    fetch('http://localhost:3000/api/pedidos/list-pendientes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPedidos(data.pedidos);
        }
      })
      .catch((err) => {
        console.error('Error al obtener pedidos:', err);
      });
  };

  // 2) Crear un pedido nuevo
  const handleCrearPedido = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(false);

    if (!cliente.trim() || !descripcion.trim()) {
      setError(true);
      setMensaje('Completar todos los campos.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/pedidos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: cliente.trim(), descripcion: descripcion.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMensaje('Pedido creado correctamente.');
        setError(false);
        setCliente('');
        setDescripcion('');
        fetchPedidos(); // recargar lista
      } else {
        setError(true);
        setMensaje(data.mensaje || 'Error al crear el pedido.');
      }
    } catch (err) {
      setError(true);
      setMensaje('Error de conexión con el servidor.');
      console.error(err);
    }
  };

  // 3) Marcar un pedido como entregado
  const marcarEntregado = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/pedidos/marcar-entregado/${id}`, {
        method: 'PUT',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        fetchPedidos(); // recargar lista
      } else {
        console.error('Error al marcar entregado:', data.mensaje);
      }
    } catch (err) {
      console.error('Error de conexión al marcar entregado:', err);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">Gestión de Pedidos</h2>

      {/* Formulario para crear pedido */}
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {mensaje && (
            <Alert variant={error ? 'danger' : 'success'} className="text-center">
              {mensaje}
            </Alert>
          )}

          <Form onSubmit={handleCrearPedido}>
            <Form.Group controlId="formCliente" className="mb-3">
              <Form.Label>Nombre del cliente</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresá nombre de cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formDescripcion" className="mb-3">
              <Form.Label>Descripción del pedido</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Detalles del pedido"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Crear Pedido
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      {/* Tabla de pedidos pendientes */}
      <Row className="mt-5">
        <Col>
          <h4>Pedidos Pendientes</h4>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length ? (
                pedidos.map((p, idx) => (
                  <tr key={p.id}>
                    <td>{idx + 1}</td>
                    <td>{p.cliente}</td>
                    <td>{p.descripcion}</td>
                    <td>{new Date(p.fecha).toLocaleString()}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => marcarEntregado(p.id)}
                      >
                        Entregado
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No hay pedidos pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
