import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  envDir: resolve(__dirname),

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        explore: resolve(__dirname, "src/explore.html"),
        compareCities: resolve(__dirname, "src/compare-cities.html"),
        cityResults: resolve(__dirname, "src/city-results.html"),
      },
    },
  },
});
