import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Star, Check, Pencil, Trash2, Truck } from "lucide-react";
import BotonFavorito from "../BotonFavorito";
import { useCart } from "../../context/useCart";
import { useAuth } from "../../context/useAuth";
import {
  CUOTAS_SIN_INTERES,
  DESCUENTO_TRANSFERENCIA,
  ENVIO_GRATIS_DESDE,
} from "../../data/categories";
import styles from "./Item.module.css";

const STOCK_BAJO = 5;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";

const formatARS = (value) =>
  Math.round(value).toLocaleString("es-AR", { maximumFractionDigits: 0 });

const Item = (props) => {
  // Acepta los nombres de campos actuales y alternativos para mantener compatibilidad con los datos.
  const id = props.id;
  const title = props.title || props.nombre || "Producto sin nombre";
  const price = Number(props.price || props.precio || 0);
  const image = props.image || props.imagen || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";
  const category = props.category || props.categoria || "General";
  const stock = props.stock !== undefined ? Number(props.stock) : 10;
  const rawRating = typeof props.rating === "object" ? props.rating?.rate : props.rating;
  const rating = rawRating != null && Number.isFinite(Number(rawRating)) ? Number(rawRating) : null;
  const onRequestDelete = props.onRequestDelete;

  const [agregado, setAgregado] = useState(false);
  const { addItem } = useCart();
  const { isAdmin } = useAuth();

  const detailUrl = `/producto/${id}`;
  const agotado = stock <= 0;
  const stockBajo = !agotado && stock <= STOCK_BAJO;

  // Añade una unidad al carrito; la cantidad se elige en la página de detalle.
  const handleAddToCart = () => {
    addItem({ id, title, price, image, category, stock }, 1);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <article className={`${styles.card} ${agotado ? styles.cardAgotado : ""}`}>
      <div className={styles.imageContainer}>
        <Link to={detailUrl} className={styles.imageLink} tabIndex={-1} aria-hidden="true">
          <img
            src={image}
            alt=""
            className={styles.productImage}
            loading="lazy"
            onError={(e) => {
              // Si la URL de la imagen está rota, muestra una imagen genérica.
              if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </Link>
        <span className={styles.categoryBadge}>{category}</span>
        <div className={styles.favContainer}>
          <BotonFavorito />
        </div>
        {(agotado || stockBajo) && (
          <span className={`${styles.stockBadge} ${agotado ? styles.stockAgotado : ""}`}>
            {agotado ? "Agotado" : `¡Últimas ${stock}!`}
          </span>
        )}
      </div>

      <div className={styles.content}>
        {rating !== null && (
          <div className={styles.stars}>
            <Star size={14} className={styles.starIcon} fill="#eab308" />
            <span className={styles.ratingNumber}>{rating.toFixed(1)}</span>
          </div>
        )}

        <h3 className={styles.title}>
          <Link to={detailUrl} className={styles.titleLink} title={title}>
            {title}
          </Link>
        </h3>

        <div className={styles.priceBlock}>
          <div className={styles.priceTag}>
            <span className={styles.currency}>AR$</span>
            <span className={styles.priceValue}>{formatARS(price)}</span>
          </div>
          {price > 0 && (
            <>
              <p className={styles.installments}>
                {CUOTAS_SIN_INTERES} cuotas sin interés de{" "}
                <span className={styles.nowrap}>AR$ {formatARS(price / CUOTAS_SIN_INTERES)}</span>
              </p>
              <p className={styles.transferPrice}>
                AR$ {formatARS(price * (1 - DESCUENTO_TRANSFERENCIA))} con transferencia
              </p>
            </>
          )}
          {price >= ENVIO_GRATIS_DESDE && (
            <p className={styles.freeShipping}>
              <Truck size={14} aria-hidden="true" /> Envío gratis
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={agotado}
          className={`${styles.cartBtn} ${agregado ? styles.cartBtnSuccess : ""}`}
        >
          {agregado ? (
            <>
              <Check size={16} /> Agregado
            </>
          ) : agotado ? (
            "Sin stock"
          ) : (
            <>
              <ShoppingBag size={16} /> Agregar al carrito
            </>
          )}
        </button>

        {/* Controles de edición y eliminación visibles solo para administradores. */}
        {isAdmin && (
          <div className={styles.adminActions}>
            <Link
              to={`/productos/editar/${id}`}
              className={styles.editBtn}
              title="Editar producto"
            >
              <Pencil size={14} /> Editar
            </Link>
            {onRequestDelete && (
              <button
                type="button"
                onClick={() => onRequestDelete({ id, title })}
                className={styles.deleteBtn}
                title="Eliminar producto"
              >
                <Trash2 size={14} /> Eliminar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default Item;
