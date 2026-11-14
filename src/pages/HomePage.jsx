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
} from "lucide-react";
import ItemListContainer from "../components/products/ItemListContainer";
import styles from "./HomePage.module.css";

const HERO_SLIDES = [
  {
    id: 1,
    badge: "CYBER TECH WEEK • HASTA 20% OFF",
    badgeIcon: Flame,
    title: "Potencia tu Setup Gamer al Máximo Nivel",
    subtitle:
      "Monitores curvos de 165Hz, teclados mecánicos RGB y periféricos ultralivianos con hasta 12 cuotas sin interés.",
    discountTag: "Cupón: BETANCOURT20",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
    primaryText: "Explorar Ofertas",
    primaryLink: "/productos",
    secondaryText: "Ver Carrito",
    secondaryLink: "/carrito",
  },
  {
    id: 2,
    badge: "SONIDO HI-RES & STREAMING PRO",
    badgeIcon: Sparkles,
    title: "Audio Inmersivo con Cancelación Activa",
    subtitle:
      "Descubre auriculares inalámbricos, micrófonos de estudio y parlantes waterproof diseñados para creadores y audiófilos.",
    discountTag: "Envío GRATIS > AR$ 50.000",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    primaryText: "Ver Audio y Tecnología",
    primaryLink: "/productos",
    secondaryText: "Ir al Carrito",
    secondaryLink: "/carrito",
  },
  {
    id: 3,
    badge: "NUEVOS INGRESOS • ALTO RENDIMIENTO",
    badgeIcon: Zap,
    title: "Notebooks RTX, Drones 4K y Realidad Virtual",
    subtitle:
      "Equipamiento de última generación con garantía oficial de 12 meses y 15% de descuento extra abonando por transferencia.",
    discountTag: "15% OFF Transferencia",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80",
    primaryText: "Ver Catálogo Completo",
    primaryLink: "/productos",
    secondaryText: "Mi Carrito",
    secondaryLink: "/carrito",
  },
];

const HomePage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [paused]);

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

      {/* Franja de Beneficios */}
      <section className={styles.perksSection}>
        <div className={styles.perkCard}>
          <Truck className={styles.perkIcon} size={28} />
          <div>
            <h4 className={styles.perkTitle}>Envíos Rápidos</h4>
            <p className={styles.perkDesc}>
              Entregas seguras en 24/48 horas a todo el territorio nacional.
            </p>
          </div>
        </div>
        <div className={styles.perkCard}>
          <ShieldCheck className={styles.perkIcon} size={28} />
          <div>
            <h4 className={styles.perkTitle}>Compra 100% Protegida</h4>
            <p className={styles.perkDesc}>
              Garantía oficial y pagos encriptados de extremo a extremo.
            </p>
          </div>
        </div>
        <div className={styles.perkCard}>
          <Headphones className={styles.perkIcon} size={28} />
          <div>
            <h4 className={styles.perkTitle}>Soporte Dedicado</h4>
            <p className={styles.perkDesc}>
              Equipo de asesores humanos listos para resolver cualquier consulta.
            </p>
          </div>
        </div>
      </section>

      {/* Catálogo en Home */}
      <section className={styles.catalogSection}>
        <ItemListContainer title="Nuestros Productos Destacados" />
      </section>
    </div>
  );
};

export default HomePage;
