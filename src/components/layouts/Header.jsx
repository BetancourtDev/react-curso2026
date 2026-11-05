import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cpu, Sun, Moon, Menu, X } from "lucide-react";
import Nav from "./Nav";
import CartWidget from "../cart/CartWidget";
import styles from "./Header.module.css";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link
          to="/"
          className={styles.brand}
          title="Ir a Inicio"
          onClick={closeMobileMenu}
        >
          <div className={styles.logoBadge}>
            <Cpu size={22} className={styles.brandIcon} />
          </div>
          <span className={styles.brandTitle}>Betancourt Tech</span>
        </Link>

        <div className={styles.navGroup}>
          <div
            id="primary-navigation"
            className={`${styles.navContainer} ${
              mobileMenuOpen ? styles.navContainerOpen : ""
            }`}
          >
            <Nav onNavigate={closeMobileMenu} />
          </div>

          <div className={styles.quickActions}>
            <button
              type="button"
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
              aria-label={
                theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
              title={
                theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <CartWidget />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={styles.mobileMenuBtn}
              aria-expanded={mobileMenuOpen}
              aria-controls="primary-navigation"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
