import { defineConfig } from "vite";

export default defineConfig({
  root: "src", // Set 'src' as the root directory
  base: "./", // Ensures assets are correctly resolved
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "../dist", // Output directory adjusted for the new root
    emptyOutDir: true, // Clears the output directory before each build
    sourcemap: true,
  },
});
