import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import reactRefresh from "@vitejs/plugin-react-refresh";
import { copy } from "vite-plugin-copy";

export default defineConfig(({ mode }) => {
  return {
    base: "/",
    plugins: [
      react(),
      reactRefresh(),
      VitePWA({
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MB
          clientsClaim: true,
          skipWaiting: true,
        },
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico"],
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: "AKB",
          short_name: "akb",
          start_url: ".",
          display: "standalone",
          background_color: "#ffffff",
          description: "AKB Admin",
          theme_color: "#4CAF50",
          icons: [
            {
              src: "favicon.svg",
              sizes: "192x192 512x512",
              type: "image/svg+xml",
              purpose: "any maskable"
            }
          ],
        },
      }),
      copy({
        targets: [
          {
            src: "src/images/*", // Source path for images
            dest: "src/images", // Destination path in the build folder
          },
        ],
      }),
    ],
    esbuild: {
      //jsxInject: `import React from 'react';`
      jsxFactory: "React.createElement",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    build: {
      minify: mode === "production",
      sourcemap: mode === "development",
      outDir: "dist", // Ensure the output directory is correctly specified
      rollupOptions: {
        input: {
          main: "/index.html", // Ensure the input points to your index.html file
        },
      },
    },
    server: {
      port: 3000,
      open: true,
      historyApiFallback: true,
    },
    resolve: {
      extensions: [".js", ".jsx", ".css"],
      // Define aliases for commonly used directories
      alias: {
        // This will allow you to use 'src' as an alias for the './src' directory
        src: path.resolve(__dirname, "src"),
        // You can add more aliases for other commonly used directories if needed
        // For example, if you have a directory './src/assets', you can use 'assets' as an alias
        assets: path.resolve(__dirname, "src/assets"),
        images: path.resolve(__dirname, "src/images"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
