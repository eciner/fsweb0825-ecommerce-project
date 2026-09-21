import axios from "axios";

const TOKEN_KEY = "token";

let sessionToken = null;

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://workintech-fe-ecommerce.onrender.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

function extractErrorMessage(error) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData === "object" &&
    typeof responseData.message === "string"
  ) {
    return responseData.message;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return "Request failed. Please try again.";
}

function normalizeApiError(error) {
  return {
    message: extractErrorMessage(error),
    status: error?.response?.status ?? null,
    code: error?.code ?? null,
  };
}

function toApiError(error) {
  const normalized = normalizeApiError(error);
  const apiError = new Error(normalized.message);
  apiError.status = normalized.status;
  apiError.code = normalized.code;
  return apiError;
}

export function setAuthToken(token) {
  sessionToken = token || null;

  if (sessionToken) {
    api.defaults.headers.common.Authorization = sessionToken;
    return;
  }

  delete api.defaults.headers.common.Authorization;
}

export function clearAuthToken() {
  setAuthToken(null);
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use(
  (config) => {
    const headers = config.headers || {};

    if (!headers.Authorization && sessionToken) {
      headers.Authorization = sessionToken;
    }

    return {
      ...config,
      headers,
    };
  },
  (error) => Promise.reject(toApiError(error)),
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(toApiError(error)),
);

export default api;
