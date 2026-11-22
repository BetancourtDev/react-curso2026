import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Zap,
  CreditCard,
  RotateCcw,
  Gamepad2,
} from "lucide-react";
import ItemListContainer from "../components/products/ItemListContainer";
import { MAIN_CATEGORIES, categoryUrl } from "../data/categories";
import styles from "./HomePage.module.css";

const PERKS = [
  { icon: Truck, title: "Envío gratis", desc: "En compras desde AR$ 50.000" },
  { icon: CreditCard, title: "12 cuotas sin interés", desc: "Con todas las tarjetas" },
  { icon: ShieldCheck, title: "Garantía oficial", desc: "12 meses en todos los productos" },
  { icon: RotateCcw, title: "Devolución gratis", desc: "Tenés 30 días para cambiarlo" },
  { icon: Headphones, title: "Atención personalizada", desc: "Lun a Vie de 8 a 20 hs" },
];

const HERO_SLIDES = [
  {
    id: 1,
    badge: "CYBER TECH WEEK · 20% OFF",
    badgeIcon: Flame,
    title: "Tu setup gamer, al máximo",
    subtitle:
      "Monitores de 165 Hz, teclados mecánicos y periféricos livianos, en hasta 12 cuotas sin interés.",
    discountTag: "Cupón: BETANCOURT20",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    primaryText: "Ver ofertas",
    primaryLink: "/productos",
    secondaryText: "Ver carrito",
    secondaryLink: "/carrito",
  },
  {
    id: 2,
    badge: "AUDIO HI-RES",
    badgeIcon: Sparkles,
    title: "Sonido inmersivo, cero ruido",
    subtitle:
      "Auriculares con cancelación activa, micrófonos de estudio y parlantes para creadores y audiófilos.",
    discountTag: "Envío GRATIS > AR$ 50.000",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    primaryText: "Ver audio",
    primaryLink: "/productos",
    secondaryText: "Ir al carrito",
    secondaryLink: "/carrito",
  },
  {
    id: 3,
    badge: "NUEVOS INGRESOS",
    badgeIcon: Zap,
    title: "Notebooks, drones y VR de última generación",
    subtitle:
      "Con garantía oficial de 12 meses y 15% OFF extra pagando por transferencia.",
    discountTag: "15% OFF transferencia",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
    primaryText: "Ver catálogo",
    primaryLink: "/productos",
    secondaryText: "Mi carrito",
    secondaryLink: "/carrito",
  },
];

const HomePage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  // Sin rotación automática si el usuario pidió reducir el movimiento.
  const [reducedMotion] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );

  useEffect(() => {
    if (paused || reducedMotion) return undefined;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [paused, reducedMotion]);

  const prevSlide = () => {
    setActiveSlide(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length
    );
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const slide = HERO_SLIDES[activeSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div className={styles.homeContainer}>
      {/* Slider Promocional Principal (Hero) */}
      <section
        className={styles.heroSlider}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        aria-label="Carrusel de promociones principales"
      >
        <div className={styles.slideGrid} key={slide.id}>
          <div className={styles.slideTextCol}>
            <div className={styles.badgeRow}>
              <span className={styles.heroBadge}>
                <BadgeIcon size={14} />
                {slide.badge}
              </span>
              <span className={styles.discountChip}>{slide.discountTag}</span>
            </div>

            <h1 className={styles.heroTitle}>{slide.title}</h1>
            <p className={styles.heroSubtitle}>{slide.subtitle}</p>

            <div className={styles.heroActions}>
              <Link to={slide.primaryLink} className={styles.primaryBtn}>
                {slide.primaryText} <ArrowRight size={18} />
              </Link>
              <Link to={slide.secondaryLink} className={styles.secondaryBtn}>
                {slide.secondaryText}
              </Link>
            </div>
          </div>

          <div className={styles.slideImageCol}>
            <div className={styles.imageFrame}>
              <img
                src={slide.image}
                alt={slide.title}
                className={styles.slideImage}
              />
            </div>
          </div>
        </div>

        {/* Controles del Slider: Flechas e Indicadores */}
        <div className={styles.sliderControlsBar}>
          <div className={styles.dotsContainer} role="tablist">
            {HERO_SLIDES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeSlide === idx}
                aria-label={`Ir a promoción ${idx + 1}`}
                onClick={() => setActiveSlide(idx)}
                className={`${styles.sliderDot} ${
                  activeSlide === idx ? styles.sliderDotActive : ""
                }`}
              />
            ))}
          </div>

          <div className={styles.arrowsGroup}>
            <button
              type="button"
              onClick={prevSlide}
              className={styles.arrowBtn}
              aria-label="Anterior diapositiva"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className={styles.arrowBtn}
              aria-label="Siguiente diapositiva"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Franja de beneficios */}
      <section className={styles.perksStrip} aria-label="Beneficios">
        {PERKS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className={styles.perkItem}>
            <Icon className={styles.perkIcon} size={26} aria-hidden="true" />
            <div>
              <p className={styles.perkTitle}>{title}</p>
              <p className={styles.perkDesc}>{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Comprar por categoría */}
      <section aria-labelledby="home-categorias">
        <div className={styles.sectionHeader}>
          <h2 id="home-categorias" className={styles.sectionTitle}>
            Comprá por categoría
          </h2>
          <Link to="/productos" className={styles.seeAllLink}>
            Ver todo <ArrowRight size={16} />
          </Link>
        </div>
        <ul className={styles.categoryGrid}>
          {MAIN_CATEGORIES.map(({ name, icon: Icon, tagline }) => (
            <li key={name}>
              <Link to={categoryUrl(name)} className={styles.categoryCard}>
                <span className={styles.categoryIcon}>
                  <Icon size={26} aria-hidden="true" />
                </span>
                <span className={styles.categoryName}>{name}</span>
                <span className={styles.categoryTagline}>{tagline}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Más vendidos */}
      <section className={styles.catalogSection}>
        <ItemListContainer
          variant="featured"
          title="Los más elegidos"
          subtitle="Los productos mejor valorados por nuestros clientes."
          limit={8}
        />
      </section>

      {/* Banners promocionales */}
      <section className={styles.promoBanners} aria-label="Promociones">
        <Link to={categoryUrl("Gaming")} className={`${styles.promoBanner} ${styles.promoBannerDark}`}>
          <span className={styles.promoKicker}>Semana gamer</span>
          <span className={styles.promoHeadline}>Hasta 20% OFF en Gaming</span>
          <span className={styles.promoCta}>
            Comprar ahora <ArrowRight size={16} />
          </span>
          <Gamepad2 className={styles.promoDecor} size={120} aria-hidden="true" />
        </Link>
        <Link to="/productos" className={`${styles.promoBanner} ${styles.promoBannerAmber}`}>
          <span className={styles.promoKicker}>Pagá como quieras</span>
          <span className={styles.promoHeadline}>12 cuotas sin interés con todas las tarjetas</span>
          <span className={styles.promoCta}>
            Ver productos <ArrowRight size={16} />
          </span>
          <CreditCard className={styles.promoDecor} size={120} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
