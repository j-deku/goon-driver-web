/* eslint-disable no-undef */
// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
//import { execSync } from "child_process";
//import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        srcDir: "public",
        filename: "firebase-messaging-sw.js",
        includeAssets: [
          "TT-logo-1024x1024.png",
          "TT-logo-512x512.png",
          "TT-logo-192x192.png",
        ],
        injectManifest: {
          globPatterns: ["**/*.{js,jsx,css,html,png,jpg,jpeg,svg,ico,json}"],
          globIgnores: [
            "firebase-messaging-sw.js",
            "firebase-messaging-sw.js.map",
          ],
          swSrc: "public/firebase-messaging-sw.js",
          swDest: "firebase-messaging-sw.js",
          mode: "production",
          sourcemap: true,
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        manifest: {
          name: "TOLI-TOLI",
          short_name: "TOLI-TOLI",
          description: "Book Your Rides, Get Your Receipts.",
          gcm_sender_id: "103953800507",
          screenshots: [
            {
              src: "/GN-logo.png",
              sizes: "1024x1024",
              type: "image/png",
              purpose: "maskable",
              form_factor: "narrow",
            },
            {
              src: "/TT-logo.png",
              sizes: "360x360",
              type: "image/png",
              purpose: "maskable",
              form_factor: "wide",
            },
          ],
          icons: [
            {
              src: "/TT-logo-144x144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "any",
              form_factor: "wide",
            },
            {
              src: "/TT-logo-32x32.png",
              sizes: "32x32",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/TT-logo.png",
              sizes: "180x180",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/TT-logo-1024x1024.png",
              sizes: "1024x1024",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/TT-logo-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/TT-logo-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
          ],
          related_applications: [],
          start_url: "/",
          id: "floral-decor",
          background_color: "#FFFFFF",
          theme_color: "#2C3E50",
          display_override: ["fullscreen", "minimal-ui"],
          display: "standalone",
          orientation: "portrait",
          animation: "pulse",
          scope: "/",
          protocol_handlers: [
            {
              protocol: "web+goon",
              url: "/handler?/=%s",
            },
            {
              protocol: "tel",
              url: "/handler?/=%s",
            },
            {
              protocol: "web+goon",
              url: "/handler?/=%s",
            },
          ],
        },
        base: "/",
      }),
      /*  {
      name: "obfuscate-build",
      closeBundle() {
        const distPath = "dist/assets";

        if (fs.existsSync(distPath)) {
          console.log("🔒 Obfuscating frontend code...");
          execSync(
            `npx javascript-obfuscator ${distPath} --output ${distPath} --config obfuscator.config.json`,
            { stdio: "inherit" }
          );
        }
      },
    }, */
    ],
    build: {
      target: "esnext",
      outDir: "build",
      minify: "terser",
      sourcemap: mode !== "production",
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Use the env var you loaded above:
        "/api": {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
        },
      },
      host: true,
      allowedHosts: [".ngrok-free.app", "localhost", ".mokpokpo.com"],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
