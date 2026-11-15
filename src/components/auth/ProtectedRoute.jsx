import { Link, Navigate, useLocation } from "react-router-dom";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import styles from "./ProtectedRoute.module.css";

/**
 * ProtectedRoute: restringe el acceso a rutas exclusivas para usuarios autenticados.
 * Con `requireAdmin`, además exige que el usuario tenga rol de administrador.
 *
 * Importante: esto solo controla la interfaz. La seguridad real la imponen
 * las reglas de Firestore (firestore.rules).
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
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

  if (requireAdmin && !isAdmin) {
    return (
      <div className={styles.loadingContainer} role="alert">
        <ShieldAlert size={28} className={styles.deniedIcon} />
        <p className={styles.loadingText}>
          No tienes permisos de administrador para ver esta página.
        </p>
        <Link to="/" className={styles.homeLink}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
