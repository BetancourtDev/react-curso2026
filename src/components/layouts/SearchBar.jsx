import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import styles from "./SearchBar.module.css";

// Buscador principal del header: filtra el catálogo en tiempo real vía ?buscar=.
const SearchBar = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const isCatalog = location.pathname === "/productos";
  const searchQuery = isCatalog ? searchParams.get("buscar") || "" : "";

  const handleChange = (event) => {
    const value = event.target.value;

    // Fuera del catálogo, empezar a escribir lleva al listado con la búsqueda.
    if (!isCatalog) {
      if (value.trim()) {
        navigate(`/productos?buscar=${encodeURIComponent(value)}`);
      }
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set("buscar", value);
    } else {
      nextParams.delete("buscar");
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleClear = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("buscar");
    setSearchParams(nextParams, { replace: true });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isCatalog) {
      navigate(
        searchQuery.trim()
          ? `/productos?buscar=${encodeURIComponent(searchQuery)}`
          : "/productos"
      );
    }
    onSearch?.();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <input
        type="search"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Buscá productos, marcas y más…"
        className={styles.input}
        aria-label="Buscar productos"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={handleClear}
          className={styles.clearBtn}
          aria-label="Limpiar búsqueda"
        >
          <X size={16} />
        </button>
      )}
      <button type="submit" className={styles.submitBtn} aria-label="Buscar">
        <Search size={18} />
      </button>
    </form>
  );
};

export default SearchBar;
