import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  LogIn,
  UserPlus,
  User,
  Mail,
  Lock,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/useAuth";
import styles from "./AuthPages.module.css";

const getFirebaseAuthErrorMessage = (code, isRegisterMode) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Correo electrónico o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Este correo electrónico ya está registrado. Inicia sesión con tu cuenta.";
    case "auth/invalid-email":
      return "El formato del correo electrónico no es válido.";
    case "auth/weak-password":
      return "La contraseña es muy débil. Debe tener al menos 6 caracteres.";
    case "auth/user-disabled":
      return "Esta cuenta de usuario ha sido deshabilitada.";
    case "auth/too-many-requests":
      return "Demasiados intentos fallidos. Intenta nuevamente más tarde.";
    default:
      return isRegisterMode
        ? "No se pudo completar el registro. Intenta nuevamente."
        : "No se pudo iniciar sesión. Verifica tus credenciales e intenta de nuevo.";
  }
};

const LoginPage = ({ initialMode = "login" }) => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(
    location.pathname === "/registro" ? "register" : initialMode
  );
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  // Ruta a la que se redirigirá tras autenticarse
  const redirectPath = location.state?.from?.pathname || "/perfil";
  const wasRedirectedFromProtected = Boolean(location.state?.from);

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const switchMode = (targetMode) => {
    setMode(targetMode);
    setError("");
  };

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

    if (isRegister && form.password !== form.confirmPassword) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      if (isRegister) {
        await register(form.email, form.password, form.displayName);
      } else {
        await login(form.email, form.password);
      }
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Error de autenticación en Firebase Auth:", err);
      setError(getFirebaseAuthErrorMessage(err.code, isRegister));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        {/* Selector de pestaña unificado: Iniciar sesión / Crear cuenta */}
        <div className={styles.modeTabs} role="tablist" aria-label="Modo de acceso">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegister}
            onClick={() => switchMode("login")}
            className={`${styles.modeTab} ${
              !isRegister ? styles.modeTabActive : ""
            }`}
          >
            <LogIn size={16} />
            <span>Iniciar sesión</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            onClick={() => switchMode("register")}
            className={`${styles.modeTab} ${
              isRegister ? styles.modeTabActive : ""
            }`}
          >
            <UserPlus size={16} />
            <span>Crear cuenta</span>
          </button>
        </div>

        <header className={styles.header}>
          <span className={styles.iconBadge}>
            {isRegister ? <UserPlus size={22} /> : <LogIn size={22} />}
          </span>
          <div>
            <p className={styles.eyebrow}>
              {isRegister ? "Nuevo usuario" : "Acceso de usuarios"}
            </p>
            <h1 className={styles.title}>
              {isRegister ? "Crear una cuenta" : "Iniciar sesión"}
            </h1>
            <p className={styles.subtitle}>
              {isRegister
                ? "Regístrate en Betancourt Tech para gestionar el catálogo y tu perfil."
                : "Ingresa con tu cuenta para acceder a tu perfil y al panel de administración."}
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
          {isRegister && (
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
          )}

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
                placeholder={isRegister ? "Mínimo 6 caracteres" : "••••••••"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </div>
          </label>

          {isRegister && (
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
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <RefreshCw size={18} className={styles.spinner} />
                {isRegister ? "Creando cuenta..." : "Ingresando..."}
              </>
            ) : isRegister ? (
              <>
                <UserPlus size={18} />
                Registrarme
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
          {isRegister ? "¿Ya tienes una cuenta?" : "¿Aún no tienes una cuenta?"}
          <button
            type="button"
            onClick={() => switchMode(isRegister ? "login" : "register")}
            className={styles.switchBtn}
          >
            {isRegister ? "Inicia sesión aquí" : "Regístrate aquí"}
          </button>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
