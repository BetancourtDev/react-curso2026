import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Cpu,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Truck,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";
import Nav from "./Nav";
import CartWidget from "../cart/CartWidget";
import styles from "./Header.module.css";

const PROMO_SLIDES = [
  {
    id: "cyber",
    icon: Flame,
    badge: "HOT SALE",
    text: "20% OFF en Monitores, Audio y Gaming con el cupón",
    coupon: "BETANCOURT20",
    ctaText: "Ver ofertas",
    ctaLink: "/productos",
  },
  {
    id: "shipping",
    icon: Truck,
    badge: "ENVÍO GRATIS",
    text: "Despacho sin cargo a todo el país en compras mayores a AR$ 50.000",
    ctaText: "Ir al catálogo",
    ctaLink: "/productos",
  },
  {
    id: "installments",
    icon: CreditCard,
    badge: "FINANCIACIÓN",
    text: "Hasta 12 cuotas sin interés con tarjetas bancarias + 15% OFF por transferencia",
    ctaText: "Aprovechar",
    ctaLink: "/productos",
  },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

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

  // Rotación automática del slider promocional del Header
  useEffect(() => {
    if (isPaused) return undefined;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + PROMO_SLIDES.length) % PROMO_SLIDES.length
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % PROMO_SLIDES.length);
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2200);
  };

  const activePromo = PROMO_SLIDES[currentSlide];
  const SlideIcon = activePromo.icon;

  return (
    <header className={styles.header}>
      {/* Slider Promocional Superior */}
      <div
        className={styles.promoSliderBar}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-label="Promociones destacadas"
      >
        <div className={styles.promoSliderInner}>
          <button
            type="button"
            onClick={handlePrevSlide}
            className={styles.sliderArrow}
            aria-label="Promoción anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.slideContent} key={activePromo.id}>
            <span className={styles.promoBadge}>
              <SlideIcon size={13} />
              {activePromo.badge}
            </span>

            <span className={styles.promoText}>{activePromo.text}</span>

            {activePromo.coupon && (
              <button
                type="button"
                onClick={() => handleCopyCoupon(activePromo.coupon)}
                className={styles.couponPill}
                title="Clic para copiar cupón"
              >
                <code>{activePromo.coupon}</code>
                {copiedCoupon ? <Check size={12} /> : <Copy size={12} />}
              </button>
            )}

            <Link
              to={activePromo.ctaLink}
              className={styles.promoLink}
              onClick={closeMobileMenu}
            >
              {activePromo.ctaText} →
            </Link>
          </div>

          <div className={styles.sliderRightControls}>
            <div className={styles.sliderDots} role="tablist">
              {PROMO_SLIDES.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={currentSlide === index}
                  aria-label={`Ver promoción ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`${styles.dot} ${
                    currentSlide === index ? styles.dotActive : ""
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextSlide}
              className={styles.sliderArrow}
              aria-label="Siguiente promoción"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

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
  );
};

export default Header;
