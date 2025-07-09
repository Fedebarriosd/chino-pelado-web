# 🧀 Sistema de Gestión – El Chino Pelado 2.0

Este sistema web permite a una pizzería gestionar su **stock**, realizar **pedidos**, ver el **historial de ventas**, y administrar **usuarios**. Está pensado para ser liviano, fácil de usar y funcional tanto para administradores como para el personal operativo.

---

## 🚀 Funcionalidades principales

- ✔️ Autenticación de usuarios (admin y usuario normal)
- 🍕 Registro de pedidos con validación automática de stock
- 📦 Panel de stock con control de mínimos y alertas visuales
- 🧮 Historial de ventas con conteo por producto
- 🔒 Rutas protegidas y separación de interfaces por rol
- 📊 Gestión de usuarios y permisos
- 🔁 Paneles actualizados en tiempo real al editar stock o pedidos

---

## 🧱 Tecnologías utilizadas

### Frontend
- React
- React Router DOM
- React Bootstrap
- Vite

### Backend
- Node.js
- Express.js
- SQLite3
- bcrypt

---

## 🛠️ Instalación

### Requisitos:
- Node.js 18+
- npm

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/chino-pelado-web.git
cd chino-pelado-web
```

### 2. Instalar dependencias

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Iniciar el sistema

```bash
cd backend
node index.js
```
```bash
cd frontend
npm run dev
```

---

## 🧾 Créditos

Este sistema fue desarrollado por:

**Fede Barrios** - Desarrollo fullstack, base de datos, interfaz y lógica de negocio.

Diseño inspirado en las necesidades reales de una pizzería de barrio.

> Proyecto creado con fines educativos, prácticos y gastronómicos.
> Cualquier similitud con otra pizzería calva es pura coincidencia!


