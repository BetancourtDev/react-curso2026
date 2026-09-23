import { Link } from "react-router-dom";
import { Cpu } from "lucide-react";
import Nav from "./Nav";
import CartWidget from "../cart/CartWidget";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand} title="Ir a Inicio">
          <div className={styles.logoBadge}>
            <Cpu size={22} className={styles.brandIcon} />
          </div>
          <span className={styles.brandTitle}>Betancourt Tech</span>
        </Link>

        <div className={styles.navGroup}>
          <Nav />
          <CartWidget />
        </div>
      </div>
    </header>
  );
};

export default Header;