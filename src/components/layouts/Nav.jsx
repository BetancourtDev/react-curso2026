import { NavLink, useNavigate } from "react-router-dom";
import { User, LogOut, LogIn, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import styles from "./Nav.module.css";

const Nav = ({ onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onNavigate?.();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className={styles.navigation} aria-label="Navegación principal">
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <NavLink
            to="/"
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
            }
          >
            Inicio
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            to="/productos"
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
            }
          >
            Productos
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            to="/admin"
            onClick={onNavigate}
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
            }
          >
            <LayoutDashboard size={16} />
            <span>Panel Admin</span>
          </NavLink>
        </li>

        {isAuthenticated ? (
          <>
            <li className={styles.navItem}>
              <NavLink
                to="/perfil"
                onClick={onNavigate}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
                }
              >
                <User size={16} />
                <span>{user?.displayName || "Mi Perfil"}</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutBtn}
                title="Cerrar sesión"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li className={styles.navItem}>
              <NavLink
                to="/login"
                onClick={onNavigate}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
                }
              >
                <LogIn size={16} />
                <span>Ingresar</span>
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink
                to="/registro"
                onClick={onNavigate}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.registerLink} ${styles.activeLink}`
                    : `${styles.navLink} ${styles.registerLink}`
                }
              >
                Registrarse
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
