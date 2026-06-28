import { defineConfig } from "vite";
import cesium from "vite-plugin-cesium";

export default defineConfig({
  plugins: [cesium()],
  worker: {
    // satellite.js's WASM pthreads build uses top-level `await` inside its
    // worker file. The default 'iife' worker format doesn't support that,
    // which causes Cloudflare Pages builds to fail with:
    //   [UNSUPPORTED_FEATURE] Top-level await is currently not supported
    //   with the 'iife' output format
    // Native ES module workers do support top-level await, so switch to 'es'.
    format: "es",
  },
  build: {
    target: "esnext",
  },
});