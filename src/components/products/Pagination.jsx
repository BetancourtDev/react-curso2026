import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import styles from "./Pagination.module.css";

/**
 * Pagination: Componente reutilizable de paginación con controles de navegación,
 * números de página y selector opcional de cantidad de elementos por página.
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  pageSizeOptions = [4, 6, 8, 12],
}) => {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Genera la lista de números de página visibles alrededor de la página actual
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 2) {
      end = 4;
    } else if (currentPage >= totalPages - 1) {
      start = totalPages - 3;
    }

    if (start > 2) {
      pages.push("ellipsis-left");
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("ellipsis-right");
    }

    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className={styles.paginationWrapper} aria-label="Paginación de productos">
      <div className={styles.infoGroup}>
        <span className={styles.rangeText}>
          Mostrando <strong>{startItem}</strong>–<strong>{endItem}</strong> de{" "}
          <strong>{totalItems}</strong> productos
        </span>

        {onItemsPerPageChange && (
          <label className={styles.pageSizeLabel}>
            <span>Por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={styles.pageSizeSelect}
              aria-label="Productos por página"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={styles.navBtn}
            aria-label="Primera página"
            title="Primera página"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.navBtn}
            aria-label="Página anterior"
            title="Página anterior"
          >
            <ChevronLeft size={16} />
            <span className={styles.navBtnText}>Anterior</span>
          </button>

          <div className={styles.pagesList}>
            {pageNumbers.map((page) =>
              typeof page === "string" ? (
                <span key={page} className={styles.ellipsis} aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`${styles.pageBtn} ${
                    currentPage === page ? styles.pageBtnActive : ""
                  }`}
                  aria-current={currentPage === page ? "page" : undefined}
                  aria-label={`Página ${page}`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.navBtn}
            aria-label="Página siguiente"
            title="Página siguiente"
          >
            <span className={styles.navBtnText}>Siguiente</span>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={styles.navBtn}
            aria-label="Última página"
            title="Última página"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      )}
    </nav>
  );
};

export default Pagination;

