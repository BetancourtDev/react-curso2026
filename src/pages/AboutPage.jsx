import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, MapPin, Clock } from "lucide-react";
import TeamCard from "../components/team/TeamCard";
import styles from "./AboutPage.module.css";

const SUCURSALES = [
  { id: "palermo", nombre: "Sede Central Palermo", direccion: "Av. Santa Fe 3450, CABA", horario: "Lun a Sáb: 09:00 a 20:00 hs" },
  { id: "belgrano", nombre: "Sucursal Belgrano", direccion: "Av. Cabildo 2120, CABA", horario: "Lun a Sáb: 09:30 a 20:30 hs" },
  { id: "rosario", nombre: "Sede Rosario Centro", direccion: "Peatonal Córdoba 1240, Santa Fe", horario: "Lun a Vie: 09:00 a 19:00 hs" },
];

const AboutPage = () => {
  const [equipo, setEquipo] = useState([]);

  useEffect(() => {
    fetch("/datos/equipo.json")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar equipo.json");
        return res.json();
      })
      .then((data) => setEquipo(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error cargando equipo:", err));
  }, []);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
        <Link to="/">Inicio</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">Quiénes somos</span>
      </nav>

      <section className={styles.intro}>
        <h1>Quiénes somos</h1>
        <p>
          En Betancourt Tech acercamos la mejor tecnología, gaming y audio a todo el país,
          con garantía oficial, envíos rápidos y un equipo que te asesora de verdad.
        </p>
      </section>

      <section aria-labelledby="equipo">
        <h2 id="equipo" className={styles.sectionTitle}>Nuestro equipo</h2>
        <div className={styles.teamGrid}>
          {equipo.map((persona) => (
            <TeamCard key={persona.id} persona={persona} />
          ))}
        </div>
      </section>

      <section id="sucursales" aria-labelledby="sucursales-title">
        <h2 id="sucursales-title" className={styles.sectionTitle}>Sucursales</h2>
        <ul className={styles.branchGrid}>
          {SUCURSALES.map((s) => (
            <li key={s.id} className={styles.branchCard}>
              <strong>{s.nombre}</strong>
              <span><MapPin size={15} aria-hidden="true" /> {s.direccion}</span>
              <span><Clock size={15} aria-hidden="true" /> {s.horario}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AboutPage;
