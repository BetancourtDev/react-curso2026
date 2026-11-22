import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Menu,
  X,
  Truck,
  CreditCard,
  BadgePercent,
  CircleUser,
  LogOut,
} from "lucide-react";
import Nav from "./Nav";
import SearchBar from "./SearchBar";
import CartWidget from "../cart/CartWidget";
import { useAuth } from "../../context/useAuth";
import styles from "./Header.module.css";

// Beneficios fijos de la barra superior.
const PROMO_ITEMS = [
  { id: "envio", icon: Truck, text: "Envío gratis desde AR$ 50.000" },
  { id: "cuotas", icon: CreditCard, text: "12 cuotas sin interés" },
  { id: "transferencia", icon: BadgePercent, text: "15% OFF por transferencia" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("tienda_theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {
      // Ignorar errores de almacenamiento
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("tienda_theme", theme);
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
      closeMobileMenu();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const firstName = user?.displayName?.split(" ")[0];

  return (
    <>
      <div className={styles.promoBar} role="region" aria-label="Beneficios de compra">
        <ul className={styles.promoList}>
          {PROMO_ITEMS.map(({ id, icon: Icon, text }) => (
            <li key={id} className={styles.promoItem}>
              <Icon size={14} aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <header className={styles.header}>
        <div className={styles.mainRow}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`${styles.iconBtn} ${styles.mobileMenuBtn}`}
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-navigation"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className={styles.brand} onClick={closeMobileMenu} aria-label="Betancourt Tech, ir al inicio">
            <span className={styles.brandMark} aria-hidden="true">B</span>
            <span className={styles.brandTitle}>
              Betancourt<span className={styles.brandAccent}>Tech</span>
            </span>
          </Link>

          <div className={styles.searchSlot}>
            <SearchBar onSearch={closeMobileMenu} />
          </div>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <div className={styles.account}>
                <Link to="/perfil" className={styles.accountLink} onClick={closeMobileMenu}>
                  <CircleUser size={22} />
                  <span className={styles.accountText}>
                    <small>Hola, {firstName || "cliente"}</small>
                    <strong>Mi cuenta</strong>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${styles.iconBtn} ${styles.logoutBtn}`}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.accountLink} onClick={closeMobileMenu}>
                <CircleUser size={22} />
                <span className={styles.accountText}>
                  <small>Ingresá</small>
                  <strong>Mi cuenta</strong>
                </span>
              </Link>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              className={`${styles.iconBtn} ${styles.themeBtn}`}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <CartWidget />
          </div>
        </div>

        <div
          id="primary-navigation"
          className={`${styles.categoryBar} ${mobileMenuOpen ? styles.categoryBarOpen : ""}`}
        >
          <div className={styles.categoryInner}>
            <Nav onNavigate={closeMobileMenu} />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
