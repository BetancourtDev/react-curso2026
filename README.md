# Tienda Online – Proyecto Final React JS 2026-2C

Tienda online hecha con React, React Router y Firebase (Authentication y Firestore). Incluye catálogo con búsqueda y paginación, carrito de compras, autenticación de usuarios y un panel de administración para gestionar productos.

## Links

- Repositorio: https://github.com/BetancourtDev/react-curso2026
- Deploy: **COMPLETAR con el link de Vercel / Netlify / GitHub Pages**

## Acceso al panel de administración

| Campo      | Valor             |
| ---------- | ----------------- |
| Usuario    | `admin@gmail.com` |
| Contraseña | `admin123`        |

Ruta del panel: `/admin`. Solo los usuarios con rol de administrador pueden crear, editar o eliminar productos.

## Tecnologías

- React 19 + Vite
- React Router DOM (rutas y rutas protegidas)
- Context API (carrito y autenticación)
- Firebase Authentication y Cloud Firestore
- CSS Modules (estilos y diseño responsive)
- lucide-react (íconos)

## Funcionalidades

- **Catálogo** con productos desde Firestore, buscador en tiempo real, filtro por categoría y paginador.
- **Detalle de producto** en `/producto/:id`.
- **Carrito** (`CartContext`): agregar, eliminar, aumentar, disminuir y vaciar; se guarda en `localStorage`.
- **Autenticación** (`AuthContext`): registro, login y logout con Firebase Auth.
- **Rutas protegidas**: `/perfil` para usuarios autenticados y `/admin` solo para administradores.
- **CRUD de productos** con formulario controlado y validaciones (nombre obligatorio, precio mayor que cero, stock entero, URL de imagen válida), confirmación antes de eliminar, indicadores de carga y mensajes de error.
- **Diseño responsive** para móvil, tablet y escritorio.

## Rutas

| Ruta                       | Descripción                         | Acceso        |
| -------------------------- | ----------------------------------- | ------------- |
| `/`                        | Inicio                              | Público       |
| `/productos`               | Catálogo con búsqueda y paginación  | Público       |
| `/producto/:id`            | Detalle de producto                 | Público       |
| `/carrito`                 | Carrito de compras                  | Público       |
| `/login` y `/registro`     | Autenticación                       | Público       |
| `/perfil`                  | Perfil del usuario                  | Autenticado   |
| `/admin`                   | Panel de gestión de productos       | Administrador |
| `/productos/crear`         | Formulario para crear producto      | Administrador |
| `/productos/editar/:id`    | Formulario para editar producto     | Administrador |

## Estructura del proyecto

```
src/
├── components/
│   ├── auth/        ProtectedRoute
│   ├── cart/        CartWidget
│   ├── layouts/     Layout, Header, Nav, Footer
│   ├── products/    Item, ItemList, ItemListContainer, ItemDetail,
│   │                Pagination, ConfirmDeleteModal
│   └── team/        TeamCard
├── context/         AuthContext, CartContext
├── firebase/        config.js
├── pages/           Home, Products, ProductDetail, Cart, Login,
│                    Profile, AdminDashboard, Create/EditProduct, NotFound
└── services/        productService.js (CRUD y validaciones)
```

## Cómo correrlo en local

```bash
npm install
npm run dev
```

Otros comandos: `npm run build` (compilar), `npm run preview` (probar el build) y `npm run lint`.

## Configuración de Firebase

1. Crear un proyecto en Firebase con Authentication (correo y contraseña) y Firestore.
2. Reemplazar los datos de `src/firebase/config.js` por los de tu proyecto.
3. Publicar las reglas de `firestore.rules`: el catálogo es de lectura pública y la escritura es solo para administradores.
4. Registrar el usuario admin en Authentication y crear en Firestore el documento `admins/{uid}` con el UID de ese usuario.
5. Desde el panel `/admin`, usar el botón **Poblar desde productos.json** para cargar el catálogo inicial.

## Deploy

La aplicación está pensada para publicarse en Netlify o Vercel. `public/_redirects` redirige todas las rutas a `index.html` para que funcione React Router.