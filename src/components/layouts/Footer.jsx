import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, CheckCircle2, Lock } from "lucide-react";
import { MAIN_CATEGORIES, categoryUrl } from "../../data/categories";
import styles from "./Footer.module.css";

const PAYMENT_METHODS = ["Visa", "Mastercard", "Amex", "Mercado Pago", "Transferencia", "Efectivo"];

// Páginas informativas que todavía no existen: muestran un aviso en lugar de navegar.
const infoLink = (label, message) => ({ label, message });

const HELP_LINKS = [
  infoLink("Cómo comprar", "Elegí tus productos, agregalos al carrito y finalizá la compra desde /carrito."),
  infoLink("Envíos y entregas", "Envíos a todo el país en 24/48 hs. Gratis en compras desde AR$ 50.000."),
  infoLink("Cambios y devoluciones", "Tenés 30 días desde la entrega para cambiar o devolver tu producto."),
  infoLink("Garantía", "Todos los productos tienen 12 meses de garantía oficial."),
  infoLink("Preguntas frecuentes", "Escribinos a soporte@betancourttech.com y te respondemos en el día."),
];

const LEGAL_LINKS = [
  infoLink("Términos y condiciones", "La compra en este sitio implica la aceptación de los términos de garantía y envío."),
  infoLink("Políticas de privacidad", "Tratamos tus datos personales de forma segura y confidencial conforme a la ley vigente."),
  infoLink("Política de cookies", "Usamos cookies técnicas estrictamente necesarias para el carrito y tus preferencias."),
];

const InfoButton = ({ label, message }) => (
  <button type="button" className={styles.linkButton} onClick={() => alert(`${label}: ${message}`)}>
    {label}
  </button>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className={styles.footer}>
      {/* Newsletter */}
      <div className={styles.newsletterBand}>
        <div className={`${styles.container} ${styles.newsletterInner}`}>
          <div>
            <p className={styles.newsletterTitle}>Suscribite y obtené 15% OFF en tu primera compra</p>
            <p className={styles.newsletterText}>
              Recibí lanzamientos, ofertas exclusivas y novedades. Sin spam.
            </p>
          </div>
          {subscribed ? (
            <div className={styles.successMsg} role="status">
              <CheckCircle2 size={18} />
              <span>¡Listo! Revisá tu correo para obtener tu cupón.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                required
                aria-label="Correo electrónico"
                className={styles.newsletterInput}
              />
              <button type="submit" className={styles.newsletterButton}>
                Suscribirme
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Columnas de links */}
      <div className={styles.container}>
        <div className={styles.columnsGrid}>
          <div className={styles.brandColumn}>
            <Link to="/" className={styles.brand}>
              <span className={styles.brandMark} aria-hidden="true">B</span>
              <span>
                Betancourt<span className={styles.brandAccent}>Tech</span>
              </span>
            </Link>
            <p className={styles.brandText}>
              Tecnología, gaming y audio con garantía oficial y envíos a todo el país.
            </p>
            <ul className={styles.contactList}>
              <li>
                <Phone size={15} aria-hidden="true" /> +54 (11) 4567-8900
              </li>
              <li>
                <Mail size={15} aria-hidden="true" />
                <a href="mailto:soporte@betancourttech.com">soporte@betancourttech.com</a>
              </li>
              <li>
                <Clock size={15} aria-hidden="true" /> Lun a Vie de 8 a 20 hs
              </li>
              <li>
                <MapPin size={15} aria-hidden="true" /> Av. Santa Fe 3450, CABA
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Categorías</h3>
            <ul className={styles.linkList}>
              {MAIN_CATEGORIES.slice(0, 6).map(({ name }) => (
                <li key={name}>
                  <Link to={categoryUrl(name)}>{name}</Link>
                </li>
              ))}
              <li>
                <Link to="/productos">Ver todo</Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Ayuda</h3>
            <ul className={styles.linkList}>
              {HELP_LINKS.map((link) => (
                <li key={link.label}>
                  <InfoButton {...link} />
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Mi cuenta</h3>
            <ul className={styles.linkList}>
              <li><Link to="/perfil">Mi perfil</Link></li>
              <li><Link to="/carrito">Mi carrito</Link></li>
              <li><Link to="/login">Ingresar</Link></li>
              <li><Link to="/registro">Crear cuenta</Link></li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>Empresa</h3>
            <ul className={styles.linkList}>
              <li><Link to="/nosotros">Quiénes somos</Link></li>
              <li><Link to="/nosotros#sucursales">Sucursales</Link></li>
              <li><a href="mailto:soporte@betancourttech.com">Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Medios de pago */}
        <div className={styles.paymentsRow}>
          <div>
            <p className={styles.paymentsTitle}>Medios de pago</p>
            <ul className={styles.paymentList}>
              {PAYMENT_METHODS.map((method) => (
                <li key={method} className={styles.paymentBadge}>{method}</li>
              ))}
            </ul>
          </div>
          <p className={styles.secureNote}>
            <Lock size={15} aria-hidden="true" /> Compra 100% segura · Datos encriptados
          </p>
        </div>

        {/* Legales */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Betancourt Tech S.R.L. · CUIT 30-71234567-8 · Todos los derechos reservados.
          </p>
          <ul className={styles.legalLinks}>
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <InfoButton {...link} />
              </li>
            ))}
            <li>
              <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor" target="_blank" rel="noreferrer">
                Defensa del consumidor
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
