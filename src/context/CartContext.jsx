import { useState, useEffect } from "react";
import { CartContext } from "./CartContextDefinition";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("tienda_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("tienda_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Error guardando carrito en localStorage:", e);
    }
  }, [cart]);

  const addItem = (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => String(item.id) === String(product.id));

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const existing = updated[existingIndex];
        const maxStock = product.stock || 99;
        const newQty = Math.min(existing.quantity + qty, maxStock);
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      } else {
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

  const removeItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => String(item.id) !== String(id)));
  };

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

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (id) => {
    return cart.some((item) => String(item.id) === String(id));
  };

  const getItemQuantity = (id) => {
    const found = cart.find((item) => String(item.id) === String(id));
    return found ? found.quantity : 0;
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

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
