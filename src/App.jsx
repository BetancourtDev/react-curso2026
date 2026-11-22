import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const CreateProductPage = lazy(() => import("./pages/CreateProductPage"));
const EditProductPage = lazy(() => import("./pages/EditProductPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

const App = () => {
  return (
    <Layout>
      <Suspense
        fallback={
          <p role="status" aria-live="polite" style={{ padding: "3rem 1rem", textAlign: "center" }}>
            Cargando...
          </p>
        }
      >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/crear"
          element={
            <ProtectedRoute requireAdmin>
              <CreateProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos/editar/:id"
          element={
            <ProtectedRoute requireAdmin>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage initialMode="login" />} />
        <Route path="/registro" element={<LoginPage initialMode="register" />} />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </Layout>
  );
};

export default App;