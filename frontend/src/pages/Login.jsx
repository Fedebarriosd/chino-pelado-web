import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(false);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contraseña }),
      });
      const data = await res.json();

      if (res.ok) {
        const usuarioParaLocal = { usuario: data.usuario, rol: data.rol };
        localStorage.setItem('usuario', JSON.stringify(usuarioParaLocal));
        navigate(data.rol === 'admin' ? '/admin' : '/pedidos');
      } else {
        setError(true);
        setMensaje(data.mensaje);
      }
    } catch (err) {
      setError(true);
      setMensaje('Error de conexión con el servidor');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-start vh-100 pt-5 px-2">
      <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Login Admin/Usuario</h2>
          {mensaje && <Alert variant={error ? 'danger' : 'success'}>{mensaje}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formUsuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formContrasena">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Iniciar Sesión
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
