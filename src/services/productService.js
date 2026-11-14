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

const LOCAL_FALLBACK_KEY = "tienda_productos_cache";

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
  rating:
    typeof item.rating === "object"
      ? Number(item.rating?.rate || 4.5)
      : Number(item.rating || 4.5),
});

/**
 * Lee los productos base desde /datos/productos.json y los sincroniza con el respaldo local.
 */
const loadFallbackProducts = async () => {
  try {
    const cached = localStorage.getItem(LOCAL_FALLBACK_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => normalizeProduct(item, item.id));
      }
    }
  } catch {
    // Ignorar error de lectura de localStorage
  }

  const response = await fetch("/datos/productos.json");
  if (!response.ok) {
    throw new Error("No se pudieron cargar los productos desde productos.json.");
  }
  const rawItems = await response.json();
  const normalized = (Array.isArray(rawItems) ? rawItems : []).map((item) =>
    normalizeProduct(item, item.id)
  );

  try {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(normalized));
  } catch {
    // Ignorar error de escritura en localStorage
  }

  return normalized;
};

const saveFallbackProducts = (products) => {
  try {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(products));
  } catch {
    // Ignorar error de escritura en localStorage
  }
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

  try {
    if (added > 0) {
      await batch.commit();
    }
    return { added, skipped };
  } catch (err) {
    console.warn(
      "Aviso: Firestore bloqueó la escritura masiva, sincronizando en almacenamiento local:",
      err.message
    );
    const normalized = rawItems.map((item) => normalizeProduct(item, item.id));
    saveFallbackProducts(normalized);
    return { added: normalized.length, skipped: 0 };
  }
};

/**
 * Obtiene todos los documentos de la colección "productos" en Firestore.
 * Si la colección está vacía, la pobla automáticamente desde productos.json.
 * Si Firestore presenta bloqueo de permisos o conexión, utiliza el respaldo de productos.json.
 */
export const fetchProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, "productos"));

    if (!snapshot.empty) {
      const firestoreProducts = snapshot.docs.map((product) =>
        normalizeProduct(product.data(), product.id)
      );
      saveFallbackProducts(firestoreProducts);
      return firestoreProducts;
    }

    // Si la colección en Firestore está vacía, intentamos poblarla automáticamente
    await seedProductsFromJson();
    const seededSnapshot = await getDocs(collection(db, "productos"));

    if (!seededSnapshot.empty) {
      const seededProducts = seededSnapshot.docs.map((product) =>
        normalizeProduct(product.data(), product.id)
      );
      saveFallbackProducts(seededProducts);
      return seededProducts;
    }
  } catch (err) {
    console.warn(
      "Usando catálogo de respaldo (/datos/productos.json) debido a respuesta de Firestore:",
      err.message
    );
  }

  return loadFallbackProducts();
};

// Obtiene la lista única de categorías existentes en los productos.
export const fetchCategories = async () => {
  const products = await fetchProducts();
  return [...new Set(products.map((p) => p.category).filter(Boolean))];
};

// Crea un producto en la colección de Firestore (y actualiza el respaldo local).
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

  try {
    const productRef = await addDoc(
      collection(db, "productos"),
      newProductData
    );
    const current = await loadFallbackProducts();
    saveFallbackProducts([
      normalizeProduct(newProductData, productRef.id),
      ...current,
    ]);
    return productRef.id;
  } catch (err) {
    console.warn(
      "Guardando producto en respaldo local por restricción de Firestore:",
      err.message
    );
    const generatedId = "local-" + Date.now();
    const current = await loadFallbackProducts();
    saveFallbackProducts([
      normalizeProduct(newProductData, generatedId),
      ...current,
    ]);
    return generatedId;
  }
};

// Actualiza un producto existente en Firestore (y en el respaldo local).
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
    console.warn(
      "Actualizando producto en respaldo local por restricción de Firestore:",
      err.message
    );
  }

  const current = await loadFallbackProducts();
  const updatedList = current.map((item) =>
    String(item.id) === String(id)
      ? normalizeProduct({ ...item, ...updatedFields }, id)
      : item
  );
  saveFallbackProducts(updatedList);
};

// Elimina un producto de Firestore (y del respaldo local).
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, "productos", String(id));
    await deleteDoc(productRef);
  } catch (err) {
    console.warn(
      "Eliminando producto en respaldo local por restricción de Firestore:",
      err.message
    );
  }

  const current = await loadFallbackProducts();
  saveFallbackProducts(
    current.filter((item) => String(item.id) !== String(id))
  );
};

// Busca un producto por el ID de su documento en Firestore o en el respaldo local.
export const fetchProductById = async (id) => {
  try {
    const snapshot = await getDoc(doc(db, "productos", String(id)));
    if (snapshot.exists()) {
      return normalizeProduct(snapshot.data(), snapshot.id);
    }
  } catch (err) {
    console.warn(
      "Buscando producto en respaldo local por respuesta de Firestore:",
      err.message
    );
  }

  const fallbackList = await loadFallbackProducts();
  const found = fallbackList.find((item) => String(item.id) === String(id));
  if (!found) {
    throw new Error(`Producto con ID ${id} no encontrado.`);
  }

  return found;
};
