import { useState, useEffect } from 'react'
import { Form, Row, Col, Button, Alert, Table } from 'react-bootstrap'

export default function Admin() {
  // Estados para el formulario de creación de usuario
  const [nuevoUsuario, setNuevoUsuario] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [nuevoRol, setNuevoRol] = useState('usuario')
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(false)

  // Lista de usuarios
  const [usuariosExistentes, setUsuariosExistentes] = useState([])

  // Cargar usuarios existentes al montar el componente
  useEffect(() => {
    fetch('http://localhost:3000/api/users/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsuariosExistentes(data.usuarios)
      })
      .catch((err) => console.error('Error al obtener usuarios:', err))
  }, [])

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
      const res = await fetch('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: nuevoUsuario.trim(),
          contraseña: nuevaContrasena,
          rol: nuevoRol,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setMensaje('Usuario creado correctamente.')
        setError(false)
        setNuevoUsuario('')
        setNuevaContrasena('')
        setNuevoRol('usuario')
        setUsuariosExistentes((prev) => [
          ...prev,
          { usuario: nuevoUsuario.trim(), rol: nuevoRol },
        ])
      } else {
        setError(true)
        setMensaje(data.mensaje || 'Error al crear usuario.')
      }
    } catch (err) {
      setError(true)
      setMensaje('Error de conexión con el servidor.')
      console.error(err)
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

      <h4>Usuarios existentes</h4>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Usuario</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuariosExistentes.length ? (
            usuariosExistentes.map((u, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{u.usuario}</td>
                <td>{u.rol}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  )
}
