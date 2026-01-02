
'use client'
import React, { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined)
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  // Rehydrate cart from localStorage on mount
  React.useEffect(() => {
    // Clear old cart data that might have invalid product IDs
    const cartState = localStorage.getItem('cartState');
    if (cartState) {
      try {
        const parsed = JSON.parse(cartState);
        // Check if cart has any items
        if (parsed.cartItems && Object.keys(parsed.cartItems).length > 0) {
          console.log('Existing cart found. Clearing old cart data to prevent ID mismatch...');
          // Clear the cart to avoid old product.id vs new product._id mismatch
          localStorage.setItem('cartState', JSON.stringify({ total: 0, cartItems: {} }));
        }
      } catch (e) {
        console.error('Error parsing cart state:', e);
      }
    }
    
    storeRef.current.dispatch({ type: 'cart/rehydrateCart' });
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>
}
