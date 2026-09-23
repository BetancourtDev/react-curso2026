import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/useCart";
import styles from "./CartWidget.module.css";

const CartWidget = () => {
  const { totalItems } = useCart();

  return (
    <Link to="/carrito" className={styles.widget} title="Ver carrito de compras">
      <div className={styles.iconContainer}>
        <ShoppingCart size={22} className={styles.icon} />
        {totalItems > 0 && (
          <span className={styles.badge}>{totalItems > 99 ? "99+" : totalItems}</span>
        )}
      </div>
      <span className={styles.label}>Carrito</span>
    </Link>
  );
};

export default CartWidget;
