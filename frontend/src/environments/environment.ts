declare global {
  interface Window {
    __env?: {
      baseUrl?: string;
    };
  }
}

export const environment = {
  production: false,
  baseUrl: window.__env?.baseUrl || '/api',
};
