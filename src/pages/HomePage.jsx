import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Truck, Headphones } from "lucide-react";
import ItemListContainer from "../components/products/ItemListContainer";
import styles from "./HomePage.module.css";

const HomePage = () => {
  return (
    <div className={styles.homeContainer}>
      {/* Banner Hero */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Tecnología y Estilo para tu Día a Día
        </h1>
        <p className={styles.heroSubtitle}>
          Encuentra los mejores productos seleccionados con calidad garantizada, atención personalizada y la máxima confianza.
        </p>
        <div className={styles.heroActions}>
          <Link to="/productos" className={styles.primaryBtn}>
            Explorar Catálogo <ArrowRight size={18} />
          </Link>
          <Link to="/carrito" className={styles.secondaryBtn}>
            Ver Carrito
          </Link>
        </div>
      </section>

      {/* Franja de Beneficios */}
      <section className={styles.perksSection}>
        <div className={styles.perkCard}>
          <Truck className={styles.perkIcon} size={28} />
          <div>
            <h4 className={styles.perkTitle}>Envíos Rápidos</h4>
            <p className={styles.perkDesc}>Entregas seguras en 24/48 horas a todo el territorio nacional.</p>
          </div>
        </div>
        <div className={styles.perkCard}>
          <ShieldCheck className={styles.perkIcon} size={28} />
          <div>
            <h4 className={styles.perkTitle}>Compra 100% Protegida</h4>
            <p className={styles.perkDesc}>Garantía oficial y pagos encriptados de extremo a extremo.</p>
          </div>
        </div>
        <div className={styles.perkCard}>
          <Headphones className={styles.perkIcon} size={28} />
          <div>
            <h4 className={styles.perkTitle}>Soporte Dedicado</h4>
            <p className={styles.perkDesc}>Equipo de asesores humanos listos para resolver cualquier consulta.</p>
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
