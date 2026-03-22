import { create } from "zustand"
import { persist } from "zustand/middleware"

// helper
const generateId = () => Date.now()

export const useTradingStore = create(
  persist(
    (set, get) => ({
      // ===============================
      // GLOBAL STATE
      // ===============================
      pair: "BTCUSDT",
      balance: 1000,
      leverage: 10,

      // ===============================
      // DATA
      // ===============================
      orders: [],
      positions: [],
      tradeHistory: [],

      // ===============================
      // PAIR CONTROL
      // ===============================
      setPair: (pair) => set({ pair }),

      // ===============================
      // CREATE ORDER
      // ===============================
      addOrder: (order) =>
        set((state) => ({
          orders: [
            ...state.orders,
            {
              id: generateId(),
              type: order.type || "buy", // buy / sell
              price: order.price,
              tp: order.tp || order.price * 1.02,
              sl: order.sl || order.price * 0.98,
              amount: order.amount || 1,
              status: "open",
              createdAt: Date.now(),
            },
          ],
        })),

      // ===============================
      // UPDATE ORDER (DRAG ENGINE)
      // ===============================
      updateOrder: (id, newData) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...newData } : o
          ),
        })),

      // ===============================
      // DELETE ORDER
      // ===============================
      removeOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        })),

      // ===============================
      // EXECUTE ORDER → POSITION
      // ===============================
      executeOrder: (id) =>
        set((state) => {
          const order = state.orders.find((o) => o.id === id)
          if (!order) return {}

          return {
            orders: state.orders.filter((o) => o.id !== id),
            positions: [
              ...state.positions,
              {
                id: generateId(),
                type: order.type,
                entry: order.price,
                tp: order.tp,
                sl: order.sl,
                amount: order.amount,
                leverage: state.leverage,
                openedAt: Date.now(),
              },
            ],
          }
        }),

      // ===============================
      // CLOSE POSITION
      // ===============================
      closePosition: (id, exitPrice) =>
        set((state) => {
          const pos = state.positions.find((p) => p.id === id)
          if (!pos) return {}

          const pnl =
            pos.type === "buy"
              ? (exitPrice - pos.entry) * pos.amount * pos.leverage
              : (pos.entry - exitPrice) * pos.amount * pos.leverage

          return {
            positions: state.positions.filter((p) => p.id !== id),
            balance: state.balance + pnl,
            tradeHistory: [
              ...state.tradeHistory,
              {
                ...pos,
                exitPrice,
                pnl,
                closedAt: Date.now(),
              },
            ],
          }
        }),

      // ===============================
      // AUTO TP / SL CHECK
      // ===============================
      checkTPSL: (price) => {
        const { positions, closePosition } = get()

        positions.forEach((pos) => {
          if (pos.type === "buy") {
            if (price >= pos.tp) closePosition(pos.id, pos.tp)
            if (price <= pos.sl) closePosition(pos.id, pos.sl)
          } else {
            if (price <= pos.tp) closePosition(pos.id, pos.tp)
            if (price >= pos.sl) closePosition(pos.id, pos.sl)
          }
        })
      },

      // ===============================
      // CLEAR ALL
      // ===============================
      resetAll: () =>
        set({
          orders: [],
          positions: [],
          tradeHistory: [],
        }),
    }),
    {
      name: "thelion-trading-store", // localStorage key
    }
  )
)
