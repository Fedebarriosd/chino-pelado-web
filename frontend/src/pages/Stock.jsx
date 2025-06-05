import { useState, useEffect } from 'react'
import {
  Form,
  Row,
  Col,
  Button,
  Table,
  Alert,
  Modal
} from 'react-bootstrap'

export default function Stock() {
  const [productos, setProductos] = useState([])
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(false)

  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [producto, setProducto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [precioUnitario, setPrecioUnitario] = useState('')
  const [categoria, setCategoria] = useState('')

  const [showEliminarModal, setShowEliminarModal] = useState(false)
  const [idEliminar, setIdEliminar] = useState(null)

  // Carga inicial de productos
  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = () => {
    fetch('http://localhost:3000/api/stock/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProductos(data.stock)
      })
      .catch((err) => console.error('Error al obtener stock:', err))
  }

  // Crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje(null)
    setError(false)

    if (!producto.trim() || cantidad === '' || precioUnitario === '') {
      setError(true)
      setMensaje('Completar todos los campos obligatorios.')
      return
    }
    const payload = {
      producto: producto.trim(),
      cantidad: parseInt(cantidad, 10),
      precio_unitario: parseFloat(precioUnitario),
      categoria: categoria.trim() || null,
    }

    try {
      let endpoint = ''
      let method = ''
      if (modoEdicion) {
        endpoint = `http://localhost:3000/api/stock/update/${idEditar}`
        method = 'PUT'
      } else {
        endpoint = 'http://localhost:3000/api/stock/create'
        method = 'POST'
      }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setMensaje(
          modoEdicion
            ? 'Ítem actualizado correctamente.'
            : 'Ítem agregado correctamente.'
        )
        setError(false)
        limpiarFormulario()
        fetchProductos()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al guardar el ítem.')
      }
    } catch (err) {
      setError(true)
      setMensaje('Error de conexión con el servidor.')
      console.error(err)
    }
  }

  const iniciarEdicion = (item) => {
    setModoEdicion(true)
    setIdEditar(item.id)
    setProducto(item.producto)
    setCantidad(item.cantidad.toString())
    setPrecioUnitario(item.precio_unitario.toString())
    setCategoria(item.categoria || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const limpiarFormulario = () => {
    setModoEdicion(false)
    setIdEditar(null)
    setProducto('')
    setCantidad('')
    setPrecioUnitario('')
    setCategoria('')
  }

  const confirmarEliminar = (id) => {
    setIdEliminar(id)
    setShowEliminarModal(true)
  }

  const handleEliminar = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/stock/delete/${idEliminar}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setMensaje('Ítem eliminado correctamente.')
        setError(false)
        fetchProductos()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al eliminar.')
      }
    } catch (err) {
      setError(true)
      setMensaje('Error de conexión con el servidor.')
      console.error(err)
    } finally {
      setShowEliminarModal(false)
      setIdEliminar(null)
    }
  }

  return (
    <>
      <h2 className="mb-4 text-center">Gestión de Stock</h2>

      {mensaje && (
        <Alert variant={error ? 'danger' : 'success'} className="text-center">
          {mensaje}
        </Alert>
      )}

      {/* Formulario Crear/Editar */}
      <Form onSubmit={handleSubmit} className="mb-5">
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="formProducto">
              <Form.Label>Producto *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nombre del producto"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="formCantidad">
              <Form.Label>Cantidad *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                placeholder="0"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="formPrecioUnitario">
              <Form.Label>Precio Unitario *</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="formCategoria">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                type="text"
                placeholder="Opcional"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="mt-3 d-flex gap-2">
          <Button variant="primary" type="submit">
            {modoEdicion ? 'Actualizar Ítem' : 'Agregar Ítem'}
          </Button>
          {modoEdicion && (
            <Button variant="secondary" onClick={limpiarFormulario}>
              Cancelar
            </Button>
          )}
        </div>
      </Form>

      {/* Tabla de productos */}
      <h4>Lista de Productos</h4>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length ? (
            productos.map((p, idx) => (
              <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>{p.producto}</td>
                <td>{p.cantidad}</td>
                <td>${p.precio_unitario.toFixed(2)}</td>
                <td>{p.categoria || '-'}</td>
                <td className="d-flex gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => iniciarEdicion(p)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => confirmarEliminar(p.id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                No hay productos en stock.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal de confirmación eliminación */}
      <Modal
        show={showEliminarModal}
        onHide={() => setShowEliminarModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>¿Estás seguro de que quieres eliminar este ítem?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEliminarModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminar}>
            Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
