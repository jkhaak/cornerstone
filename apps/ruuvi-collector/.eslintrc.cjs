// This is a workaround for https://github.com/eslint/eslint/issues/3458
require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
  extends: ["@rushstack/eslint-config/profile/node"],
  rules: {
    // disable typedef
    "@rushstack/typedef-var": "off",

    // prefer types
    "@typescript-eslint/consistent-type-definitions": ["error", "type"]
  },
  parserOptions: { tsconfigRootDir: __dirname }
};
