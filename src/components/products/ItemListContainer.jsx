import { useState, useEffect } from "react";
import { Search, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import ItemList from "./ItemList";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { fetchProducts, deleteProduct } from "../../services/productService";
import { useCart } from "../../context/useCart";
import styles from "./ItemListContainer.module.css";

const ItemListContainer = ({ title = "Catálogo de Productos" }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);

  // Estados para confirmación y eliminación de productos
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { removeItem, isInCart } = useCart();

  // Carga los productos de Firestore al montar el componente o al reintentar.
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        if (isMounted) {
          setProductos(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al cargar productos desde Firestore:", err);
        if (isMounted) {
          setError(err.message || "Error al cargar productos desde Firestore.");
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((prev) => prev + 1);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteProduct(productToDelete.id);
      if (isInCart(productToDelete.id)) {
        removeItem(productToDelete.id);
      }
      setProductos((prev) =>
        prev.filter((item) => String(item.id) !== String(productToDelete.id))
      );
      setProductToDelete(null);
    } catch (err) {
      console.error("Error al eliminar producto desde Firestore:", err);
      setDeleteError(
        err.message || "No se pudo eliminar el producto. Intenta nuevamente."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Crea una lista de categorías sin duplicados e incluye la opción para verlas todas.
  const categories = ["all", ...new Set(productos.map((p) => p.category).filter(Boolean))];

  // Filtra los productos por coincidencia en el título, la descripción y la categoría.
  const filteredProducts = productos.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={styles.container}>
      {/* Presentación del catálogo. */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.mainHeading}>{title}</h2>
          <p className={styles.subHeading}>
            Explora nuestro catálogo de productos cargados desde Firestore.
          </p>
        </div>
      </div>

      {/* Controles para buscar productos y filtrar por categoría. */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className={styles.searchInput}
          />
          {/* El control de limpieza solo aparece cuando hay un término de búsqueda. */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={styles.clearSearchBtn}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className={styles.categoryFilters}>
          {/* Cada botón selecciona una categoría o restablece el filtro. */}
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryBtnActive : ""}`}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Muestra el estado de carga, el error o la lista filtrada de productos. */}
      {loading ? (
        <div className={styles.loaderWrapper}>
          <RefreshCw size={36} className={styles.spinner} />
          <p className={styles.loadingText}>Cargando productos desde Firestore...</p>
        </div>
      ) : error ? (
        <div className={styles.errorWrapper}>
          <AlertCircle size={32} className={styles.errorIcon} />
          <p className={styles.errorText}>Ocurrió un error: {error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className={styles.retryBtn}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className={styles.listWrapper}>
          <div className={styles.resultsCount}>
            <Sparkles size={16} /> Mostrando {filteredProducts.length} de {productos.length} productos
          </div>
          <ItemList
            productos={filteredProducts}
            onRequestDelete={(prod) => {
              setDeleteError("");
              setProductToDelete(prod);
            }}
          />
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(productToDelete)}
        productTitle={productToDelete?.title}
        isDeleting={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) {
            setProductToDelete(null);
            setDeleteError("");
          }
        }}
      />
    </div>
  );
};

export default ItemListContainer;