import { useEffect, useState } from 'react';
import { Table, Alert, Container, Spinner } from 'react-bootstrap';

export default function HistorialVentas() {
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pedidos/historial-ventas')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistorial(data.historial);
        } else {
          setError(true);
          setMensaje(data.mensaje || 'Error al cargar historial.');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar historial:', err);
        setError(true);
        setMensaje('Error de conexión.');
        setLoading(false);
      });
  }, []);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Historial de Ventas</h2>

      {mensaje && (
        <Alert variant={error ? 'danger' : 'success'} className="text-center">
          {mensaje}
        </Alert>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio (Gs)</th>
              <th>Total Vendido</th>
            </tr>
          </thead>
          <tbody>
            {historial.length ? (
              historial.map((p, i) => (
                <tr key={p.producto_id}>
                  <td>{i + 1}</td>
                  <td>{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{(p.precio * 1000).toLocaleString()}</td>
                  <td>{p.total_vendido}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  No hay ventas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
