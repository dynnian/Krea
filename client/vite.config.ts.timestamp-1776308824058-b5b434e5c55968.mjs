// vite.config.ts
import { reactRouter } from "file:///mnt/c/dev/krea/client/node_modules/.deno/@react-router+dev@7.12.0/node_modules/@react-router/dev/dist/vite.js";
import tailwindcss from "file:///mnt/c/dev/krea/client/node_modules/.deno/@tailwindcss+vite@4.1.13/node_modules/@tailwindcss/vite/dist/index.mjs";
import { resolve } from "node:path";
import { defineConfig } from "file:///mnt/c/dev/krea/client/node_modules/.deno/vite@7.1.7/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///mnt/c/dev/krea/client/node_modules/.deno/vite-tsconfig-paths@5.1.4/node_modules/vite-tsconfig-paths/dist/index.js";
import process from "node:process";
var __vite_injected_original_dirname = "/mnt/c/dev/krea/client";
var vite_config_default = defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "app"),
      "~": resolve(__vite_injected_original_dirname, "app")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlUm9vdCI6ICJmaWxlOi8vL21udC9jL2Rldi9rcmVhL2NsaWVudC8iLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9tbnQvYy9kZXYva3JlYS9jbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvYy9kZXYva3JlYS9jbGllbnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL21udC9jL2Rldi9rcmVhL2NsaWVudC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IHJlYWN0Um91dGVyIH0gZnJvbSBcIkByZWFjdC1yb3V0ZXIvZGV2L3ZpdGVcIjtcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tIFwiQHRhaWx3aW5kY3NzL3ZpdGVcIjtcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSBcInZpdGUtdHNjb25maWctcGF0aHNcIjtcbmltcG9ydCBwcm9jZXNzIGZyb20gXCJub2RlOnByb2Nlc3NcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3RhaWx3aW5kY3NzKCksIHJlYWN0Um91dGVyKCksIHRzY29uZmlnUGF0aHMoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJhcHBcIiksXG4gICAgICBcIn5cIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiYXBwXCIpLFxuICAgIH0sXG4gIH1cbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvUCxTQUFTLG1CQUFtQjtBQUNoUixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLGVBQWU7QUFDeEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxhQUFhO0FBTHBCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxZQUFZLEdBQUcsWUFBWSxHQUFHLGNBQWMsQ0FBQztBQUFBLEVBQ3ZELFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxLQUFLO0FBQUEsTUFDakMsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
