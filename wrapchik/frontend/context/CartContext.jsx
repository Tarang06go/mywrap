import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load stored cart from local storage on launch
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const loadCart = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('wrapchik_cart_items');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('[CartContext Error] Failed to load cached cart:', e);
    }
  };

  const saveCart = async (items) => {
    try {
      await AsyncStorage.setItem('wrapchik_cart_items', JSON.stringify(items));
    } catch (e) {
      console.error('[CartContext Error] Failed to cache cart:', e);
    }
  };

  // Add item to cart with customization matching
  const addToCart = (product, selectedCustomizations = [], quantity = 1) => {
    setCartItems((prevItems) => {
      // Calculate unit price with customizations
      const custPrice = selectedCustomizations.reduce((sum, c) => sum + c.price, 0);
      const unitPrice = product.price + custPrice;

      // Unique cart key based on product ID & customization signatures
      const custKey = selectedCustomizations
        .map((c) => c.name)
        .sort()
        .join('|');
      const itemKey = `${product._id}_${custKey}`;

      const existingIndex = prevItems.findIndex((item) => item.cartKey === itemKey);

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            cartKey: itemKey,
            productId: product._id,
            name: product.name,
            basePrice: product.price,
            unitPrice,
            quantity,
            imageUrl: product.imageUrl,
            isVeg: product.isVeg,
            customizations: selectedCustomizations,
          },
        ];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (cartKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartKey);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove single item from cart
  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
  };

  // Clear entire cart
  const clearCart = async () => {
    setCartItems([]);
    try {
      await AsyncStorage.removeItem('wrapchik_cart_items');
    } catch (e) {
      console.error('[CartContext Error] Failed to clear cached cart:', e);
    }
  };

  // Calculations
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxAndFees = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = subtotal + taxAndFees;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        taxAndFees,
        grandTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
