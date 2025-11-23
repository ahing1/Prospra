import axios from "axios";

const normalizeBaseUrl = (value?: string) => {
  if (!value) return undefined;
  return value.startsWith("http") ? value : `http://${value}`;
};

const resolveBaseUrl = () => {
  const isServer = typeof window === "undefined";
  const serverUrl =
    normalizeBaseUrl(process.env.INTERNAL_API_URL) ??
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  const browserUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL);
  return (isServer ? serverUrl : browserUrl) ?? "http://127.0.0.1:8000";
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
