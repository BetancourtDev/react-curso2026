import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import TeamCard from "../team/TeamCard";
import styles from "./Footer.module.css";

const Footer = () => {
  const [equipo, setEquipo] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    fetch("/datos/equipo.json")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar equipo.json");
        return res.json();
      })
      .then((data) => setEquipo(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando equipo:", err));
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);
    }
  };


  return (
    <footer className={styles.footer}>
      {/* Sección 1: Nuestro Equipo (Tarjetas de personas) */}
      <div className={styles.teamSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Nuestro Equipo Profesional</h3>
            <p className={styles.sectionSubtitle}>
              Conoce a las personas dedicadas a brindarte la mejor experiencia de compra y tecnología.
            </p>
          </div>

          <div className={styles.teamGrid}>
            {equipo.map((persona) => (
              <TeamCard key={persona.id} persona={persona} />
            ))}
          </div>
        </div>
      </div>

      {/* Sección 2: Información Corporativa, Sucursales, Contacto y Newsletter */}
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <div className={styles.columnsGrid}>
            {/* Columna 1: Sucursales y Sedes */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>
                <MapPin size={18} className={styles.titleIcon} /> Sucursales y Sedes
              </h4>
              <ul className={styles.branchList}>
                <li className={styles.branchItem}>
                  <strong>Sede Central Palermo:</strong>
                  <span>Av. Santa Fe 3450, CABA</span>
                  <small>Lun a Sáb: 09:00 a 20:00 hs</small>
                </li>
                <li className={styles.branchItem}>
                  <strong>Sucursal Belgrano:</strong>
                  <span>Av. Cabildo 2120, CABA</span>
                  <small>Lun a Sáb: 09:30 a 20:30 hs</small>
                </li>
                <li className={styles.branchItem}>
                  <strong>Sede Rosario Centro:</strong>
                  <span>Peatonal Córdoba 1240, Santa Fe</span>
                  <small>Lun a Vie: 09:00 a 19:00 hs</small>
                </li>
              </ul>
            </div>

            {/* Columna 2: Canales de Contacto */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>
                <Phone size={18} className={styles.titleIcon} /> Canales de Atención
              </h4>
              <ul className={styles.contactList}>
                <li>
                  <Mail size={16} className={styles.listIcon} />
                  <span>
                    Consultas: <a href="mailto:soporte@lafruteriadelabuelo.com">soporte@betancourttech.com</a>
                  </span>
                </li>
                <li>
                  <Phone size={16} className={styles.listIcon} />
                  <span>Teléfono: +54 (11) 4567-8900</span>
                </li>
                <li>
                  <HelpCircle size={16} className={styles.listIcon} />
                  <span>Atención al cliente: Lun a Vie 8:00 a 20:00 hs</span>
                </li>
                <li>
                  <ShieldCheck size={16} className={styles.listIcon} />
                  <span>Defensa del Consumidor: Reclamos y asesoramiento 24/7</span>
                </li>
              </ul>
            </div>

            {/* Columna 3: Newsletter */}
            <div className={styles.column}>
              <h4 className={styles.columnTitle}>
                <Mail size={18} className={styles.titleIcon} /> Newsletter Exclusivo
              </h4>
              <p className={styles.newsletterText}>
                Suscríbete para recibir lanzamientos, descuentos de hasta 20% y novedades de productos.
              </p>

              {subscribed ? (
                <div className={styles.successMsg}>
                  <CheckCircle2 size={18} />
                  <span>¡Gracias por suscribirte! Revisa tu bandeja de entrada para reclamar tu 15% OFF.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico..."
                    required
                    className={styles.newsletterInput}
                  />
                  <button type="submit" className={styles.newsletterButton} title="Suscribirse">
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Fila Inferior: Propiedad Intelectual, Políticas y Legales */}
          <div className={styles.bottomBar}>
            <div className={styles.legalInfo}>
              <p className={styles.copyright}>
                © {new Date().getFullYear()} <strong>Betancourt Tech</strong> Todos los derechos reservados.
              </p>
              <p className={styles.ipNotice}>
                Aviso de Propiedad Intelectual: Los logotipos, marcas comerciales, imágenes, código fuente y contenidos multimedia presentados en este sitio web están protegidos por leyes nacionales e internacionales de propiedad intelectual y derechos de autor. Queda prohibida su reproducción sin autorización previa.
              </p>
            </div>

            <div className={styles.legalLinks}>
              <a href="#privacidad" onClick={(e) => { e.preventDefault(); alert("Políticas de Privacidad: Tratamiento seguro y confidencial de datos personales conforme a la ley vigente."); }}>
                Políticas de Privacidad
              </a>
              <span>•</span>
              <a href="#terminos" onClick={(e) => { e.preventDefault(); alert("Términos y Condiciones: La compra en este sitio implica la aceptación de los términos de garantía y envío."); }}>
                Términos del Servicio
              </a>
              <span>•</span>
              <a href="#cookies" onClick={(e) => { e.preventDefault(); alert("Política de Cookies: Utilizamos cookies técnicas estrictamente necesarias para el carrito y preferencias."); }}>
                Aviso Legal y Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;