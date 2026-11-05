import { Navigate, useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import styles from "./ProtectedRoute.module.css";

/**
 * ProtectedRoute: Componente de orden superior que restringe el acceso
 * a rutas exclusivas para usuarios autenticados.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status" aria-live="polite">
        <RefreshCw size={28} className={styles.spinner} />
        <p className={styles.loadingText}>Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

