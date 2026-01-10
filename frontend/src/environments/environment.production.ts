declare global {
  interface Window {
    __env?: {
      baseUrl?: string;
    };
  }
}

export const environment = {
  production: true,
  baseUrl: window.__env?.baseUrl || '/api',
};
