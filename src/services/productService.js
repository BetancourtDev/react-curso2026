// Adaptador y servicio de productos para archivo local productos.json

export const normalizeProduct = (item) => {
  return {
    id: String(item.id),
    title: item.title || item.nombre || 'Producto sin título',
    price: Number(item.price || item.precio || 0),
    description: item.description || item.descripcion || 'Sin descripción disponible.',
    category: item.category || item.categoria || 'General',
    image: item.image || item.imagen || item.thumbnail || (Array.isArray(item.images) ? item.images[0] : '') || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
    stock: item.stock !== undefined ? Number(item.stock) : 15,
    rating: typeof item.rating === 'object' ? Number(item.rating?.rate || 4.5) : Number(item.rating || 4.5)
  };
};

export const fetchLocalProducts = async () => {
  try {
    const res = await fetch('/datos/productos.json');
    if (!res.ok) {
      // Intento con fallback a /productos.json
      const fallback = await fetch('/productos.json');
      if (!fallback.ok) throw new Error('No se pudo cargar productos.json local');
      const data = await fallback.json();
      return data.map(item => normalizeProduct(item));
    }
    const data = await res.json();
    return data.map(item => normalizeProduct(item));
  } catch (error) {
    console.error('Error cargando productos locales:', error);
    throw error;
  }
};

export const fetchProductById = async (id) => {
  const localList = await fetchLocalProducts();
  const found = localList.find((p) => String(p.id) === String(id));
  if (found) return found;

  throw new Error(`Producto con ID ${id} no encontrado en productos.json`);
};
