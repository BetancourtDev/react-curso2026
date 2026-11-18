import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw, AlertCircle, Sparkles, X } from "lucide-react";
import ItemList from "./ItemList";
import Pagination from "./Pagination";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { fetchProducts, deleteProduct } from "../../services/productService";
import { useCart } from "../../context/useCart";
import styles from "./ItemListContainer.module.css";

const ItemListContainer = ({
  title = "Catálogo de Productos",
  defaultPageSize = 8,
}) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultPageSize);
  const [reloadKey, setReloadKey] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("buscar") || "";

  // Al cambiar el texto de búsqueda se vuelve a la primera página.
  const [lastSearchQuery, setLastSearchQuery] = useState(searchQuery);
  if (lastSearchQuery !== searchQuery) {
    setLastSearchQuery(searchQuery);
    setCurrentPage(1);
  }

  const catalogTopRef = useRef(null);

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
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("buscar");
    setSearchParams(nextParams, { replace: true });
    setCurrentPage(1);
  };

  // Cálculo de páginas y porción de productos para la página activa
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (newPage) => {
    const targetPage = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(targetPage);
    catalogTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleItemsPerPageChange = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  return (
    <div ref={catalogTopRef} className={styles.container}>
      {/* Presentación del catálogo. */}
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.mainHeading}>{title}</h2>
          <p className={styles.subHeading}>
            Explora nuestro catálogo de productos cargados desde Firestore.
          </p>
        </div>
      </div>

      {/* Controles para filtrar por categoría y estado de búsqueda activa. */}
      <div className={styles.toolbar}>
        {searchQuery && (
          <div className={styles.activeSearchBadge}>
            <span>
              Resultados para: <strong>&ldquo;{searchQuery}&rdquo;</strong>
            </span>
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles.clearSearchBadgeBtn}
              title="Quitar filtro de búsqueda"
            >
              <X size={14} /> Limpiar
            </button>
          </div>
        )}

        <div className={styles.categoryFilters}>
          {/* Cada botón selecciona una categoría o restablece el filtro. */}
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.categoryBtnActive : ""}`}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Muestra el estado de carga, el error o la lista filtrada y paginada de productos. */}
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
            <Sparkles size={16} />{" "}
            {filteredProducts.length > 0 ? (
              <span>
                Página <strong>{safeCurrentPage}</strong> de{" "}
                <strong>{totalPages}</strong> ({filteredProducts.length}{" "}
                productos encontrados)
              </span>
            ) : (
              <span>0 productos encontrados</span>
            )}
          </div>
          <ItemList
            productos={paginatedProducts}
            onRequestDelete={(prod) => {
              setDeleteError("");
              setProductToDelete(prod);
            }}
          />
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
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