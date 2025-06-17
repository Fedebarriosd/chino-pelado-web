import { useEffect, useState } from 'react';
import { Table, Alert } from 'react-bootstrap';

export default function ReporteVentas() {
  const [historial, setHistorial] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/ventas/historial')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistorial(data.historial);
        } else {
          setError(true);
          setMensaje(data.mensaje || 'Error al obtener historial.');
        }
      })
      .catch(err => {
        console.error('Error al obtener historial de ventas:', err);
        setError(true);
        setMensaje('Error de conexión con el servidor.');
      });
  }, []);

  return (
    <>
      <h2 className="mb-4 text-center">Historial de Ventas</h2>
      {mensaje && (
        <Alert variant={error ? 'danger' : 'success'} className="text-center">
          {mensaje}
        </Alert>
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Descripción</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {historial.length ? (
            historial.map((v, idx) => (
              <tr key={v.id}>
                <td>{idx + 1}</td>
                <td>{v.cliente}</td>
                <td>{v.descripcion}</td>
                <td>{new Date(v.fecha).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                No hay ventas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
}