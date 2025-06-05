import { useState } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Intentando login...');
    setMensaje(null);
    setError(false);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contraseña }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(`Bienvenido, ${data.usuario}`);
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
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="text-center mb-4">Login Admin</h2>
      {mensaje && (
        <Alert variant={error ? 'danger' : 'success'}>{mensaje}</Alert>
      )}
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
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
    </Container>
  );
}
