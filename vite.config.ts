import { defineConfig } from "vite";
import reactSupport from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import babel from '@rollup/plugin-babel'; // 确保 Vite 使用 Babel
import viteTsconfigPaths from 'vite-tsconfig-paths'
import reactRefresh from '@vitejs/plugin-react-refresh'


const path = require("path");

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  resolve: {                                // ・・・・追加
    alias: {                                // ・・・・追加
      '@': path.resolve(__dirname, './src') // ・・・・追加
    }                                       // ・・・・追加
  },                                        // ・・・・追加
  build: {
    outDir: "build",
  },
  plugins: [
    reactSupport({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties']
        }
      }
    }),
    viteTsconfigPaths(),
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    // babel() // 确保 Vite 使用 Babel
  ],

});