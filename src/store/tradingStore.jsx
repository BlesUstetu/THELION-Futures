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
  // ORDER STATE
  // =========================
  orders: [],
  selectedOrderId: null,

  setSelectedOrder: (id) => set({ selectedOrderId: id }),

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

  setTP: (id, tp) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, tp } : o
      ),
    })),

  setSL: (id, sl) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, sl } : o
      ),
    })),
}))
