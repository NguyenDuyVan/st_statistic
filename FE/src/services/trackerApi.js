import { io } from "socket.io-client";
import axios from "axios";
import { authStore } from "./auth.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3001";

class TrackerApi {
  constructor() {
    /** @type {import('socket.io-client').Socket | null} */
    this._socket = null;
    this._tradeHandlers = [];
    this._signalHandlers = [];
  }

  // ─── Socket.io ────────────────────────────────────────────────────────────

  connect() {
    if (this._socket?.connected) return;

    this._socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      auth: { token: authStore.token ?? "" },
    });

    this._socket.on("connect", () =>
      console.log("[Tracker] Socket connected:", this._socket.id),
    );
    this._socket.on("disconnect", (reason) =>
      console.warn("[Tracker] Socket disconnected:", reason),
    );

    this._socket.on("new-trade", ({ symbol, trade }) => {
      this._tradeHandlers.forEach((h) => h(symbol, trade));
    });

    this._socket.on("signal", ({ symbol, signal }) => {
      this._signalHandlers.forEach((h) => h(symbol, signal));
    });
  }

  disconnect() {
    this._socket?.disconnect();
    this._socket = null;
  }

  get isConnected() {
    return this._socket?.connected ?? false;
  }

  /** Register a trade listener. Returns an unsubscribe function. */
  onTrade(handler) {
    this._tradeHandlers.push(handler);
    return () => {
      this._tradeHandlers = this._tradeHandlers.filter((h) => h !== handler);
    };
  }

  /** Register a signal listener. Returns an unsubscribe function. */
  onSignal(handler) {
    this._signalHandlers.push(handler);
    return () => {
      this._signalHandlers = this._signalHandlers.filter((h) => h !== handler);
    };
  }

  // ─── REST ─────────────────────────────────────────────────────────────────

  async startTracking(symbols) {
    const { data } = await axios.post(`${BACKEND_URL}/api/tracker/start`, {
      symbols,
    });
    return data;
  }

  async stopTracking() {
    const { data } = await axios.post(`${BACKEND_URL}/api/tracker/stop`);
    return data;
  }

  async getStatus() {
    const { data } = await axios.get(`${BACKEND_URL}/api/tracker/status`);
    return data;
  }

  async getTrades(symbol) {
    const { data } = await axios.get(
      `${BACKEND_URL}/api/tracker/trades/${symbol}`,
    );
    return data;
  }

  async getSignals(symbol) {
    const { data } = await axios.get(
      `${BACKEND_URL}/api/tracker/signals/${symbol}`,
    );
    return data;
  }

  async getSummary(symbol) {
    const { data } = await axios.get(
      `${BACKEND_URL}/api/tracker/summary/${symbol}`,
    );
    return data;
  }

  async exportData() {
    const { data } = await axios.post(`${BACKEND_URL}/api/tracker/export`);
    return data;
  }
}

export const trackerApi = new TrackerApi();
