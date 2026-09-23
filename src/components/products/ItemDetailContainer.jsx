import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import ItemDetail from "./ItemDetail";
import { fetchProductById } from "../../services/productService";
import styles from "./ItemDetailContainer.module.css";

const ItemDetailContainer = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchProductById(id)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "No se pudo cargar el producto.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <RefreshCw size={36} className={styles.spinner} />
        <p>Cargando información del producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className={styles.errorWrapper}>
        <AlertCircle size={36} className={styles.errorIcon} />
        <h2>Producto no encontrado</h2>
        <p>{error || "No pudimos localizar el producto solicitado."}</p>
        <Link to="/productos" className={styles.backButton}>
          <ArrowLeft size={16} /> Volver al Catálogo
        </Link>
      </div>
    );
  }

  return <ItemDetail product={product} />;
};

export default ItemDetailContainer;
