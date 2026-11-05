import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { AuthContext } from "./AuthContextDefinition";

/**
 * AuthProvider: Componente proveedor del contexto de autenticación.
 * Escucha los cambios de sesión en Firebase Authentication y expone
 * funciones para iniciar sesión, registrarse y cerrar sesión.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * login: Inicia sesión con correo electrónico y contraseña en Firebase Auth.
   */
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return credential.user;
  };

  /**
   * register: Registra un nuevo usuario en Firebase Auth y opcionalmente configura su nombre visible.
   */
  const register = async (email, password, displayName = "") => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && displayName.trim()) {
      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });
      setUser({ ...credential.user, displayName: displayName.trim() });
    }
    return credential.user;
  };

  /**
   * logout: Cierra la sesión activa del usuario.
   */
  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

