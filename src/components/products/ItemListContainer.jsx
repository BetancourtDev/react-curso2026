import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { RefreshCw, AlertCircle, X, ChevronRight, ArrowRight } from "lucide-react";
import ItemList from "./ItemList";
import Pagination from "./Pagination";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { fetchProducts, deleteProduct } from "../../services/productService";
import { useCart } from "../../context/useCart";
import styles from "./ItemListContainer.module.css";

const SORT_OPTIONS = [
  { value: "relevancia", label: "Más relevantes" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "rating", label: "Mejor valorados" },
];

const sortProducts = (list, order) => {
  const sorted = [...list];
  if (order === "precio-asc") sorted.sort((a, b) => a.price - b.price);
  if (order === "precio-desc") sorted.sort((a, b) => b.price - a.price);
  if (order === "rating") sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return sorted;
};

const sameText = (a = "", b = "") => a.toLowerCase() === b.toLowerCase();

/**
 * variant="catalog": listado completo con filtros, orden y paginación.
 * variant="featured": vitrina compacta para el home (mejor valorados, sin filtros).
 */
const ItemListContainer = ({
  title = "Catálogo de Productos",
  subtitle,
  defaultPageSize = 8,
  variant = "catalog",
  limit = 8,
}) => {
  const isFeatured = variant === "featured";

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultPageSize);
  const [sortOrder, setSortOrder] = useState("relevancia");
  const [reloadKey, setReloadKey] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = isFeatured ? "" : searchParams.get("buscar") || "";
  const selectedCategory = isFeatured ? "" : searchParams.get("categoria") || "";

  // Al cambiar la búsqueda o la categoría se vuelve a la primera página.
  const filterKey = `${searchQuery}|${selectedCategory}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setCurrentPage(1);
  }

  const catalogTopRef = useRef(null);

  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { removeItem, isInCart } = useCart();

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
          setError("No pudimos cargar los productos. Revisá tu conexión e intentá de nuevo.");
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

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    setSearchParams(nextParams, { replace: true });
  };

  // Categorías disponibles (sin duplicados) con su cantidad de productos.
  const categoryCounts = productos.reduce((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const categories = Object.keys(categoryCounts).sort((a, b) => a.localeCompare(b));

  const query = searchQuery.toLowerCase();
  const filteredProducts = sortProducts(
    productos.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      const matchesCategory =
        !selectedCategory || sameText(item.category, selectedCategory);
      return matchesSearch && matchesCategory;
    }),
    isFeatured ? "rating" : sortOrder
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const visibleProducts = isFeatured
    ? filteredProducts.slice(0, limit)
    : filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    catalogTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleItemsPerPageChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  const heading = selectedCategory || (searchQuery ? "Resultados de búsqueda" : title);

  const content = loading ? (
    <div className={styles.loaderWrapper} role="status">
      <RefreshCw size={32} className={styles.spinner} />
      <p className={styles.loadingText}>Cargando productos…</p>
    </div>
  ) : error ? (
    <div className={styles.errorWrapper}>
      <AlertCircle size={32} className={styles.errorIcon} />
      <p className={styles.errorText}>{error}</p>
      <button type="button" onClick={handleRetry} className={styles.retryBtn}>
        Reintentar
      </button>
    </div>
  ) : (
    <ItemList
      productos={visibleProducts}
      onRequestDelete={(prod) => {
        setDeleteError("");
        setProductToDelete(prod);
      }}
    />
  );

  const deleteModal = (
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
  );

  if (isFeatured) {
    return (
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.subHeading}>{subtitle}</p>}
          </div>
          <Link to="/productos" className={styles.seeAllLink}>
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>
        {content}
        {deleteModal}
      </div>
    );
  }

  return (
    <div ref={catalogTopRef} className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <ChevronRight size={14} aria-hidden="true" />
        {selectedCategory ? (
          <>
            <Link to="/productos">Productos</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">{selectedCategory}</span>
          </>
        ) : (
          <span aria-current="page">Productos</span>
        )}
      </nav>

      <div className={styles.catalogLayout}>
        <aside className={styles.sidebar} aria-label="Filtros">
          <h3 className={styles.sidebarTitle}>Categorías</h3>
          <ul className={styles.categoryList}>
            <li>
              <button
                type="button"
                onClick={() => updateParam("categoria", "")}
                className={`${styles.categoryBtn} ${!selectedCategory ? styles.categoryBtnActive : ""}`}
              >
                <span>Todas</span>
                {!loading && <span className={styles.categoryCount}>{productos.length}</span>}
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() => updateParam("categoria", cat)}
                  className={`${styles.categoryBtn} ${sameText(cat, selectedCategory) ? styles.categoryBtnActive : ""}`}
                >
                  <span>{cat}</span>
                  <span className={styles.categoryCount}>{categoryCounts[cat]}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <div>
              <h1 className={styles.mainHeading}>{heading}</h1>
              {!loading && !error && (
                <p className={styles.resultsCount}>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "producto" : "productos"}
                </p>
              )}
            </div>

            <label className={styles.sortControl}>
              <span>Ordenar por</span>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {(searchQuery || selectedCategory) && (
            <div className={styles.activeFilters}>
              {searchQuery && (
                <button type="button" className={styles.filterChip} onClick={() => updateParam("buscar", "")}>
                  “{searchQuery}” <X size={14} aria-label="Quitar búsqueda" />
                </button>
              )}
              {selectedCategory && (
                <button type="button" className={styles.filterChip} onClick={() => updateParam("categoria", "")}>
                  {selectedCategory} <X size={14} aria-label="Quitar categoría" />
                </button>
              )}
            </div>
          )}

          {/* Chips de categoría para móvil (el sidebar se oculta). */}
          <div className={styles.mobileCategories}>
            {["", ...categories].map((cat) => (
              <button
                key={cat || "all"}
                type="button"
                onClick={() => updateParam("categoria", cat)}
                className={`${styles.mobileChip} ${sameText(cat, selectedCategory) ? styles.mobileChipActive : ""}`}
              >
                {cat || "Todas"}
              </button>
            ))}
          </div>

          {content}

          {!loading && !error && (
            <Pagination
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>

      {deleteModal}
    </div>
  );
};

export default ItemListContainer;
