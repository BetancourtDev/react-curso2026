import {
  NavLink,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import {
  User,
  LogOut,
  LogIn,
  LayoutDashboard,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import styles from "./Nav.module.css";

const Nav = ({ onNavigate }) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get("buscar") || "";

  const handleSearchChange = (event) => {
    const value = event.target.value;
    const isCatalogView =
      location.pathname === "/" || location.pathname === "/productos";

    if (!isCatalogView && value.trim()) {
      navigate(`/productos?buscar=${encodeURIComponent(value)}`);
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("buscar", value);
    } else {
      nextParams.delete("buscar");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("buscar");
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (location.pathname !== "/" && location.pathname !== "/productos") {
      navigate(
        searchQuery.trim()
          ? `/productos?buscar=${encodeURIComponent(searchQuery)}`
          : "/productos"
      );
    }
    onNavigate?.();
  };

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
      {/* Buscador en tiempo real integrado en el Nav */}
      <form
        className={styles.navSearchForm}
        onSubmit={handleSearchSubmit}
        role="search"
      >
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar productos..."
          className={styles.searchInput}
          aria-label="Buscar productos por nombre o descripción"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className={styles.clearSearchBtn}
            title="Limpiar búsqueda"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </button>
        )}
      </form>

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
        {isAdmin && (
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
        )}

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
        )}
      </ul>
    </nav>
  );
};

export default Nav;
