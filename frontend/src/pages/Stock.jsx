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

  // Estados para crear/editar stock
  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEditar, setIdEditar] = useState(null)
  const [producto, setProducto] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [minimo, setMinimo] = useState('')
  const [precioUnitario, setPrecioUnitario] = useState('')
  const [categoria, setCategoria] = useState('')

  // Modal de eliminación
  const [showEliminarModal, setShowEliminarModal] = useState(false)
  const [idEliminar, setIdEliminar] = useState(null)

  // Modal de descuento
  const [showDecModal, setShowDecModal] = useState(false)
  const [idDec, setIdDec] = useState(null)
  const [decCantidad, setDecCantidad] = useState('')

  const [productoAgotado, setProductoAgotado] = useState(null);

  // Cargar productos
  useEffect(() => {
    fetchProductos()
  }, [])

  const fetchProductos = () => {
    fetch('/api/stock/list')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        setProductos(data.stock);

        const agotado = data.stock.find(p => p.cantidad === 0);
        setProductoAgotado(agotado || null);
      })
      .catch((err) => console.error('Error al obtener stock:', err));
  }

  // Crear o actualizar
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje(null)
    setError(false)

    if (!producto.trim() || cantidad === '' || minimo === '' || precioUnitario === '') {
      setError(true)
      setMensaje('Completar todos los campos obligatorios.')
      return
    }

    const payload = {
      producto: producto.trim(),
      cantidad: parseInt(cantidad, 10),
      minimo: parseInt(minimo, 10),
      precio_unitario: parseFloat(precioUnitario),
      categoria: categoria.trim() || null,
    }

    try {
      const endpoint = modoEdicion
        ? `/api/stock/update/${idEditar}`
        : '/api/stock/create'
      const method = modoEdicion ? 'PUT' : 'POST'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setMensaje(modoEdicion ? 'Ítem actualizado correctamente.' : 'Ítem agregado correctamente.')
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
    setMinimo(item.minimo?.toString() || '0')
    setPrecioUnitario(item.precio_unitario.toString())
    setCategoria(item.categoria || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const limpiarFormulario = () => {
    setModoEdicion(false)
    setIdEditar(null)
    setProducto('')
    setCantidad('')
    setMinimo('')
    setPrecioUnitario('')
    setCategoria('')
  }

  // Eliminar ítem de stock
  const confirmarEliminar = (id) => {
    setIdEliminar(id)
    setShowEliminarModal(true)
  }
  const handleEliminar = async () => {
    try {
      const res = await fetch(`/api/stock/delete/${idEliminar}`, {
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

  // Descontar stock
  const confirmarDescontar = (id) => {
    setIdDec(id)
    setDecCantidad('')
    setShowDecModal(true)
  }
  const handleDescontar = async () => {
    if (!decCantidad || parseInt(decCantidad, 10) <= 0) {
      setError(true)
      setMensaje('Cantidad inválida para descuento.')
      return
    }
    try {
      const res = await fetch(`/api/stock/decrement/${idDec}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: parseInt(decCantidad, 10) }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setMensaje('Stock descontado correctamente.')
        setError(false)
        fetchProductos()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al descontar stock.')
      }
    } catch (err) {
      setError(true)
      setMensaje('Error de conexión con el servidor.')
      console.error(err)
    } finally {
      setShowDecModal(false)
      setIdDec(null)
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
          <Col md={3}>
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
          <Col md={2}>
            <Form.Group controlId="formMinimo">
              <Form.Label>Mínimo *</Form.Label>
              <Form.Control
                type="number"
                min="0"
                placeholder="0"
                value={minimo}
                onChange={(e) => setMinimo(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
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
            <th>Mínimo</th>
            <th>Precio Unitario</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
        {productos.length ? (
            [...productos]
                .sort((a, b) => {
                  const aBajo = a.cantidad <= a.minimo;
                  const bBajo = b.cantidad <= b.minimo;
                  if (aBajo === bBajo) {
                    return a.id - b.id; // si ambos son iguales respecto al mínimo, ordenar por ID
                  }
                  return aBajo ? -1 : 1; // primero los que están en o por debajo del mínimo
                })
                .map((p, idx) => (
                <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>{p.producto}</td>
                <td style={{ color: p.cantidad <= p.minimo ? 'red' : 'inherit' }}>
                  {p.cantidad}
                </td>
                <td>{p.minimo}</td>
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
                    variant="info"
                    size="sm"
                    onClick={() => confirmarDescontar(p.id)}
                  >
                    Descontar
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
              <td colSpan={7} className="text-center">
                No hay productos en stock.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal de confirmación eliminación */}
      <Modal show={showEliminarModal} onHide={() => setShowEliminarModal(false)} centered>
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

      {/* Modal de confirmación de descuento */}
      <Modal show={showDecModal} onHide={() => setShowDecModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Descontar Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formDecCantidad">
            <Form.Label>Cantidad a descontar *</Form.Label>
            <Form.Control
              type="number"
              min="1"
              placeholder="Ingrese cantidad"
              value={decCantidad}
              onChange={(e) => setDecCantidad(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDecModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleDescontar}>
            Descontar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal mágico de reposición automática */}
      <Modal show={!!productoAgotado} onHide={() => setProductoAgotado(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>¡Producto agotado!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productoAgotado && (
              <>
                <p>
                  El ingrediente <strong>{productoAgotado.producto}</strong> se quedó sin stock.
                </p>
                <p>¿Desea reponer 10 unidades?</p>
              </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProductoAgotado(null)}>
            Cancelar
          </Button>
          <Button
              variant="success"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/stock/update/${productoAgotado.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...productoAgotado,
                      cantidad: productoAgotado.cantidad + 10,
                      precio_unitario: parseFloat(productoAgotado.precio_unitario),
                      minimo: productoAgotado.minimo,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    setMensaje('🪄 ¡Stock repuesto!');
                    setError(false);
                    fetchProductos();
                  } else {
                    setMensaje('Error al reponer stock.');
                    setError(true);
                  }
                } catch (err) {
                  setMensaje('Error al contactar con el servidor.');
                  setError(true);
                } finally {
                  setProductoAgotado(null);
                }
              }}
          >
            Reponer
          </Button>
        </Modal.Footer>
      </Modal>

    </>
  )
}
