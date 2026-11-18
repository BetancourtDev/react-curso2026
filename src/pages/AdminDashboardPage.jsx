import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  Eye,
  Package,
  Layers,
  AlertTriangle,
  DollarSign,
  X,
  Save,
  Database,
} from "lucide-react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  validateProductData,
  seedProductsFromJson,
} from "../services/productService";
import { useCart } from "../context/useCart";
import ConfirmDeleteModal from "../components/products/ConfirmDeleteModal";
import Pagination from "../components/products/Pagination";
import styles from "./AdminDashboardPage.module.css";

const emptyForm = {
  title: "",
  price: "",
  description: "",
  category: "",
  image: "",
  stock: "",
};

const AdminDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Filtros y paginación de tabla
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Notificación global de éxito o error de poblado
  const [bannerMessage, setBannerMessage] = useState("");
  const [seeding, setSeeding] = useState(false);

  // Modal de formulario (Crear / Editar)
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [customCategoryMode, setCustomCategoryMode] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal de confirmación para eliminar
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const { removeItem, isInCart } = useCart();

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      try {
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error al cargar productos en el panel admin:", err);
        if (isMounted) {
          setError(
            err.message || "Error al conectar con Firestore para obtener el catálogo."
          );
          setLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    setReloadKey((prev) => prev + 1);
  };

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setError("");
    try {
      const { added, skipped } = await seedProductsFromJson();
      if (added > 0) {
        showTemporaryBanner(
          `¡Base de datos poblada! Se cargaron ${added} productos nuevos en Firestore${
            skipped > 0 ? ` (${skipped} ya existían)` : ""
          }.`
        );
        handleRefresh();
      } else {
        showTemporaryBanner(
          `Todos los productos del catálogo inicial (${skipped}) ya se encuentran en Firestore.`
        );
      }
    } catch (err) {
      console.error("Error al poblar la base de datos:", err);
      setError(
        err.message || "No se pudo poblar la base de datos en Firestore."
      );
    } finally {
      setSeeding(false);
    }
  };

  const showTemporaryBanner = (msg) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage("");
    }, 4000);
  };

  // Categorías únicas obtenidas directamente de los productos de la base de datos
  const dbCategories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];
  const categories = ["all", ...dbCategories];

  // Abrir modal para crear producto
  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      category: dbCategories[0] || "",
    });
    setCustomCategoryMode(dbCategories.length === 0);
    setFieldErrors({});
    setFormError("");
    setFormModalOpen(true);
  };

  // Abrir modal para editar producto existente
  const openEditModal = (product) => {
    setEditingId(product.id);
    setForm({
      title: product.title || "",
      price: String(product.price ?? ""),
      description: product.description || "",
      category: product.category || "",
      image: product.image || "",
      stock: String(product.stock ?? ""),
    });
    setCustomCategoryMode(false);
    setFieldErrors({});
    setFormError("");
    setFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    setFormModalOpen(false);
    setEditingId(null);
    setFieldErrors({});
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const validation = validateProductData(form);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormError("Revisa los campos marcados en rojo antes de guardar.");
      return;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      if (editingId) {
        await updateProduct(editingId, form);
        showTemporaryBanner(`Producto "${form.title.trim()}" actualizado correctamente.`);
      } else {
        await createProduct(form);
        showTemporaryBanner(`Producto "${form.title.trim()}" creado exitosamente.`);
      }
      setFormModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      handleRefresh();
    } catch (err) {
      console.error("Error al guardar producto en Firestore:", err);
      setFormError(
        err.message || "No se pudo guardar el producto en Firestore."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteProduct(productToDelete.id);
      if (isInCart(productToDelete.id)) {
        removeItem(productToDelete.id);
      }
      const deletedTitle = productToDelete.title;
      setProducts((prev) =>
        prev.filter((item) => String(item.id) !== String(productToDelete.id))
      );
      setProductToDelete(null);
      showTemporaryBanner(`Producto "${deletedTitle}" eliminado del catálogo.`);
    } catch (err) {
      console.error("Error al eliminar producto en Firestore:", err);
      setDeleteError(
        err.message || "No se pudo eliminar el producto. Intenta nuevamente."
      );
    } finally {
      setDeleting(false);
    }
  };

  // Métricas e indicadores del inventario
  const totalProducts = products.length;
  const totalStockUnits = products.reduce(
    (acc, item) => acc + (Number(item.stock) || 0),
    0
  );
  const lowStockCount = products.filter(
    (item) => Number(item.stock) <= 5
  ).length;
  const totalInventoryValue = products.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.stock) || 0),
    0
  );

  // Filtrado de productos para la tabla
  const filteredProducts = products.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      String(item.id).toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    const stockNum = Number(item.stock) || 0;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "available" && stockNum > 5) ||
      (stockFilter === "low" && stockNum > 0 && stockNum <= 5) ||
      (stockFilter === "out" && stockNum <= 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Paginación de la tabla de administración
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const getStockStatusClass = (stock) => {
    const qty = Number(stock) || 0;
    if (qty <= 0) return styles.stockOut;
    if (qty <= 5) return styles.stockLow;
    return styles.stockOk;
  };

  const getStockLabel = (stock) => {
    const qty = Number(stock) || 0;
    if (qty <= 0) return "Agotado (0)";
    if (qty <= 5) return `Stock bajo (${qty})`;
    return `${qty} u.`;
  };

  return (
    <section className={styles.dashboard}>
      {/* Encabezado principal del Panel */}
      <header className={styles.topHeader}>
        <div className={styles.titleBlock}>
          <span className={styles.headerBadge}>
            <LayoutDashboard size={24} />
          </span>
          <div>
            <p className={styles.eyebrow}>Gestión de tienda • Firestore CRUD</p>
            <h1 className={styles.pageTitle}>Panel de Administración</h1>
            <p className={styles.pageSubtitle}>
              Administra el inventario, precios, stock y publicaciones del catálogo en tiempo real.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleSeedDatabase}
            disabled={seeding || loading}
            className={styles.secondaryBtn}
            title="Cargar productos iniciales desde productos.json a Firestore"
          >
            {seeding ? (
              <>
                <RefreshCw size={17} className={styles.spinner} />
                <span>Poblando BD...</span>
              </>
            ) : (
              <>
                <Database size={17} />
                <span>Poblar BD</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || seeding}
            className={styles.secondaryBtn}
            title="Sincronizar con Firestore"
          >
            <RefreshCw size={17} className={loading ? styles.spinner : ""} />
            <span>Sincronizar</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className={styles.primaryBtn}
          >
            <Plus size={18} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </header>

      {/* Tarjetas de métricas (KPIs) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBlue}>
            <Package size={22} />
          </div>
          <div>
            <span className={styles.statLabel}>Total Productos</span>
            <strong className={styles.statValue}>{totalProducts}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconCyan}>
            <Layers size={22} />
          </div>
          <div>
            <span className={styles.statLabel}>Unidades en Stock</span>
            <strong className={styles.statValue}>
              {totalStockUnits.toLocaleString("es-AR")}
            </strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconAmber}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <span className={styles.statLabel}>Stock Bajo / Agotado</span>
            <strong className={styles.statValue}>{lowStockCount}</strong>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconGreen}>
            <DollarSign size={22} />
          </div>
          <div>
            <span className={styles.statLabel}>Valor de Inventario</span>
            <strong className={styles.statValue}>
              AR$ {totalInventoryValue.toLocaleString("es-AR")}
            </strong>
          </div>
        </div>
      </div>

      {/* Notificación de operación exitosa */}
      {bannerMessage && (
        <div className={styles.successBanner} role="status">
          <CheckCircle2 size={20} />
          <span>{bannerMessage}</span>
        </div>
      )}

      {/* Contenedor de la tabla y filtros */}
      <div className={styles.tableCard}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre, categoría o ID..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className={styles.clearBtn}
                aria-label="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className={styles.filtersGroup}>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.selectFilter}
              aria-label="Filtrar por categoría"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "Todas las categorías" : cat}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={styles.selectFilter}
              aria-label="Filtrar por estado de stock"
            >
              <option value="all">Todo el stock</option>
              <option value="available">En stock (&gt; 5)</option>
              <option value="low">Stock bajo (1 a 5)</option>
              <option value="out">Agotados (0)</option>
            </select>
          </div>
        </div>

        {/* Botones de categorías traídas desde la base de datos */}
        {dbCategories.length > 0 && (
          <div className={styles.categoryChipsBar}>
            <span className={styles.chipsLabel}>Categorías en BD:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategoryFilter(cat);
                  setCurrentPage(1);
                }}
                className={`${styles.categoryChip} ${
                  categoryFilter === cat ? styles.categoryChipActive : ""
                }`}
              >
                {cat === "all" ? "Todas" : cat}
              </button>
            ))}
          </div>
        )}

        {/* Estados de carga, error o tabla de datos */}
        {loading ? (
          <div className={styles.stateContainer} role="status">
            <RefreshCw size={34} className={styles.spinner} />
            <p>Obteniendo catálogo desde Firestore...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer} role="alert">
            <AlertCircle size={34} className={styles.errorIcon} />
            <h3>No se pudo cargar el inventario</h3>
            <p>{error}</p>
            <button
              type="button"
              onClick={handleRefresh}
              className={styles.primaryBtn}
            >
              <RefreshCw size={16} /> Reintentar conexión
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.stateContainer}>
            <Package size={40} className={styles.emptyIcon} />
            <h3>No se encontraron productos</h3>
            <p>
              No hay resultados para los filtros aplicados o el catálogo está vacío.
            </p>
            <div className={styles.headerActions}>
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className={styles.secondaryBtn}
              >
                <Database size={17} /> Poblar desde productos.json
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className={styles.primaryBtn}
              >
                <Plus size={17} /> Agregar primer producto
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio unitario</th>
                  <th>Estado de Stock</th>
                  <th className={styles.actionsHeader}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className={styles.productThumb}
                          loading="lazy"
                        />
                        <div className={styles.productMeta}>
                          <Link
                            to={`/producto/${item.id}`}
                            className={styles.productName}
                          >
                            {item.title}
                          </Link>
                          <span className={styles.productId}>ID: #{item.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={styles.categoryPill}>{item.category}</span>
                    </td>
                    <td>
                      <strong className={styles.priceCell}>
                        AR$ {Number(item.price).toLocaleString("es-AR")}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.stockPill} ${getStockStatusClass(
                          item.stock
                        )}`}
                      >
                        {getStockLabel(item.stock)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Link
                          to={`/producto/${item.id}`}
                          className={styles.iconActionView}
                          title="Ver en la tienda"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className={styles.actionEditBtn}
                          title="Editar en el panel"
                        >
                          <Pencil size={15} />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError("");
                            setProductToDelete(item);
                          }}
                          className={styles.actionDeleteBtn}
                          title="Eliminar producto"
                        >
                          <Trash2 size={15} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <footer className={styles.tableFooter}>
            <div className={styles.paginationBox}>
              <Pagination
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onItemsPerPageChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Link to="/productos/crear" className={styles.standaloneFormLink}>
              Abrir vista de formulario completo →
            </Link>
          </footer>
        )}
      </div>

      {/* Modal de Formulario para Crear o Editar Producto */}
      {formModalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
          onClick={closeFormModal}
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={styles.headerBadge}>
                  {editingId ? <Pencil size={20} /> : <Plus size={20} />}
                </span>
                <div>
                  <h2 id="admin-modal-title" className={styles.modalTitle}>
                    {editingId ? "Editar producto" : "Nuevo producto"}
                  </h2>
                  <p className={styles.modalSubtitle}>
                    {editingId
                      ? `Modificando documento #${editingId} en Firestore`
                      : "Completa los campos obligatorios (*) para publicar en el catálogo"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className={styles.closeModalBtn}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </header>

            {formError && (
              <div className={styles.modalError} role="alert">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form
              className={styles.modalForm}
              onSubmit={handleFormSubmit}
              noValidate
            >
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Nombre del producto *</span>
                  <input
                    name="title"
                    type="text"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="Ej. Monitor Gamer Curvo 27”"
                    maxLength={100}
                    className={fieldErrors.title ? styles.inputError : ""}
                    required
                  />
                  {fieldErrors.title && (
                    <small className={styles.fieldError}>
                      {fieldErrors.title}
                    </small>
                  )}
                </label>

                <label className={styles.field}>
                  <span>Categoría (desde base de datos) *</span>
                  {!customCategoryMode && dbCategories.length > 0 ? (
                    <select
                      name="category"
                      value={form.category}
                      onChange={(e) => {
                        if (e.target.value === "__nueva__") {
                          setCustomCategoryMode(true);
                          setForm((prev) => ({ ...prev, category: "" }));
                        } else {
                          handleFormChange(e);
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
                      <option value="__nueva__">
                        + Agregar nueva categoría...
                      </option>
                    </select>
                  ) : (
                    <div className={styles.customCategoryBox}>
                      <input
                        name="category"
                        type="text"
                        value={form.category}
                        onChange={handleFormChange}
                        placeholder="Escribe la nueva categoría..."
                        maxLength={60}
                        className={
                          fieldErrors.category ? styles.inputError : ""
                        }
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
                    onChange={handleFormChange}
                    placeholder="Ej. 320000"
                    min="0.01"
                    step="0.01"
                    className={fieldErrors.price ? styles.inputError : ""}
                    required
                  />
                  {fieldErrors.price && (
                    <small className={styles.fieldError}>
                      {fieldErrors.price}
                    </small>
                  )}
                </label>

                <label className={styles.field}>
                  <span>Stock disponible *</span>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleFormChange}
                    placeholder="Ej. 12"
                    min="0"
                    step="1"
                    className={fieldErrors.stock ? styles.inputError : ""}
                    required
                  />
                  {fieldErrors.stock && (
                    <small className={styles.fieldError}>
                      {fieldErrors.stock}
                    </small>
                  )}
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>URL de la imagen *</span>
                  <input
                    name="image"
                    type="url"
                    value={form.image}
                    onChange={handleFormChange}
                    placeholder="https://images.unsplash.com/..."
                    className={fieldErrors.image ? styles.inputError : ""}
                    required
                  />
                  {fieldErrors.image && (
                    <small className={styles.fieldError}>
                      {fieldErrors.image}
                    </small>
                  )}
                </label>

                <label className={`${styles.field} ${styles.fullWidth}`}>
                  <span>Descripción *</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe las especificaciones y características del producto (mínimo 10 caracteres)..."
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

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className={styles.secondaryBtn}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles.primaryBtn}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={17} className={styles.spinner} />
                      Guardando...
                    </>
                  ) : editingId ? (
                    <>
                      <Save size={17} />
                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Crear producto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación antes de eliminar */}
      <ConfirmDeleteModal
        isOpen={Boolean(productToDelete)}
        productTitle={productToDelete?.title}
        isDeleting={deleting}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) {
            setProductToDelete(null);
            setDeleteError("");
          }
        }}
      />
    </section>
  );
};

export default AdminDashboardPage;

