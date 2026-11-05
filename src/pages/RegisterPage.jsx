import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { UserPlus, User, Mail, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../context/useAuth";
import styles from "./AuthPages.module.css";

const getFirebaseRegisterErrorMessage = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado.";
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido.";
    case "auth/weak-password":
      return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
    default:
      return "No se pudo completar el registro. Intenta nuevamente.";
  }
};

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectPath = location.state?.from?.pathname || "/perfil";

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
    setError("");

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      await register(form.email, form.password, form.displayName);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Error al registrar usuario en Firebase Auth:", err);
      setError(getFirebaseRegisterErrorMessage(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.iconBadge}>
            <UserPlus size={22} />
          </span>
          <div>
            <p className={styles.eyebrow}>Nueva cuenta</p>
            <h1 className={styles.title}>Crear cuenta</h1>
            <p className={styles.subtitle}>
              Regístrate en Betancourt Tech para gestionar productos y tu perfil.
            </p>
          </div>
        </header>

        {error && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nombre completo</span>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                placeholder="Ej. Ana Betancourt"
                maxLength={80}
                autoComplete="name"
                required
              />
            </div>
          </label>

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
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </label>

          <label className={styles.field}>
            <span>Confirmar contraseña</span>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </label>

          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? (
              <>
                <RefreshCw size={18} className={styles.spinner} />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Registrarme
              </>
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes una cuenta?
          <Link
            to="/login"
            state={location.state}
            className={styles.switchLink}
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;

