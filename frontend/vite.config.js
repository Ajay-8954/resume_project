import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: true
  },
  // Add CSP configuration
  contentSecurityPolicy: {
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://apis.google.com",
      "https://www.gstatic.com",
    ],
    "connect-src": ["'self'", "https://accounts.google.com"],
    "frame-src": ["'self'", "https://accounts.google.com"],
    "style-src": ["'self'", "'unsafe-inline'"],
  },
});
