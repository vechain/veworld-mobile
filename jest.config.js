/** @type {import("jest").Config} */
const { defaults: tsjPreset } = require("ts-jest/presets")

module.exports = {
    ...tsjPreset,
    preset: "jest-expo",
    setupFiles: ["./node_modules/react-native-gesture-handler/jestSetup.js"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    coverageReporters: [
        "json",
        "lcov",
        "text",
        "text-summary",
        "clover",
        "json-summary",
    ],
    testTimeout: 10000,
    transform: {
        "^.+\\.jsx$": "babel-jest",
        "^.+\\.tsx?$": "ts-jest",
        ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
            "jest-transform-stub",
    },
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)" +
            "|@react-navigation" +
            "|native-base" +
            "|@expo(nent)?/.*" +
            "|@expo-google-fonts/.*" +
            "|expo-.*" +
            "|@unimodules" +
            "|sentry-expo" +
            "|react-native-quick-crypto" +
            "|stream-browserify" +
            "|@craftzdog/react-native-buffer" +
            "|react-native-svg" +
            "|mixpanel-react-native" +
            ")",
    ],
    moduleNameMapper: {
        "^~Storage(.*)": ["<rootDir>/src/Storage$1"],
        "^~Model(.*)": ["<rootDir>/src/Model$1"],
        "^~Services(.*)": ["<rootDir>/src/Services$1"],
        "^~Screens(.*)": ["<rootDir>/src/Screens$1"],
        "^~Navigation(.*)": ["<rootDir>/src/Navigation$1"],
        "^~Constants(.*)": ["<rootDir>/src/Constants$1"],
        "^~Hooks(.*)": ["<rootDir>/src/Hooks$1"],
        "^~Utils(.*)": ["<rootDir>/src/Utils$1"],
        "^~Components(.*)": ["<rootDir>/src/Components$1"],
        "^~i18n(.*)": ["<rootDir>/src/i18n$1"],
        "^~Assets(.*)": ["<rootDir>/src/Assets$1"],
        "^~Test$": ["<rootDir>/src/Test/index.tsx"],
        "^~Networking(.*)": ["<rootDir>/src/Networking$1"],

        Intl: "<rootDir>/node_modules/intl/",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: ["**/*.(spec|test).(ts|tsx|js|jsx)"],

    collectCoverageFrom: ["src/Utils/**/*.{js,jsx,ts,tsx}"],
    coveragePathIgnorePatterns: [
        "index.ts",
        "<rootDir>/src/Utils/ConnectionUtils/ConnectionUtils.ts",
        "<rootDir>/src/Utils/AnalyticsUtils/AnalyticsUtils.ts",
        "<rootDir>/src/Utils/MinimizerUtils/MinimizerUtils.ts",
    ],
    coverageThreshold: {
        global: {
            statements: 96.19,
            branches: 89.15,
            functions: 95.9,
            lines: 96.75,
        },
    },
    maxWorkers: 2,
    workerIdleMemoryLimit: "1GB",
    reporters: ["default", "jest-junit"],
}
