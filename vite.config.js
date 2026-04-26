import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vercel auto-detects Vite. For local dev with the /api proxy,
// run `vercel dev` instead of `npm run dev` so the serverless
// functions in /api are served alongside the frontend.
export default defineConfig({
  plugins: [react()],
});
