import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { LayoutGrid, LayoutDashboard, House } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { MAIN_CATEGORIES, categoryUrl } from "../../data/categories";
import styles from "./Nav.module.css";

// Barra de categorías debajo del header (en móvil se muestra dentro del menú).
const Nav = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const onCatalog = location.pathname === "/productos";
  const activeCategory = onCatalog ? searchParams.get("categoria") : null;

  const linkClass = (active) =>
    active ? `${styles.navLink} ${styles.activeLink}` : styles.navLink;

  return (
    <nav className={styles.navigation} aria-label="Categorías">
      <ul className={styles.navList}>
        <li className={styles.mobileOnly}>
          <NavLink to="/" end onClick={onNavigate} className={({ isActive }) => linkClass(isActive)}>
            <House size={16} /> Inicio
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/productos"
            onClick={onNavigate}
            className={() => `${linkClass(onCatalog && !activeCategory)} ${styles.allLink}`}
          >
            <LayoutGrid size={16} /> Todos los productos
          </NavLink>
        </li>
        {MAIN_CATEGORIES.map(({ name }) => (
          <li key={name}>
            <NavLink
              to={categoryUrl(name)}
              onClick={onNavigate}
              className={() => linkClass(activeCategory === name)}
            >
              {name}
            </NavLink>
          </li>
        ))}
        {isAdmin && (
          <li className={styles.adminItem}>
            <NavLink to="/admin" onClick={onNavigate} className={({ isActive }) => `${linkClass(isActive)} ${styles.adminLink}`}>
              <LayoutDashboard size={16} /> Panel Admin
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Nav;
