import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    typescript(),
    json(),
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
  ],
};
