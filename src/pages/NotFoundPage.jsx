import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div style={{ textAlign: "center", padding: "4rem 1.5rem" }}>
      <AlertCircle size={48} color="#aa3bff" style={{ marginBottom: "1rem" }} />
      <h1 style={{ fontSize: "2.5rem", margin: "0 0 0.5rem" }}>404 - Página no encontrada</h1>
      <p style={{ color: "var(--text)", marginBottom: "2rem" }}>
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "var(--accent)",
          color: "#fff",
          padding: "0.75rem 1.5rem",
          borderRadius: "10px",
          textDecoration: "none",
          fontWeight: 600
        }}
      >
        <ArrowLeft size={18} /> Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
