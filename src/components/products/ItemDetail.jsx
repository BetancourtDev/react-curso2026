import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Pencil,
  Trash2,
} from "lucide-react";
import BotonFavorito from "../BotonFavorito";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { deleteProduct } from "../../services/productService";
import { useCart } from "../../context/useCart";
import { useAuth } from "../../context/useAuth";
import styles from "./ItemDetail.module.css";

const ItemDetail = ({ product }) => {
  // El producto ya llega normalizado desde el servicio de Firestore.
  const { id, title, price, description, category, image, stock, rating } = product;
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { addItem, removeItem, isInCart } = useCart();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Mantiene la cantidad elegida dentro del rango permitido por el stock.
  const handleIncrement = () => {
    if (cantidad < stock) setCantidad((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (cantidad > 1) setCantidad((prev) => prev - 1);
  };

  // Agrega al carrito el producto y la cantidad seleccionada, y confirma la acción temporalmente.
  const handleAddToCart = () => {
    addItem(product, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  // Elimina el producto de Firestore tras la confirmación del usuario.
  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProduct(id);
      if (isInCart(id)) {
        removeItem(id);
      }
      navigate("/productos", { replace: true });
    } catch (err) {
      console.error("Error al eliminar el producto:", err);
      setDeleteError(
        err.message || "No se pudo eliminar el producto. Intenta nuevamente."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Link to="/productos" className={styles.backLink}>
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>

        {isAdmin && (
          <div className={styles.adminToolbar}>
            <Link
              to={`/productos/editar/${id}`}
              className={styles.editProductBtn}
            >
              <Pencil size={16} /> Editar producto
            </Link>
            <button
              type="button"
              onClick={() => {
                setDeleteError("");
                setConfirmOpen(true);
              }}
              className={styles.deleteProductBtn}
            >
              <Trash2 size={16} /> Eliminar producto
            </button>
          </div>
        )}
      </div>

      <div className={styles.productCard}>
        {/* Columna de imagen y acceso a favoritos. */}
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <div className={styles.favBadge}>
              <BotonFavorito />
            </div>
            <img src={image} alt={title} className={styles.mainImage} />
          </div>
        </div>

        {/* Columna con los datos, el stock y las opciones de compra. */}
        <div className={styles.infoColumn}>
          <div className={styles.metaRow}>
            <span className={styles.categoryBadge}>{category}</span>
            <span className={styles.sourceBadge}>SKU: #{id}</span>
          </div>

          <h1 className={styles.title}>{title}</h1>

          <div className={styles.ratingRow}>
            {typeof rating === "number" && (
              <>
                <div className={styles.stars}>
                  <Star size={16} fill="#eab308" className={styles.starIcon} />
                  <span className={styles.ratingVal}>{rating.toFixed(1)}</span>
                </div>
                <span className={styles.divider}>•</span>
              </>
            )}
            <span className={styles.stockStatus}>
              {stock > 0 ? `Disponible (${stock} unidades en stock)` : "Agotado temporalmente"}
            </span>
          </div>

          <div className={styles.priceContainer}>
            <span className={styles.currency}>AR$</span>
            <span className={styles.price}>{price.toLocaleString("es-AR")}</span>
            <span className={styles.taxTag}>IVA incluido</span>
          </div>

          <div className={styles.descriptionSection}>
            <h4 className={styles.descTitle}>Descripción del Producto</h4>
            <p className={styles.descriptionText}>{description}</p>
          </div>

          {/* Selector de cantidad y botón para agregar al carrito. */}
          <div className={styles.actionSection}>
            <div className={styles.quantityPicker}>
              <span className={styles.pickerLabel}>Cantidad:</span>
              <div className={styles.counterBox}>
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={cantidad <= 1}
                  className={styles.counterBtn}
                >
                  -
                </button>
                <span className={styles.counterValue}>{cantidad}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={cantidad >= stock}
                  className={styles.counterBtn}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className={`${styles.addBtn} ${agregado ? styles.addBtnSuccess : ""}`}
            >
              {agregado ? (
                <>
                  <Check size={20} /> ¡Producto agregado al carrito!
                </>
              ) : (
                <>
                  <ShoppingBag size={20} /> Agregar al Carrito ({cantidad})
                </>
              )}
            </button>
          </div>

          {/* Información complementaria sobre envío, garantía y devoluciones. */}
          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <Truck size={18} className={styles.featureIcon} />
              <div>
                <strong>Envío gratis a todo el país</strong>
                <small>En compras superiores a AR$ 50.000</small>
              </div>
            </div>
            <div className={styles.featureItem}>
              <Shield size={18} className={styles.featureIcon} />
              <div>
                <strong>Garantía oficial directa</strong>
                <small>Cobertura de 12 meses ante fallas</small>
              </div>
            </div>
            <div className={styles.featureItem}>
              <RotateCcw size={18} className={styles.featureIcon} />
              <div>
                <strong>Devolución sin costo</strong>
                <small>30 días de cambio garantizado</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={confirmOpen}
        productTitle={title}
        isDeleting={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setDeleteError("");
          }
        }}
      />
    </div>
  );
};

export default ItemDetail;
