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
