// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
  extends: ["./node_modules/@cornerstone/node-rig/profiles/default/eslint-base"],
  parserOptions: { tsconfigRootDir: __dirname },
};
