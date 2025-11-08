import type { Product } from "@shared/schema";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_STORAGE_KEY = "smarthome_cart";

export function getCart(): CartItem[] {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addToCart(product: Product, quantity: number = 1): void {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => item.product.id === product.id);
  
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  
  saveCart(cart);
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function removeFromCart(productId: string): void {
  const cart = getCart();
  const filtered = cart.filter((item) => item.product.id !== productId);
  saveCart(filtered);
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function updateCartQuantity(productId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const cart = getCart();
  const item = cart.find((item) => item.product.id === productId);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
    window.dispatchEvent(new CustomEvent("cart-updated"));
  }
}

export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => {
    return sum + parseFloat(item.product.price) * item.quantity;
  }, 0);
}

export function getCartItemCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
