import Header from "./Header";
import Footer from "./Footer";
import styles from "./Layout.module.css";

const Layout = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <a href="#main-content" className={styles.skipLink}>
        Saltar al contenido principal
      </a>
      <Header />
      <main id="main-content" className={styles.mainContent} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
