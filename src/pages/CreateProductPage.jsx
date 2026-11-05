import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  createProduct,
  fetchCategories,
  validateProductData,
} from "../services/productService";
import styles from "./CreateProductPage.module.css";

const initialForm = {
  title: "",
  price: "",
  description: "",
  category: "",
  image: "",
  stock: "",
};

const CreateProductPage = () => {
  const [form, setForm] = useState(initialForm);
  const [dbCategories, setDbCategories] = useState([]);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    fetchCategories()
      .then((cats) => {
        if (isMounted) {
          setDbCategories(cats);
          if (cats.length > 0) {
            setForm((prev) => ({
              ...prev,
              category: prev.category || cats[0],
            }));
          } else {
            setCustomCategoryMode(true);
          }
        }
      })
      .catch((err) => {
        console.error("Error al cargar categorías desde Firestore:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
    setCreated(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setCreated(false);

    const validation = validateProductData(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setError("Por favor, corrige los campos marcados antes de continuar.");
      return;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      await createProduct(form);
      setForm(initialForm);
      setCreated(true);
    } catch (err) {
      console.error("Error al crear el producto en Firestore:", err);
      setError(
        err.message || "No se pudo guardar el producto. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.page}>
      <Link to="/admin" className={styles.backLink}>
        <ArrowLeft size={18} />
        Volver al Panel de Administración
      </Link>

      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.iconBadge}>
            <Plus size={22} />
          </span>
          <div>
            <p className={styles.eyebrow}>Administración del catálogo</p>
            <h1 className={styles.title}>Crear producto</h1>
            <p className={styles.subtitle}>
              Completa los datos para agregar un producto nuevo a la tienda.
            </p>
          </div>
        </header>

        {created && (
          <div className={styles.successMessage} role="status">
            <CheckCircle2 size={20} />
            El producto se creó correctamente en Firestore.
          </div>
        )}

        {error && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldsGrid}>
            <label className={styles.field}>
              <span>Nombre del producto *</span>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Ej. Auriculares inalámbricos"
                maxLength={100}
                className={fieldErrors.title ? styles.inputError : ""}
                required
              />
              {fieldErrors.title && (
                <small className={styles.fieldError}>{fieldErrors.title}</small>
              )}
            </label>

            <label className={styles.field}>
              <span>Categoría *</span>
              {!customCategoryMode && dbCategories.length > 0 ? (
                <select
                  name="category"
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === "__nueva__") {
                      setCustomCategoryMode(true);
                      setForm((prev) => ({ ...prev, category: "" }));
                    } else {
                      handleChange(e);
                    }
                  }}
                  className={fieldErrors.category ? styles.inputError : ""}
                  required
                >
                  <option value="" disabled>
                    Selecciona una categoría...
                  </option>
                  {dbCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__nueva__">+ Agregar nueva categoría...</option>
                </select>
              ) : (
                <div className={styles.customCategoryRow}>
                  <input
                    name="category"
                    type="text"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="Ej. Audio"
                    maxLength={60}
                    className={fieldErrors.category ? styles.inputError : ""}
                    required
                  />
                  {dbCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomCategoryMode(false);
                        setForm((prev) => ({
                          ...prev,
                          category: dbCategories[0] || "",
                        }));
                      }}
                      className={styles.backToSelectBtn}
                    >
                      Usar existentes
                    </button>
                  )}
                </div>
              )}
              {fieldErrors.category && (
                <small className={styles.fieldError}>
                  {fieldErrors.category}
                </small>
              )}
            </label>

            <label className={styles.field}>
              <span>Precio (AR$) *</span>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="Ej. 25000"
                min="0.01"
                step="0.01"
                className={fieldErrors.price ? styles.inputError : ""}
                required
              />
              {fieldErrors.price && (
                <small className={styles.fieldError}>{fieldErrors.price}</small>
              )}
            </label>

            <label className={styles.field}>
              <span>Stock disponible *</span>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="Ej. 15"
                min="0"
                step="1"
                className={fieldErrors.stock ? styles.inputError : ""}
                required
              />
              {fieldErrors.stock && (
                <small className={styles.fieldError}>{fieldErrors.stock}</small>
              )}
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>URL de la imagen *</span>
              <input
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className={fieldErrors.image ? styles.inputError : ""}
                required
              />
              {fieldErrors.image && (
                <small className={styles.fieldError}>{fieldErrors.image}</small>
              )}
            </label>

            <label className={`${styles.field} ${styles.fullWidth}`}>
              <span>Descripción *</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe las características principales del producto (mínimo 10 caracteres)..."
                rows="4"
                maxLength={1000}
                className={fieldErrors.description ? styles.inputError : ""}
                required
              />
              {fieldErrors.description && (
                <small className={styles.fieldError}>
                  {fieldErrors.description}
                </small>
              )}
            </label>
          </div>

          <div className={styles.formActions}>
            <Link to="/admin" className={styles.cancelLinkBtn}>
              Ir al Panel Admin
            </Link>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw size={18} className={styles.spinner} />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Crear producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateProductPage;
