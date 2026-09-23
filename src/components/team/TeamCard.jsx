import styles from "./TeamCard.module.css";

const TeamCard = ({ persona }) => {
  const { nombre, rol, bio, imagen, email, especialidad } = persona;

  return (
    <div className={styles.card}>
      <div className={styles.avatarContainer}>
        <img
          src={imagen}
          alt={`Foto de ${nombre}`}
          className={styles.avatar}
          loading="lazy"
        />
        {especialidad && <span className={styles.badge}>{especialidad}</span>}
      </div>
      <div className={styles.info}>
        <h4 className={styles.name}>{nombre}</h4>
        <p className={styles.role}>{rol}</p>
        <p className={styles.bio}>{bio}</p>
        {email && (
          <a href={`mailto:${email}`} className={styles.contactLink}>
            {email}
          </a>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
