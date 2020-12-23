module.exports = {
  /* your base configuration of choice */
  extends: ["plugin:vue/essential", "plugin:prettier/recommended","eslint:recommended"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2017,
    sourceType: "module"
  },
  parserOptions: {
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    commonjs: true
  },
  globals: {
    __static: true
  },
  rules: {
    "no-const-assign": "warn",
    "no-this-before-super": "warn",
    "no-undef": "warn",
    "no-unreachable": "warn",
    "no-unused-vars": "off",
    "constructor-super": "warn",
    "valid-typeof": "warn",
    "vue/experimental-script-setup-vars": "off"
  }
};
