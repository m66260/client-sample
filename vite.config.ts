/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';
import { peerDependencies } from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts", // Specifies the entry point for building the library.
      name: "vite-react-ts-button", // Sets the name of the generated library.
      fileName: (format) => `index.${format}.js`, // Generates the output file name based on the format.
      formats: ["cjs", "es"], // Specifies the output formats (CommonJS and ES modules).
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies)], // Defines external dependencies for Rollup bundling.
    },
    sourcemap: true, // Generates source maps for debugging.
    emptyOutDir: true, // Clears the output directory before building.
  },
  resolve: {
    alias: [
      {
        // this is required for the SCSS modules
        find: /^~(.*)$/,
        replacement: "src/$1",
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./setupTests.ts",
  },
  plugins: [
    dts(),
    react(),
    viteTsconfigPaths(),
    // svgr options: https://react-svgr.com/docs/options/
    svgr({ svgrOptions: { icon: true } }),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),], // Uses the 'vite-plugin-dts' plugin for generating TypeScript declaration files (d.ts).
});