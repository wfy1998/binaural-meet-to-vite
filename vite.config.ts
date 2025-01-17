import { defineConfig } from "vite";
import reactSupport from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import babel from '@rollup/plugin-babel'; // 确保 Vite 使用 Babel
import viteTsconfigPaths from 'vite-tsconfig-paths'
import reactRefresh from '@vitejs/plugin-react-refresh'
import { mediapipe } from 'vite-plugin-mediapipe';
import * as fs from 'fs';

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
    mediapipe(),
    mediapipe_workaround(),
    // babel() // 确保 Vite 使用 Babel
  ],



});


function mediapipe_workaround() {
  return {
    name: "mediapipe_workaround",
    load(id) {
      if (path.basename(id) === "face_mesh.js") {
        let code = fs.readFileSync(id, "utf-8")
        code += "exports.FaceMesh = FaceMesh;"
        return { code }
      } else {
        return null
      }
    },
  }
}