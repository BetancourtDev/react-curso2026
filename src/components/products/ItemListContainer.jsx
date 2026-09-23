import { useState, useEffect } from "react";
import { Search, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import ItemList from "./ItemList";
import { normalizeProduct } from "../../services/productService";
import styles from "./ItemListContainer.module.css";

const ItemListContainer = ({ title = "Catálogo de Productos" }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // useEffect con fetch para cargar exclusivamente el archivo local productos.json
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await fetch("/datos/productos.json");

        if (!response.ok) {
          // Intento fallback a /productos.json en la raíz de public
          const fallbackRes = await fetch("/productos.json");
          if (!fallbackRes.ok) {
            throw new Error("No se pudo cargar el archivo local productos.json");
          }
          const fallbackData = await fallbackRes.json();
          if (isMounted) {
            setProductos(fallbackData.map(normalizeProduct));
            setLoading(false);
          }
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setProductos(Array.isArray(data) ? data.map(normalizeProduct) : []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al cargar productos locales:", err);
        if (isMounted) {
          setError(err.message || "Error al cargar productos locales");
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Lista única de categorías para filtro
  const categories = ["all", ...new Set(productos.map((p) => p.category).filter(Boolean))];

  // Filtrado reactivo por texto y categoría
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
      {/* Encabezado */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.mainHeading}>{title}</h2>
          <p className={styles.subHeading}>
            Explora nuestro catálogo de productos cargados desde nuestro archivo local de productos.
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
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

      {/* Estados: Loading, Error y Grilla */}
      {loading ? (
        <div className={styles.loaderWrapper}>
          <RefreshCw size={36} className={styles.spinner} />
          <p className={styles.loadingText}>Cargando productos desde productos.json local...</p>
        </div>
      ) : error ? (
        <div className={styles.errorWrapper}>
          <AlertCircle size={32} className={styles.errorIcon} />
          <p className={styles.errorText}>Ocurrió un error: {error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
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
          <ItemList productos={filteredProducts} />
        </div>
      )}
    </div>
  );
};

export default ItemListContainer;