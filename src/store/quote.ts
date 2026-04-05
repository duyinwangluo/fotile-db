import { defineStore } from 'pinia';
import type { Quote, QuoteItem, Product } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const useQuoteStore = defineStore('quote', {
  state: () => ({
    quote: {
      id: uuidv4(),
      name: '报价单',
      items: [] as QuoteItem[],
      totalPrice: 0,
      createdAt: new Date()
    } as Quote
  }),

  getters: {
    totalItems: (state) => state.quote.items.length,
    totalPrice: (state) => state.quote.totalPrice
  },

  actions: {
    addProduct(product: Product) {
      const existingItem = this.quote.items.find(item => item.productId === product.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.quote.items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1
        });
      }
      
      this.calculateTotal();
    },

    removeProduct(productId: string) {
      this.quote.items = this.quote.items.filter(item => item.productId !== productId);
      this.calculateTotal();
    },

    updateQuantity(productId: string, quantity: number) {
      if (quantity < 1) return;
      
      const item = this.quote.items.find(item => item.productId === productId);
      if (item) {
        item.quantity = quantity;
        this.calculateTotal();
      }
    },

    clearQuote() {
      this.quote = {
        id: uuidv4(),
        name: '报价单',
        items: [],
        totalPrice: 0,
        createdAt: new Date()
      };
    },

    calculateTotal() {
      this.quote.totalPrice = this.quote.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },

    saveQuote() {
      localStorage.setItem('quote', JSON.stringify({
        ...this.quote,
        createdAt: this.quote.createdAt.toISOString()
      }));
    },

    loadQuote() {
      const savedQuote = localStorage.getItem('quote');
      if (savedQuote) {
        const parsedQuote = JSON.parse(savedQuote);
        this.quote = {
          ...parsedQuote,
          createdAt: new Date(parsedQuote.createdAt)
        };
      }
    }
  }
});