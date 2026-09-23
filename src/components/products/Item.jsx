import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Eye, Star, Check } from "lucide-react";
import BotonFavorito from "../BotonFavorito";
import { useCart } from "../../context/useCart";
import styles from "./Item.module.css";

const Item = (props) => {

  const id = props.id;
  const title = props.title || props.nombre || "Producto sin nombre";
  const price = Number(props.price || props.precio || 0);
  const image = props.image || props.imagen || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80";
  const category = props.category || props.categoria || "General";
  const stock = props.stock !== undefined ? Number(props.stock) : 10;
  const rating = typeof props.rating === "object" ? props.rating?.rate : Number(props.rating || 4.5);

  const [contador, setContador] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { addItem } = useCart();

  const incrementar = () => {
    if (contador < stock) {
      setContador((prev) => prev + 1);
    }
  };

  const decrementar = () => {
    if (contador > 1) {
      setContador((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addItem(
      {
        id,
        title,
        price,
        image,
        category,
        stock,
      },
      contador
    );
    setAgregado(true);
    setTimeout(() => {
      setAgregado(false);
    }, 2000);
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <span className={styles.categoryBadge}>{category}</span>
        <div className={styles.favContainer}>
          <BotonFavorito />
        </div>
        <img src={image} alt={title} className={styles.productImage} loading="lazy" />
      </div>

      <div className={styles.content}>
        <div className={styles.ratingRow}>
          <div className={styles.stars}>
            <Star size={14} className={styles.starIcon} fill="#eab308" />
            <span className={styles.ratingNumber}>{rating?.toFixed(1) || "4.5"}</span>
          </div>
          <span className={styles.stockBadge}>
            {stock > 0 ? `Stock: ${stock}` : "Agotado"}
          </span>
        </div>

        <h3 className={styles.title} title={title}>
          {title}
        </h3>

        <div className={styles.priceTag}>
          <span className={styles.currency}>AR$</span>
          <span className={styles.priceValue}>{price.toLocaleString("es-AR")}</span>
        </div>

        {/* Selector de cantidad interactivo */}
        <div className={styles.counterRow}>
          <div className={styles.counterControls}>
            <button
              type="button"
              onClick={decrementar}
              disabled={contador <= 1}
              className={styles.counterBtn}
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className={styles.counterNumber}>{contador}</span>
            <button
              type="button"
              onClick={incrementar}
              disabled={contador >= stock}
              className={styles.counterBtn}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`${styles.cartBtn} ${agregado ? styles.cartBtnSuccess : ""}`}
            title="Agregar al carrito"
          >
            {agregado ? (
              <>
                <Check size={16} /> Agregado
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Agregar
              </>
            )}
          </button>
        </div>

        {/* Enlace hacia la vista de detalle (Requerimiento #3) */}
        <Link to={`/producto/${id}`} className={styles.detailLink}>
          <Eye size={16} /> Ver Detalle
        </Link>
      </div>
    </article>
  );
};

export default Item;