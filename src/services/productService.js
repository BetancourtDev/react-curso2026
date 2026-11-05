import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Unifica los nombres y formatos posibles de los campos de un producto.
export const normalizeProduct = (item, id = item.id) => ({
  id: String(id),
  title: item.title || item.nombre || "Producto sin título",
  price: Number(item.price ?? item.precio ?? 0),
  description: item.description || item.descripcion || "Sin descripción disponible.",
  category: item.category || item.categoria || "General",
  image:
    item.image ||
    item.imagen ||
    item.thumbnail ||
    (Array.isArray(item.images) ? item.images[0] : "") ||
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
  stock: item.stock !== undefined ? Number(item.stock) : 15,
  rating:
    typeof item.rating === "object"
      ? Number(item.rating?.rate || 4.5)
      : Number(item.rating || 4.5),
});

/**
 * Valida los campos de un producto antes de enviarlo a Firestore.
 * Retorna un objeto con los errores por campo y un booleano isValid.
 */
export const validateProductData = (product) => {
  const errors = {};
  const title = (product.title ?? "").trim();
  const category = (product.category ?? "").trim();
  const description = (product.description ?? "").trim();
  const image = (product.image ?? "").trim();
  const price = Number(product.price);
  const stock = Number(product.stock);

  if (!title) {
    errors.title = "El nombre del producto es obligatorio.";
  } else if (title.length < 3) {
    errors.title = "El nombre debe tener al menos 3 caracteres.";
  }

  if (!category) {
    errors.category = "La categoría es obligatoria.";
  }

  if (product.price === "" || product.price === null || Number.isNaN(price) || price <= 0) {
    errors.price = "El precio debe ser un número mayor que cero.";
  }

  if (
    product.stock === "" ||
    product.stock === null ||
    Number.isNaN(stock) ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    errors.stock = "El stock debe ser un número entero mayor o igual a 0.";
  }

  if (!image) {
    errors.image = "La URL de la imagen es obligatoria.";
  } else {
    try {
      const parsedUrl = new URL(image);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        errors.image = "La URL de la imagen debe comenzar con http:// o https://.";
      }
    } catch {
      errors.image = "Ingresa una URL de imagen válida (ej. https://...).";
    }
  }

  if (!description) {
    errors.description = "La descripción del producto es obligatoria.";
  } else if (description.length < 10) {
    errors.description = "La descripción debe tener al menos 10 caracteres.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Obtiene todos los documentos de la colección "productos" y normaliza sus datos.
export const fetchProducts = async () => {
  const snapshot = await getDocs(collection(db, "productos"));
  return snapshot.docs.map((product) =>
    normalizeProduct(product.data(), product.id),
  );
};

// Obtiene la lista única de categorías existentes en los productos de Firestore.
export const fetchCategories = async () => {
  const products = await fetchProducts();
  return [...new Set(products.map((p) => p.category).filter(Boolean))];
};

// Crea un producto en la colección de Firestore.
export const createProduct = async (product) => {
  const { isValid, errors } = validateProductData(product);
  if (!isValid) {
    const firstError = Object.values(errors)[0];
    throw new Error(firstError || "Datos del producto inválidos.");
  }

  const productRef = await addDoc(collection(db, "productos"), {
    title: product.title.trim(),
    price: Number(product.price),
    description: product.description.trim(),
    category: product.category.trim(),
    image: product.image.trim(),
    stock: Number(product.stock),
    rating: Number(product.rating || 4.5),
  });

  return productRef.id;
};

// Actualiza un producto existente en Firestore según su ID.
export const updateProduct = async (id, product) => {
  const { isValid, errors } = validateProductData(product);
  if (!isValid) {
    const firstError = Object.values(errors)[0];
    throw new Error(firstError || "Datos del producto inválidos.");
  }

  const productRef = doc(db, "productos", String(id));
  await updateDoc(productRef, {
    title: product.title.trim(),
    price: Number(product.price),
    description: product.description.trim(),
    category: product.category.trim(),
    image: product.image.trim(),
    stock: Number(product.stock),
  });
};

// Elimina un producto de Firestore según su ID.
export const deleteProduct = async (id) => {
  const productRef = doc(db, "productos", String(id));
  await deleteDoc(productRef);
};

// Busca un producto por el ID de su documento en Firestore.
export const fetchProductById = async (id) => {
  const snapshot = await getDoc(doc(db, "productos", String(id)));

  if (!snapshot.exists()) {
    throw new Error(`Producto con ID ${id} no encontrado en Firestore.`);
  }

  return normalizeProduct(snapshot.data(), snapshot.id);
};

/**
 * Pobla la colección "productos" en Firestore a partir de /datos/productos.json,
 * evitando duplicar productos que ya existan con el mismo título.
 * @returns {Promise<{ added: number, skipped: number }>}
 */
export const seedProductsFromJson = async () => {
  const response = await fetch("/datos/productos.json");
  if (!response.ok) {
    throw new Error("No se pudo leer el archivo /datos/productos.json.");
  }

  const rawItems = await response.json();
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("El archivo productos.json está vacío o tiene un formato inválido.");
  }

  const existingProducts = await fetchProducts();
  const existingTitles = new Set(
    existingProducts.map((p) => p.title.trim().toLowerCase())
  );

  const batch = writeBatch(db);
  const collectionRef = collection(db, "productos");
  let added = 0;
  let skipped = 0;

  rawItems.forEach((item) => {
    const title = (item.title || item.nombre || "").trim();
    if (!title) return;

    if (existingTitles.has(title.toLowerCase())) {
      skipped += 1;
      return;
    }

    const newDocRef = doc(collectionRef);
    const ratingVal =
      typeof item.rating === "object"
        ? Number(item.rating?.rate || 4.8)
        : Number(item.rating || 4.8);

    batch.set(newDocRef, {
      title,
      price: Number(item.price ?? item.precio ?? 0),
      description: (item.description || item.descripcion || "").trim(),
      category: (item.categoria || item.category || "General").trim(),
      image: (item.image || item.imagen || "").trim(),
      stock: item.stock !== undefined ? Number(item.stock) : 15,
      rating: ratingVal,
    });

    existingTitles.add(title.toLowerCase());
    added += 1;
  });

  if (added > 0) {
    await batch.commit();
  }

  return { added, skipped };
};
