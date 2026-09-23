import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Check, Star, Shield, Truck, RotateCcw } from "lucide-react";
import BotonFavorito from "../BotonFavorito";
import { useCart } from "../../context/useCart";
import styles from "./ItemDetail.module.css";

const ItemDetail = ({ product }) => {
  const { id, title, price, description, category, image, stock, rating } = product;
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { addItem } = useCart();

  const handleIncrement = () => {
    if (cantidad < stock) setCantidad((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (cantidad > 1) setCantidad((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    addItem(product, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  };

  return (
    <div className={styles.container}>
      <Link to="/productos" className={styles.backLink}>
        <ArrowLeft size={18} /> Volver al catálogo
      </Link>

      <div className={styles.productCard}>
        {/* Columna Izquierda: Galería/Imagen */}
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <div className={styles.favBadge}>
              <BotonFavorito />
            </div>
            <img src={image} alt={title} className={styles.mainImage} />
          </div>
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className={styles.infoColumn}>
          <div className={styles.metaRow}>
            <span className={styles.categoryBadge}>{category}</span>
            <span className={styles.sourceBadge}>SKU: #{id}</span>
          </div>

          <h1 className={styles.title}>{title}</h1>

          <div className={styles.ratingRow}>
            <div className={styles.stars}>
              <Star size={16} fill="#eab308" className={styles.starIcon} />
              <span className={styles.ratingVal}>{typeof rating === "number" ? rating.toFixed(1) : "4.8"}</span>
            </div>
            <span className={styles.divider}>•</span>
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

          {/* Selector de cantidad y Botón de compra */}
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

          {/* Garantías y confianza */}
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
    </div>
  );
};

export default ItemDetail;
