import { create } from "zustand"

export const useTradingStore = create((set) => ({
  // =========================
  // FORM
  // =========================
  price: null,
  amount: 10,
  side: null,

  setPrice: (price) => set({ price }),
  setAmount: (amount) => set({ amount }),
  setSide: (side) => set({ side }),

  // =========================
  // ORDERS
  // =========================
  orders: [],

  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),

  updateOrder: (id, data) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
    })),

  removeOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),
}))
