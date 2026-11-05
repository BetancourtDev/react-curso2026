import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/useAuth";
import styles from "./AuthPages.module.css";

const getFirebaseAuthErrorMessage = (code) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Correo electrónico o contraseña incorrectos.";
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido.";
    case "auth/user-disabled":
      return "Esta cuenta de usuario ha sido deshabilitada.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Intenta nuevamente más tarde.";
    default:
      return "No se pudo iniciar sesión. Verifica tus credenciales e intenta de nuevo.";
  }
};

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Ruta a la que se redirigirá tras iniciar sesión
  const redirectPath = location.state?.from?.pathname || "/perfil";
  const wasRedirectedFromProtected = Boolean(location.state?.from);

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form.email, form.password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Error al iniciar sesión en Firebase Auth:", err);
      setError(getFirebaseAuthErrorMessage(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.iconBadge}>
            <LogIn size={22} />
          </span>
          <div>
            <p className={styles.eyebrow}>Acceso de usuarios</p>
            <h1 className={styles.title}>Iniciar sesión</h1>
            <p className={styles.subtitle}>
              Ingresa con tu cuenta para acceder a tu perfil y al panel de gestión.
            </p>
          </div>
        </header>

        {wasRedirectedFromProtected && (
          <div className={styles.infoNotice} role="status">
            <ShieldAlert size={18} />
            <span>Debes iniciar sesión para acceder a esa sección.</span>
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Correo electrónico</span>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className={styles.field}>
            <span>Contraseña</span>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                minLength={6}
                required
              />
            </div>
          </label>

          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? (
              <>
                <RefreshCw size={18} className={styles.spinner} />
                Ingresando...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          ¿Aún no tienes una cuenta?
          <Link
            to="/registro"
            state={location.state}
            className={styles.switchLink}
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;

