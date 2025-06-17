import { useState, useEffect } from 'react'
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Table
} from 'react-bootstrap'

export default function Pedidos() {
  const [cliente, setCliente] = useState('')
  const [menu, setMenu] = useState([])
  const [orderItems, setOrderItems] = useState([
    { productId: '', cantidad: 1 }
  ])
  const [pedidosPendientes, setPedidosPendientes] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(false)

  // Cargar catálogo de productos finales
  useEffect(() => {
    fetch('/api/productos/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMenu(data.productos)
        else throw new Error(data.mensaje)
      })
      .catch(err => {
        console.error('Error cargando catálogo de productos:', err)
        setError(true)
        setMensaje('No se pudo cargar el catálogo de productos.')
      })
  }, [])

  // Cargar pedidos pendientes
  useEffect(() => {
    fetchPedidosPendientes()
  }, [])

  const fetchPedidosPendientes = () => {
    fetch('/api/pedidos/list-pendientes')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPedidosPendientes(data.pedidos)
        else throw new Error(data.mensaje)
      })
      .catch(err => {
        console.error('Error al obtener pedidos pendientes:', err)
        setError(true)
        setMensaje('No se pudo obtener pedidos pendientes.')
      })
  }

  // Agregar línea de pedido
  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', cantidad: 1 }])
  }

  // Eliminar línea de pedido
  const handleRemoveItem = index => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  // Actualizar línea de pedido
  const handleItemChange = (index, field, value) => {
    const items = [...orderItems]
    items[index][field] = field === 'cantidad' ? parseInt(value, 10) : value
    setOrderItems(items)
  }

  // Crear pedido
  const handleCrearPedido = async e => {
    e.preventDefault()
    setMensaje(null)
    setError(false)

    if (!cliente.trim()) {
      setError(true)
      setMensaje('Ingresa el nombre del cliente.')
      return
    }
    for (const item of orderItems) {
      if (!item.productId || item.cantidad < 1) {
        setError(true)
        setMensaje('Completa todos los ítems del pedido.')
        return
      }
    }

    try {
      const itemsConNombre = orderItems.map(item => ({
        ...item,
        nombre: menu.find(p => p.id === item.productId)?.nombre
      }))
      const res = await fetch('/api/pedidos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: cliente.trim(), items: itemsConNombre })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setMensaje('Pedido creado correctamente.')
        setCliente('')
        setOrderItems([{ productId: '', cantidad: 1 }])
        fetchPedidosPendientes()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al crear pedido.')
      }
    } catch (err) {
      console.error('Error al crear pedido:', err)
      setError(true)
      setMensaje('Error de conexión con el servidor.')
    }
  }

  // Marcar pedido como entregado
  const handleMarcarEntregado = async id => {
    if (!window.confirm('¿Marcar pedido como completado?')) return
    setMensaje(null)
    setError(false)

    try {
      const res = await fetch(`/api/pedidos/marcar-entregado/${id}`, { method: 'PUT' })
      const data = await res.json()
      if (res.ok && data.success) {
        setMensaje('Pedido marcado como completado.')
        fetchPedidosPendientes()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al marcar como entregado.')
      }
    } catch (err) {
      console.error('Error al marcar entregado:', err)
      setError(true)
      setMensaje('Error de conexión con el servidor.')
    }
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Gestión de Pedidos</h2>

      {mensaje && (
        <Alert variant={error ? 'danger' : 'success'} className="text-center">
          {mensaje}
        </Alert>
      )}

      {/* Formulario de armado de pedido */}
      <Form onSubmit={handleCrearPedido} className="mb-5">
        <Form.Group className="mb-3" controlId="formCliente">
          <Form.Label>Cliente</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nombre del cliente"
            value={cliente}
            onChange={e => setCliente(e.target.value)}
            required
          />
        </Form.Group>

        <h5>Ítems del pedido</h5>
        {orderItems.map((item, idx) => (
          <Row key={idx} className="g-3 align-items-end mb-2">
            <Col md={8}>
              <Form.Group controlId={`product-${idx}`}>
                <Form.Label>Producto #{idx + 1}</Form.Label>
                <Form.Select
                  value={item.productId}
                  onChange={e => handleItemChange(idx, 'productId', parseInt(e.target.value, 10))}
                  required
                >
                  <option value="">Selecciona...</option>
                  {menu.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.categoria}) – ${p.precio.toFixed(2)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId={`qty-${idx}`}>
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={item.cantidad}
                  onChange={e => handleItemChange(idx, 'cantidad', e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={1} className="text-end">
              {orderItems.length > 1 && (
                <Button variant="danger" size="sm" onClick={() => handleRemoveItem(idx)}>
                  &times;
                </Button>
              )}
            </Col>
          </Row>
        ))}

        <Button variant="secondary" size="sm" onClick={handleAddItem} className="mb-4">
          + Agregar producto
        </Button>

        <div className="d-flex justify-content-center mb-4">
          <Button variant="primary" type="submit">
            Confirmar Pedido
          </Button>
        </div>
      </Form>

      {/* Tabla de pedidos pendientes */}
      <h4>Pedidos Pendientes</h4>
      <Table striped bordered hover responsive>
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
          {pedidosPendientes.length ? (
            pedidosPendientes.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.cliente}</td>
                <td>{p.descripcion}</td>
                <td>{new Date(p.fecha).toLocaleString()}</td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleMarcarEntregado(p.id)}
                  >
                    Completado
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
    </Container>
  )
}
