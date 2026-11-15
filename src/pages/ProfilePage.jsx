import { Link, useNavigate } from "react-router-dom";
import { User, Mail, ShieldCheck, LayoutDashboard, ShoppingBag, LogOut, Calendar } from "lucide-react";
import { useAuth } from "../context/useAuth";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const displayName = user?.displayName || "Usuario registrado";
  const email = user?.email || "";
  const createdAt = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sesión activa";

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.avatarBadge}>
            <User size={28} />
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.statusBadge}>
              <ShieldCheck size={14} /> Cuenta verificada
            </span>
            <h1 className={styles.title}>{displayName}</h1>
            <p className={styles.subtitle}>{email}</p>
          </div>
        </header>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Mail size={18} className={styles.infoIcon} />
            <div>
              <span className={styles.infoLabel}>Correo electrónico</span>
              <strong className={styles.infoValue}>{email}</strong>
            </div>
          </div>

          <div className={styles.infoItem}>
            <Calendar size={18} className={styles.infoIcon} />
            <div>
              <span className={styles.infoLabel}>Miembro desde</span>
              <strong className={styles.infoValue}>{createdAt}</strong>
            </div>
          </div>
        </div>

        <div className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Accesos rápidos</h2>
          <div className={styles.actionsGrid}>
            {isAdmin && (
              <Link to="/admin" className={styles.actionCard}>
                <span className={styles.actionIcon}>
                  <LayoutDashboard size={20} />
                </span>
                <div>
                  <strong>Panel de Administración</strong>
                  <p>Gestionar inventario, crear, editar y eliminar productos</p>
                </div>
              </Link>
            )}

            <Link to="/carrito" className={styles.actionCard}>
              <span className={styles.actionIcon}>
                <ShoppingBag size={20} />
              </span>
              <div>
                <strong>Mi carrito</strong>
                <p>Revisar productos seleccionados y finalizar compra</p>
              </div>
            </Link>
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </footer>
      </div>
    </section>
  );
};

export default ProfilePage;

