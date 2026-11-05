import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, ShoppingBag } from "lucide-react";
import styles from "./NotFoundPage.module.css";

const NotFoundPage = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconBadge}>
          <AlertCircle size={36} />
        </div>
        <span className={styles.codeBadge}>Error 404</span>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.description}>
          Lo sentimos, la página que buscas no existe o fue trasladada a otra dirección.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.primaryBtn}>
            <ArrowLeft size={18} /> Volver al Inicio
          </Link>
          <Link to="/productos" className={styles.secondaryBtn}>
            <ShoppingBag size={18} /> Ver Catálogo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFoundPage;
