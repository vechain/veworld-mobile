module.exports = {
    root: true,
    extends: "@react-native-community",
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "i18next"],
    ignorePatterns: ["src/i18n/*"],
    overrides: [
        {
            files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
            rules: {
                "@typescript-eslint/no-shadow": ["error"],
                "no-shadow": "off",
                "no-undef": "off",
                semi: "off",
                curly: "off",
                quotes: [2, "double", { avoidEscape: true }],
                "i18next/no-literal-string": 1,
            },
        },
    ],
}
