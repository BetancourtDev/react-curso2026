import { useEffect } from "react";
import { AlertTriangle, Trash2, RefreshCw, X } from "lucide-react";
import styles from "./ConfirmDeleteModal.module.css";

/**
 * ConfirmDeleteModal: Cuadro de diálogo de confirmación antes de eliminar un producto.
 */
const ConfirmDeleteModal = ({
  isOpen,
  productTitle,
  isDeleting = false,
  error = "",
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) {
        onCancel?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      onClick={!isDeleting ? onCancel : undefined}
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onCancel}
          disabled={isDeleting}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className={styles.iconWrapper}>
          <AlertTriangle size={28} />
        </div>

        <h3 id="confirm-delete-title" className={styles.title}>
          ¿Eliminar este producto?
        </h3>

        <p className={styles.description}>
          Estás por eliminar permanentemente{" "}
          <strong>&ldquo;{productTitle}&rdquo;</strong> del catálogo en Firestore.
          Esta acción no se puede deshacer.
        </p>

        {error && (
          <div className={styles.errorBox} role="alert">
            {error}
          </div>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={styles.cancelBtn}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={styles.confirmBtn}
          >
            {isDeleting ? (
              <>
                <RefreshCw size={16} className={styles.spinner} />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Sí, eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

