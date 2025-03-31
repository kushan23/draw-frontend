export const BACKEND_URL = 
  typeof window !== "undefined" && window.NEXT_RUNTIME_ENV?.BACKEND_URL 
    ? window.NEXT_RUNTIME_ENV.BACKEND_URL 
    : process.env.NEXT_PUBLIC_BACKEND_URL;

export const WS_URL = 
  typeof window !== "undefined" && window.NEXT_RUNTIME_ENV?.WS_URL 
    ? window.NEXT_RUNTIME_ENV.WS_URL 
    : process.env.NEXT_PUBLIC_WS_URL;