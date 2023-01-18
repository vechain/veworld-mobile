module.exports = {
    root: true,
    extends: "@react-native-community",
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    ignorePatterns: ["src/i18n/*"],
    overrides: [
        {
            files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
            rules: {
                "@typescript-eslint/no-shadow": ["error"],
                "no-shadow": "off",
                "no-undef": "off",
                semi: "off",
                quotes: [2, "double", { avoidEscape: true }],
            },
        },
    ],
}
