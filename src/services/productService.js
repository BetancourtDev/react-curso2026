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
  description:
    item.description || item.descripcion || "Sin descripción disponible.",
  category: item.categoria || item.category || "General",
  image:
    item.image ||
    item.imagen ||
    item.thumbnail ||
    (Array.isArray(item.images) ? item.images[0] : "") ||
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
  stock: item.stock !== undefined ? Number(item.stock) : 15,
  // Sin valoración real se deja en null para no mostrar un puntaje inventado.
  rating: (() => {
    const raw = typeof item.rating === "object" ? item.rating?.rate : item.rating;
    const value = Number(raw);
    return raw != null && raw !== "" && Number.isFinite(value) ? value : null;
  })(),
});

/**
 * Convierte un error de Firestore en un mensaje claro para el usuario.
 */
const toFriendlyError = (err, action) => {
  const code = err?.code || "";
  if (code === "permission-denied") {
    return new Error(
      `No tienes permisos para ${action}. Solo los administradores pueden modificar el catálogo.`
    );
  }
  if (code === "unavailable" || code === "deadline-exceeded") {
    return new Error(
      `No se pudo conectar con la base de datos para ${action}. Revisa tu conexión e intenta nuevamente.`
    );
  }
  if (code === "not-found") {
    return new Error(`No se pudo ${action}: el producto ya no existe.`);
  }
  return new Error(`No se pudo ${action}. ${err?.message || ""}`.trim());
};

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

  if (
    product.price === "" ||
    product.price === null ||
    Number.isNaN(price) ||
    price <= 0
  ) {
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
        errors.image =
          "La URL de la imagen debe comenzar con http:// o https://.";
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

/**
 * Pobla la colección "productos" en Firestore a partir de /datos/productos.json,
 * evitando duplicar productos que ya existan con el mismo título.
 */
export const seedProductsFromJson = async () => {
  const response = await fetch("/datos/productos.json");
  if (!response.ok) {
    throw new Error("No se pudo leer el archivo /datos/productos.json.");
  }

  const rawItems = await response.json();
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error(
      "El archivo productos.json está vacío o tiene un formato inválido."
    );
  }

  let existingTitles = new Set();
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    existingTitles = new Set(
      snapshot.docs.map((d) =>
        (d.data().title || d.data().nombre || "").trim().toLowerCase()
      )
    );
  } catch {
    // Si falla la lectura en Firestore, continuamos con el respaldo
  }

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
    try {
      await batch.commit();
    } catch (err) {
      throw toFriendlyError(err, "cargar el catálogo inicial");
    }
  }
  return { added, skipped };
};

/**
 * Obtiene todos los documentos de la colección "productos" en Firestore.
 * Si la colección está vacía devuelve una lista vacía: poblarla es una acción
 * manual del administrador (botón "Poblar desde productos.json" del panel).
 * Si Firestore falla, lanza un error con un mensaje claro para que la interfaz
 * lo muestre al usuario (no se oculta con datos de respaldo).
 */
export const fetchProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, "productos"));
    return snapshot.docs.map((product) =>
      normalizeProduct(product.data(), product.id)
    );
  } catch (err) {
    throw toFriendlyError(err, "cargar el catálogo");
  }
};

// Obtiene la lista única de categorías existentes en los productos.
export const fetchCategories = async () => {
  const products = await fetchProducts();
  return [...new Set(products.map((p) => p.category).filter(Boolean))];
};

// Crea un producto en Firestore. Si Firestore rechaza la escritura, lanza un error.
export const createProduct = async (product) => {
  const { isValid, errors } = validateProductData(product);
  if (!isValid) {
    const firstError = Object.values(errors)[0];
    throw new Error(firstError || "Datos del producto inválidos.");
  }

  const newProductData = {
    title: product.title.trim(),
    price: Number(product.price),
    description: product.description.trim(),
    category: product.category.trim(),
    image: product.image.trim(),
    stock: Number(product.stock),
    rating: Number(product.rating || 4.5),
  };

  let productRef;
  try {
    productRef = await addDoc(collection(db, "productos"), newProductData);
  } catch (err) {
    throw toFriendlyError(err, "crear el producto");
  }

  return productRef.id;
};

// Actualiza un producto en Firestore. Si Firestore rechaza la escritura, lanza un error.
export const updateProduct = async (id, product) => {
  const { isValid, errors } = validateProductData(product);
  if (!isValid) {
    const firstError = Object.values(errors)[0];
    throw new Error(firstError || "Datos del producto inválidos.");
  }

  const updatedFields = {
    title: product.title.trim(),
    price: Number(product.price),
    description: product.description.trim(),
    category: product.category.trim(),
    image: product.image.trim(),
    stock: Number(product.stock),
  };

  try {
    const productRef = doc(db, "productos", String(id));
    await updateDoc(productRef, updatedFields);
  } catch (err) {
    throw toFriendlyError(err, "actualizar el producto");
  }

};

// Elimina un producto de Firestore. Si Firestore rechaza la escritura, lanza un error.
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, "productos", String(id));
    await deleteDoc(productRef);
  } catch (err) {
    throw toFriendlyError(err, "eliminar el producto");
  }

};

// Busca un producto por el ID de su documento en Firestore.
export const fetchProductById = async (id) => {
  let snapshot;
  try {
    snapshot = await getDoc(doc(db, "productos", String(id)));
  } catch (err) {
    throw toFriendlyError(err, "cargar el producto");
  }

  if (!snapshot.exists()) {
    throw new Error(`Producto con ID ${id} no encontrado.`);
  }
  return normalizeProduct(snapshot.data(), snapshot.id);
};
