import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  RefreshCw,
  AlertCircle,
  Save,
} from "lucide-react";
import {
  fetchProductById,
  fetchCategories,
  updateProduct,
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

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [dbCategories, setDbCategories] = useState([]);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProductData = async () => {
      try {
        const [product, cats] = await Promise.all([
          fetchProductById(id),
          fetchCategories(),
        ]);
        if (isMounted) {
          const mergedCats = product.category
            ? [...new Set([product.category, ...cats])]
            : cats;
          setDbCategories(mergedCats);
          setForm({
            title: product.title || "",
            price: String(product.price ?? ""),
            description: product.description || "",
            category: product.category || "",
            image: product.image || "",
            stock: String(product.stock ?? ""),
          });
          setLoadError("");
          setLoadingProduct(false);
        }
      } catch (err) {
        console.error("Error al cargar el producto desde Firestore:", err);
        if (isMounted) {
          setLoadError(
            err.message || "No se pudo obtener la información del producto."
          );
          setLoadingProduct(false);
        }
      }
    };

    loadProductData();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  const handleRetryLoad = () => {
    setLoadingProduct(true);
    setLoadError("");
    setReloadKey((prev) => prev + 1);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setSaveError("");
    setUpdated(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveError("");
    setUpdated(false);

    const validation = validateProductData(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setSaveError("Por favor, corrige los campos marcados antes de guardar.");
      return;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      await updateProduct(id, form);
      setUpdated(true);
      setTimeout(() => {
        navigate(`/producto/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Error al actualizar el producto en Firestore:", err);
      setSaveError(
        err.message || "No se pudieron guardar los cambios. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loadingProduct) {
    return (
      <section className={styles.page}>
        <div className={styles.card}>
          <div className={styles.stateBox}>
            <RefreshCw size={32} className={styles.spinner} />
            <p>Cargando datos del producto desde Firestore...</p>
          </div>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className={styles.page}>
        <Link to="/productos" className={styles.backLink}>
          <ArrowLeft size={18} />
          Volver al catálogo
        </Link>

        <div className={styles.card}>
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={20} />
            <span>{loadError}</span>
            <button
              type="button"
              onClick={handleRetryLoad}
              className={styles.retryInlineBtn}
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <Link to={`/producto/${id}`} className={styles.backLink}>
        <ArrowLeft size={18} />
        Volver al detalle del producto
      </Link>

      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.iconBadge}>
            <Pencil size={22} />
          </span>
          <div>
            <p className={styles.eyebrow}>Administración del catálogo</p>
            <h1 className={styles.title}>Editar producto</h1>
            <p className={styles.subtitle}>
              Modifica los datos del producto (ID: #{id}) y guarda los cambios en
              Firestore.
            </p>
          </div>
        </header>

        {updated && (
          <div className={styles.successMessage} role="status">
            <CheckCircle2 size={20} />
            ¡El producto se actualizó correctamente! Redirigiendo...
          </div>
        )}

        {saveError && (
          <div className={styles.errorMessage} role="alert">
            <AlertCircle size={20} />
            <span>{saveError}</span>
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
                placeholder="Describe las características principales del producto..."
                rows="5"
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
            <Link to={`/producto/${id}`} className={styles.cancelLinkBtn}>
              Cancelar
            </Link>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw size={18} className={styles.spinner} />
                  Guardando cambios...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Guardar cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditProductPage;
