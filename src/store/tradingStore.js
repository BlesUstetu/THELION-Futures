import { create } from "zustand"

export const useTradingStore = create((set) => ({
  price: null,
  amount: 10,
  side: null,
  leverage: 10,

  setPrice: (price) => set({ price }),
  setAmount: (amount) => set({ amount }),
  setSide: (side) => set({ side }),
  setLeverage: (lvg) => set({ leverage: lvg }),

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

  updatePNL: (id, pnl) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, pnl } : o
      ),
    })),

  updateLiquidation: (id, liq) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, liquidation: liq } : o
      ),
    })),
}))
