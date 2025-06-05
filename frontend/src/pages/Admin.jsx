import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Table } from 'react-bootstrap';

export default function Admin() {
  // Estado para el formulario de creación de usuario
  const [nuevoUsuario, setNuevoUsuario] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [nuevoRol, setNuevoRol] = useState('usuario'); // por defecto “usuario”
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);

  // Estado para la lista de usuarios existentes (opcional, para mostrar tabla)
  const [usuariosExistentes, setUsuariosExistentes] = useState([]);

  // Cargar la lista de usuarios cuando el componente se monte
  useEffect(() => {
    fetch('http://localhost:3000/api/users/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsuariosExistentes(data.usuarios);
        }
      })
      .catch((err) => {
        console.error('Error al obtener usuarios:', err);
      });
  }, []);

  // Manejador para crear nuevo usuario
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(false);

    // Validaciones mínimas
    if (!nuevoUsuario.trim() || !nuevaContrasena.trim()) {
      setError(true);
      setMensaje('Debés completar todos los campos.');
      return;
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
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMensaje('Usuario creado correctamente.');
        setError(false);

        // Limpiar formulario
        setNuevoUsuario('');
        setNuevaContrasena('');
        setNuevoRol('usuario');

        // Actualizar la lista de usuarios
        setUsuariosExistentes((prev) => [
          ...prev,
          { usuario: nuevoUsuario.trim(), rol: nuevoRol },
        ]);
      } else {
        setError(true);
        setMensaje(data.mensaje || 'Ocurrió un error al crear el usuario.');
      }
    } catch (err) {
      setError(true);
      setMensaje('Error de conexión con el servidor.');
      console.error(err);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center">Dashboard de Administración</h2>

      {/* Formulario para crear nuevo usuario */}
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          {mensaje && (
            <Alert variant={error ? 'danger' : 'success'} className="text-center">
              {mensaje}
            </Alert>
          )}

          <Form onSubmit={handleCrearUsuario}>
            <Form.Group controlId="formUsuario" className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresá el nombre de usuario"
                value={nuevoUsuario}
                onChange={(e) => setNuevoUsuario(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formContrasena" className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresá la contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formRol" className="mb-4">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value)}
              >
                <option value="usuario">Usuario normal</option>
                <option value="admin">Administrador</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Crear Usuario
              </Button>
            </div>
          </Form>
        </Col>
      </Row>

      {/* Tabla de usuarios existentes */}
      <Row className="mt-5">
        <Col>
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
                    No hay usuarios registrados aún.
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
