import { create } from "zustand"
import { persist } from "zustand/middleware"

const generateId = () => Date.now()

export const useTradingStore = create(
  persist(
    (set, get) => ({
      pair: "BTCUSDT",
      balance: 1000,
      leverage: 10,

      orders: [],
      positions: [],

      // ===============================
      // ORDER
      // ===============================
      addOrder: (order) =>
        set((state) => ({
          orders: [
            ...state.orders,
            {
              id: generateId(),
              type: order.type,
              price: order.price,
              tp: order.tp,
              sl: order.sl,
              amount: order.amount,
            },
          ],
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

      // ===============================
      // EXECUTE → POSITION
      // ===============================
      executeOrder: (id) =>
        set((state) => {
          const o = state.orders.find((x) => x.id === id)
          if (!o) return {}

          return {
            orders: state.orders.filter((x) => x.id !== id),
            positions: [
              ...state.positions,
              {
                ...o,
                entry: o.price,
                leverage: state.leverage,
                margin: (o.price * o.amount) / state.leverage,
                liquidation:
                  o.type === "buy"
                    ? o.price * (1 - 1 / state.leverage)
                    : o.price * (1 + 1 / state.leverage),
              },
            ],
          }
        }),

      // ===============================
      // CLOSE POSITION
      // ===============================
      closePosition: (id, price) =>
        set((state) => {
          const pos = state.positions.find((p) => p.id === id)
          if (!pos) return {}

          const pnl =
            pos.type === "buy"
              ? (price - pos.entry) * pos.amount * pos.leverage
              : (pos.entry - price) * pos.amount * pos.leverage

          return {
            positions: state.positions.filter((p) => p.id !== id),
            balance: state.balance + pnl,
          }
        }),

      // ===============================
      // ENGINE
      // ===============================
      calculatePNL: (pos, price) => {
        return pos.type === "buy"
          ? (price - pos.entry) * pos.amount * pos.leverage
          : (pos.entry - price) * pos.amount * pos.leverage
      },

      checkTPSL: (price) => {
        const { positions, closePosition } = get()

        positions.forEach((p) => {
          if (p.type === "buy") {
            if (price >= p.tp) closePosition(p.id, p.tp)
            if (price <= p.sl) closePosition(p.id, p.sl)
          } else {
            if (price <= p.tp) closePosition(p.id, p.tp)
            if (price >= p.sl) closePosition(p.id, p.sl)
          }
        })
      },

      checkLiquidation: (price) => {
        const { positions, closePosition } = get()

        positions.forEach((p) => {
          if (p.type === "buy" && price <= p.liquidation) {
            closePosition(p.id, p.liquidation)
          }
          if (p.type === "sell" && price >= p.liquidation) {
            closePosition(p.id, p.liquidation)
          }
        })
      },
    }),
    { name: "thelion-store" }
  )
)
