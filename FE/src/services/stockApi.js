import axios from "axios";

/**
 * Axios instance using VITE_FIREANT_BASE_URL from .env.
 * In development the Vite proxy rewrites /api → base URL to avoid CORS.
 * In production the base URL is used directly.
 */
const isDev = import.meta.env.DEV;
const baseURL =
  import.meta.env.VITE_FIREANT_BASE_URL ?? "https://restv2.fireant.vn";
const token = import.meta.env.VITE_FIREANT_TOKEN;

// Ensure baseURL always ends with "/" so axios resolves relative paths correctly.
const normalizedBase = (isDev ? "/api" : baseURL).replace(/\/?$/, "/");

const apiClient = axios.create({
  baseURL: normalizedBase,
  headers: {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,vi;q=0.8",
    authorization: `Bearer ${token}`,
    "cache-control": "no-cache",
    origin: "https://fireant.vn",
    pragma: "no-cache",
    referer: "https://fireant.vn/",
  },
});

/**
 * Fetch historical quotes for a stock symbol.
 *
 * @param {string} symbol    - Stock ticker e.g. "SHS"
 * @param {string} startDate - ISO date string "YYYY-MM-DD"
 * @param {string} endDate   - ISO date string "YYYY-MM-DD"
 * @param {number} offset    - Pagination offset (default 0)
 * @param {number} limit     - Number of records (default 100, max 1000)
 * @returns {Promise<Array>} Array of historical quote objects
 */
export const fetchHistoricalQuotes = async (
  symbol,
  startDate,
  endDate,
  offset = 0,
  limit = 100,
) => {
  // No leading "/" — let axios join properly with baseURL
  const response = await apiClient.get(`symbols/${symbol}/historical-quotes`, {
    params: { startDate, endDate, offset, limit },
  });
  return response.data;
};
