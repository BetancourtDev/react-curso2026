# Requerimientos del proyecto

## Requerimiento #1: Estructura y Layout

Estructura Organizada: Arquitectura modular dividida en 
- components/layouts
- components/products
- components/cart
- components/team
- context
- pages
- services

## Layout.jsx: Integra 
- Header.jsx: con identidad de marca, 
- Nav.jsx 
- Footer.jsx

## Requerimiento #2: Catálogo de productos con datos de una API
La aplicación debe tener un componente como ItemListContainer.jsx (o un componente que cumpla esa función) que cargue la información de productos desde un archivo productos.json local usando useEffect y fetch.
Los productos deben renderizarse utilizando un componente reutilizable Item.jsx, que reciba los datos por props.

## Requerimiento #3: Sistema de ruteo
La navegación debe ser gestionada por react-router-dom.
Deben existir, como mínimo, las siguientes rutas:
/: Vista principal o de bienvenida.
/productos:
/producto/:id: Vista de detalle de un único producto
/carrito: Vista del carrito de compras.
El NavBar debe utilizar el componente <Link> para una navegación fluida sin recargas de página.

## Requerimiento #4: Carrito de compras con Context API
## Requerimiento #5:  Autenticación de usuarios

- Crear un AuthContext para manejar el estado de autenticación (usuario logueado/no logueado).
- Implementar formularios de login y registro que se comuniquen con Firebase Authentication.
- Proteger rutas, como el panel de gestión o el perfil, permitiendo el acceso únicamente a usuarios autenticados.

## Requerimiento #6: CRUD de productos con Firebase

Objetivo: permitir la administración completa del catálogo de productos mediante operaciones de creación, lectura, actualización y eliminación.

6.1 Formulario para agregar productos

- Implementar un formulario controlado para agregar nuevos productos, con validaciones (nombre obligatorio, precio mayor que cero, etc.).
- Incorporar la funcionalidad para editar y eliminar productos e- xistentes.
Implementar una confirmación antes de eliminar un producto para mejorar la experiencia de usuario (UX).

6.2 Manejo de estados de carga y errores 
- Mostrar indicadores de carga mientras se obtienen los datos de la API.
- Gestionar y mostrar mensajes de error al usuario si la comunicación con la API falla.

## Requerimiento #7: Optimización del diseño y responsividad

Objetivo: mejorar la apariencia y la accesibilidad del sitio utilizando herramientas modernas de diseño y estilización.
En este proyecto trabajaremos en la optimización del código y en la funcionalidad de React. Sin embargo, algunas funcionalidades también requieren prestar atención a los estilos y a la experiencia de usuario.
Para esta entrega, podrán elegir las herramientas de estilización que prefieran.
Se presentará Tailwind CSS, un framework de CSS ampliamente utilizado en el desarrollo web actual y solicitado en distintos ámbitos profesionales. El objetivo es que conozcan esta herramienta y puedan aplicarla en este proyecto o en futuros desarrollos.
