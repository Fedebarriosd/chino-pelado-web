import { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Table,
  Alert
} from 'react-bootstrap';

export default function Pedidos() {
  // Estados para el formulario de crear pedido
  const [cliente, setCliente] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);

  // Estado para la lista de pedidos pendientes
  const [pedidosPendientes, setPedidosPendientes] = useState([]);

  // Al montar, cargar pedidos pendientes
  useEffect(() => {
    fetchPedidosPendientes();
  }, []);

  const fetchPedidosPendientes = () => {
    fetch('/api/pedidos/list-pendientes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPedidosPendientes(data.pedidos);
        } else {
          setError(true);
          setMensaje('No se pudo obtener pedidos pendientes.');
        }
      })
      .catch((err) => {
        console.error('Error al obtener pedidos pendientes:', err);
        setError(true);
        setMensaje('Error de conexión al servidor.');
      });
  };

  // Al enviar el formulario, crea un pedido nuevo
  const handleCrearPedido = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(false);

    if (!cliente.trim() || !descripcion.trim()) {
      setError(true);
      setMensaje('Debes completar ambos campos.');
      return;
    }
    try {
      const res = await fetch('/api/pedidos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: cliente.trim(),
          descripcion: descripcion.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMensaje('Pedido creado correctamente.');
        setError(false);
        setCliente('');
        setDescripcion('');
        fetchPedidosPendientes();
      } else {
        setError(true);
        setMensaje(data.mensaje || 'Error al crear el pedido.');
      }
    } catch (err) {
      console.error('Error al crear pedido:', err);
      setError(true);
      setMensaje('Error de conexión al servidor.');
    }
  };

  // Marcar un pedido como entregado
  const handleMarcarEntregado = async (id) => {
    try {
      const res = await fetch(`/api/pedidos/marcar-entregado/${id}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchPedidosPendientes();
      } else {
        setError(true);
        setMensaje(data.mensaje || 'Error al marcar como entregado.');
      }
    } catch (err) {
      console.error('Error al marcar entregado:', err);
      setError(true);
      setMensaje('Error de conexión al servidor.');
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-center">Gestión de Pedidos</h2>

      {mensaje && (
        <Alert variant={error ? 'danger' : 'success'} className="text-center">
          {mensaje}
        </Alert>
      )}

      <Form onSubmit={handleCrearPedido} className="mb-5">
        {/* Campos de “cliente” y “descripción” */}
      </Form>

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
          {/* Mapeo de pedidos pendientes */}
        </tbody>
      </Table>
    </div>
  );
}
