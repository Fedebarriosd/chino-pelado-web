import { useState, useEffect } from 'react'
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  Table,
  Modal
} from 'react-bootstrap'

export default function Admin() {
  // Estados para creación de usuario
  const [nuevoUsuario, setNuevoUsuario] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [nuevoRol, setNuevoRol] = useState('usuario')

  // Mensajes de notificación
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(false)

  // Lista de usuarios activos
  const [usuarios, setUsuarios] = useState([])

  // Estados para edición
  const [showEdit, setShowEdit] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editUsuario, setEditUsuario] = useState('')
  const [editRol, setEditRol] = useState('usuario')

  // Cargar lista de usuarios al montar
  useEffect(() => {
    fetchList()
  }, [])

  const fetchList = () => {
    fetch('/api/users/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsuarios(data.usuarios)
        } else {
          setError(true)
          setMensaje('Error al cargar usuarios.')
        }
      })
      .catch((err) => {
        console.error(err)
        setError(true)
        setMensaje('Error de conexión al servidor.')
      })
  }

  // Crear usuario nuevo
  const handleCrearUsuario = async (e) => {
    e.preventDefault()
    setMensaje(null)
    setError(false)

    if (!nuevoUsuario.trim() || !nuevaContrasena.trim()) {
      setError(true)
      setMensaje('Debes completar todos los campos.')
      return
    }

    try {
      const res = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: nuevoUsuario.trim(),
          contraseña: nuevaContrasena,
          rol: nuevoRol
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setMensaje('Usuario creado correctamente.')
        setError(false)
        setNuevoUsuario('')
        setNuevaContrasena('')
        setNuevoRol('usuario')
        fetchList()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al crear usuario.')
      }
    } catch (err) {
      console.error(err)
      setError(true)
      setMensaje('Error de conexión con el servidor.')
    }
  }

  // Iniciar edición de un usuario
  const handleEditClick = (u) => {
    setEditId(u.id)
    setEditUsuario(u.usuario)
    setEditRol(u.rol)
    setShowEdit(true)
  }

  // Guardar cambios de edición
  const handleEditSave = async () => {
    setMensaje(null)
    setError(false)

    try {
      const res = await fetch(`/api/users/update/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: editUsuario.trim(), rol: editRol })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setMensaje('Usuario actualizado correctamente.')
        setError(false)
        fetchList()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al actualizar usuario.')
      }
    } catch (err) {
      console.error(err)
      setError(true)
      setMensaje('Error de conexión al servidor.')
    }

    setShowEdit(false)
  }

  // Desactivar usuario (soft delete)
  const handleDeactivate = async (id) => {
    if (!window.confirm('¿Seguro que deseas desactivar este usuario?')) return
    setMensaje(null)
    setError(false)

    try {
      const res = await fetch(`/api/users/deactivate/${id}`, { method: 'PUT' })
      const data = await res.json()

      if (res.ok && data.success) {
        setMensaje('Usuario desactivado correctamente.')
        setError(false)
        fetchList()
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al desactivar usuario.')
      }
    } catch (err) {
      console.error(err)
      setError(true)
      setMensaje('Error de conexión al servidor.')
    }
  }

  return (
    <>
      <h2 className="mb-4 text-center">Gestión de Usuarios</h2>

      {mensaje && (
        <Alert variant={error ? 'danger' : 'success'} className="text-center">
          {mensaje}
        </Alert>
      )}

      {/* Formulario creación */}
      <Form onSubmit={handleCrearUsuario} className="mb-5">
        <Row className="g-3">
          <Col md={4}>
            <Form.Group controlId="formUsuario">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Usuario"
                value={nuevoUsuario}
                onChange={(e) => setNuevoUsuario(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="formContrasena">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="formRol">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value)}
              >
                <option value="usuario">Usuario normal</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1} className="d-flex align-items-end">
            <Button variant="primary" type="submit" className="w-100">
              Crear
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Tabla de usuarios */}
      <h4>Usuarios existentes</h4>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length ? (
            usuarios.map((u, idx) => (
              <tr key={u.id}>
                <td>{idx + 1}</td>
                <td>{u.usuario}</td>
                <td>{u.rol}</td>
                <td className="d-flex gap-2">
                  <Button size="sm" onClick={() => handleEditClick(u)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeactivate(u.id)}
                  >
                    Desactivar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal de edición */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="editUsuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={editUsuario}
                onChange={(e) => setEditUsuario(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editRol">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={editRol}
                onChange={(e) => setEditRol(e.target.value)}
              >
                <option value="usuario">Usuario normal</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditSave}>
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
