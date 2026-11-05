import { useState, useEffect } from "react";
import { CartContext } from "./CartContextDefinition";

/**
 * CartProvider: Componente proveedor del contexto del carrito de compras.
 * Administra el estado global del carrito, la persistencia en localStorage
 * y proporciona funciones para manipular los productos seleccionados.
 */
export const CartProvider = ({ children }) => {
  // Estado del carrito: Se inicializa recuperando los datos guardados en localStorage
  // Si no existen datos previos o falla el parseo, se inicia como un arreglo vacío []
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("tienda_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // Efecto secundario: Cada vez que el carrito ('cart') cambia,
  // se sincroniza y almacena automáticamente en localStorage en formato JSON
  useEffect(() => {
    try {
      localStorage.setItem("tienda_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error guardando carrito en localStorage:", e);
    }
  }, [cart]);

  /**
   * addItem: Agrega un producto al carrito o incrementa su cantidad si ya existe.
   * @param {Object} product - Objeto con los datos del producto
   * @param {number} quantity - Cantidad a agregar (por defecto 1)
   */
  const addItem = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setCart((prevCart) => {
      // Verifica si el producto ya está en el carrito comparando sus IDs
      const existingIndex = prevCart.findIndex((item) => String(item.id) === String(product.id));

      if (existingIndex > -1) {
        // Si el producto ya existe, actualiza la cantidad sin sobrepasar el stock máximo
        const updated = [...prevCart];
        const existing = updated[existingIndex];
        const maxStock = product.stock || 99;
        const newQty = Math.min(existing.quantity + qty, maxStock);
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      } else {
        // Si es un producto nuevo, lo agrega a la lista con sus propiedades normalizadas
        return [
          ...prevCart,
          {
            id: String(product.id),
            title: product.title,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            stock: product.stock || 99,
            quantity: qty,
          },
        ];
      }
    });
  };

  /**
   * removeItem: Elimina un producto del carrito según su ID.
   * @param {string|number} id - Identificador del producto a remover
   */
  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => String(item.id) !== String(id)));
  };

  /**
   * updateQuantity: Modifica la cantidad exacta de un producto en el carrito.
   * Si la cantidad ingresada es 0 o menor, remueve el ítem.
   * Si supera el stock disponible, se limita al stock máximo.
   * @param {string|number} id - ID del producto
   * @param {number} quantity - Nueva cantidad deseada
   */
  const updateQuantity = (id, quantity) => {
    const qty = Number(quantity);
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (String(item.id) === String(id)) {
          const maxStock = item.stock || 99;
          return { ...item, quantity: Math.min(qty, maxStock) };
        }
        return item;
      })
    );
  };

  /**
   * clearCart: Vacía completamente el carrito de compras.
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * isInCart: Comprueba si un producto ya se encuentra en el carrito.
   * @param {string|number} id - ID del producto
   * @returns {boolean} true si existe, false en caso contrario
   */
  const isInCart = (id) => {
    return cart.some((item) => String(item.id) === String(id));
  };

  /**
   * getItemQuantity: Retorna cuántas unidades de un producto específico hay en el carrito.
   * @param {string|number} id - ID del producto
   * @returns {number} Cantidad de unidades (0 si no está en el carrito)
   */
  const getItemQuantity = (id) => {
    const found = cart.find((item) => String(item.id) === String(id));
    return found ? found.quantity : 0;
  };

  // Cantidad total de productos/unidades sumando las cantidades de cada ítem
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Precio total acumulado multiplicando el precio de cada ítem por su cantidad
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
        getItemQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

