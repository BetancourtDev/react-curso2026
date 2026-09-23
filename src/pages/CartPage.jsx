import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../context/useCart";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const { cart, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  const shippingCost = totalPrice > 50000 || totalPrice === 0 ? 0 : 4500;
  const finalTotal = totalPrice + shippingCost;

  const handleCheckout = () => {
    const generatedId = "ORD-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    setOrderId(generatedId);
    setCheckoutDone(true);
    clearCart();
  };

  if (checkoutDone) {
    return (
      <div className={styles.successCard}>
        <CheckCircle2 size={56} className={styles.successIcon} />
        <h2 className={styles.successTitle}>¡Compra Confirmada con Éxito!</h2>
        <p className={styles.successSubtitle}>
          Gracias por confiar en <strong>La Frutería del Abuelo</strong>. Tu orden ha sido procesada correctamente.
        </p>
        <div className={styles.orderBadge}>
          <span>Código de seguimiento:</span>
          <strong>{orderId}</strong>
        </div>
        <p className={styles.emailNotice}>
          Te hemos enviado los comprobantes y el detalle de despacho a tu correo registrado.
        </p>
        <div className={styles.successActions}>
          <Link to="/productos" onClick={() => setCheckoutDone(false)} className={styles.continueBtn}>
            Volver a la Tienda <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.emptyCard}>
        <ShoppingBag size={64} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>Tu carrito está vacío</h2>
        <p className={styles.emptyText}>
          Aún no has agregado ningún producto a tu bolsa de compras.
        </p>
        <Link to="/productos" className={styles.exploreBtn}>
          <ArrowLeft size={18} /> Explorar Catálogo de Productos
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Carrito de Compras</h1>
          <p className={styles.subheading}>
            Revisa tus artículos seleccionados ({totalItems} productos) antes de proceder al pago.
          </p>
        </div>
        <button type="button" onClick={clearCart} className={styles.clearBtn} title="Vaciar todo el carrito">
          <Trash2 size={16} /> Vaciar Carrito
        </button>
      </div>

      <div className={styles.contentLayout}>
        {/* Lista de Productos */}
        <div className={styles.itemsList}>
          {cart.map((item) => {
            const subtotal = item.price * item.quantity;
            return (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image} alt={item.title} className={styles.itemImage} />

                <div className={styles.itemInfo}>
                  <Link to={`/producto/${item.id}`} className={styles.itemTitle}>
                    {item.title}
                  </Link>
                  <span className={styles.itemCategory}>{item.category}</span>
                  <div className={styles.unitPrice}>
                    AR$ {item.price.toLocaleString("es-AR")} c/u
                  </div>
                </div>

                <div className={styles.itemControls}>
                  <div className={styles.quantityBox}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className={styles.qtyBtn}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className={styles.qtyNumber}>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className={styles.qtyBtn}
                      disabled={item.quantity >= (item.stock || 99)}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.itemSubtotal}>
                    <span className={styles.subtotalLabel}>Subtotal:</span>
                    <strong>AR$ {subtotal.toLocaleString("es-AR")}</strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className={styles.deleteBtn}
                    title="Eliminar producto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}

          <div className={styles.backToShopRow}>
            <Link to="/productos" className={styles.continueShoppingLink}>
              <ArrowLeft size={16} /> Continuar agregando productos
            </Link>
          </div>
        </div>

        {/* Resumen del Pedido */}
        <div className={styles.summarySidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Resumen de la Orden</h3>

            <div className={styles.summaryRow}>
              <span>Subtotal ({totalItems} productos):</span>
              <strong>AR$ {totalPrice.toLocaleString("es-AR")}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Envío nacional:</span>
              <span>
                {shippingCost === 0 ? (
                  <span className={styles.freeShippingTag}>¡GRATIS!</span>
                ) : (
                  `AR$ ${shippingCost.toLocaleString("es-AR")}`
                )}
              </span>
            </div>

            {totalPrice < 50000 && (
              <div className={styles.shippingTip}>
                <Truck size={14} /> ¡Agrega AR$ {(50000 - totalPrice).toLocaleString("es-AR")} más para envío GRATIS!
              </div>
            )}

            <div className={styles.divider}></div>

            <div className={styles.totalRow}>
              <span>Total a Pagar:</span>
              <span className={styles.totalAmount}>
                AR$ {finalTotal.toLocaleString("es-AR")}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCheckout}
              className={styles.checkoutBtn}
            >
              Confirmar y Pagar <ArrowRight size={18} />
            </button>

            <div className={styles.trustFooter}>
              <ShieldCheck size={16} className={styles.shieldIcon} />
              <span>Transacción cifrada con protocolo SSL seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
