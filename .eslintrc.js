module.exports = {
    root: true,
    extends: ["@react-native/eslint-config"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "i18next", "es"],
    ignorePatterns: ["src/i18n/*", "coverage/*"],
    overrides: [
        {
            files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
            rules: {
                // "prettier/prettier": ["error", { semi: false }],
                "@typescript-eslint/no-shadow": ["error"],
                "no-shadow": "off",
                "no-undef": "off",
                semi: "off",
                curly: "off",
                quotes: [2, "double", { avoidEscape: true }],
                "max-len": ["error", { code: 120, comments: 220 }],
                "i18next/no-literal-string": "error",
                "no-console": "error",
                "no-duplicate-imports": "error",
                "@typescript-eslint/no-unused-vars": "error",
                "no-useless-escape": "error",
                "react-native/no-inline-styles": "error",
                "es/no-numeric-separators": "error",
            },
        },
        {
            files: ["./src//Assets/**/*"],
            rules: {
                "max-len": "off",
            },
        },
    ],
}
