declare global {
    interface Window {
      NEXT_RUNTIME_ENV?: {
        BACKEND_URL?: string;
        WS_URL?: string;
      };
    }
  }
  
  export {};
  