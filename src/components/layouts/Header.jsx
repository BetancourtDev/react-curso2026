import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cpu, Sun, Moon, Menu, X, Truck, CreditCard, BadgePercent } from "lucide-react";
import Nav from "./Nav";
import CartWidget from "../cart/CartWidget";
import styles from "./Header.module.css";

// Beneficios fijos de la barra superior (sin rotación: el carrusel queda solo en el hero).
const PROMO_ITEMS = [
  { id: "envio", icon: Truck, text: "Envío gratis desde AR$ 50.000" },
  { id: "cuotas", icon: CreditCard, text: "12 cuotas sin interés" },
  { id: "transferencia", icon: BadgePercent, text: "15% OFF por transferencia" },
];

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
    <>
      {/* Barra de beneficios: estática y fuera del header fijo, se va con el scroll */}
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
        {/* Barra Principal de Marca y Navegación */}
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
    </>
  );
};

export default Header;
