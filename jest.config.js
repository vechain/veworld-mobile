/** @type {import("jest").Config} */
const { defaults: tsjPreset } = require("ts-jest/presets")

module.exports = {
    ...tsjPreset,
    preset: "jest-expo",
    setupFiles: ["./node_modules/react-native-gesture-handler/jestSetup.js"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    coverageReporters: ["json", "lcov", "text", "text-summary", "clover", "json-summary"],
    testTimeout: 10000,
    transform: {
        "^.+\\.jsx$": "babel-jest",
        "^.+\\.tsx?$": "ts-jest",
        ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
        "^.+\\.js$": "babel-jest",

        "node_modules/@transak/react-native-sdk/node_modules/query-string/index.js": "babel-jest",
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
            "|query-string" +
            "|decode-uri-component" +
            "|split-on-first" +
            "|filter-obj" +
            "|@transak/react-native-sdk" +
            "|jail-monkey" +
            ")",
    ],
    moduleNameMapper: {
        "^~Api(.*)": ["<rootDir>/src/Api$1"],
        "^~Storage(.*)": ["<rootDir>/src/Storage$1"],
        "^~Model(.*)": ["<rootDir>/src/Model$1"],
        "^~Services(.*)": ["<rootDir>/src/Services$1"],
        "^~Screens(.*)": ["<rootDir>/src/Screens$1"],
        "^~Navigation(.*)": ["<rootDir>/src/Navigation$1"],
        "^~Constants(.*)": ["<rootDir>/src/Constants$1"],
        "^~Hooks(.*)": ["<rootDir>/src/Hooks$1"],
        "^~Utils(.*)": ["<rootDir>/src/Utils$1"],
        "^~Components(.*)": ["<rootDir>/src/Components$1"],
        "^~Events(.*)": ["<rootDir>/src/Events$1"],
        "^~i18n(.*)": ["<rootDir>/src/i18n$1"],
        "^~Assets(.*)": ["<rootDir>/src/Assets$1"],
        "^~Test$": ["<rootDir>/src/Test/index.tsx"],
        "^~Networking(.*)": ["<rootDir>/src/Networking$1"],
        "^~Logging(.*)": ["<rootDir>/src/Logging$1"],
        "^react-native-device-info$": "<rootDir>/src/Test/mocks/react-native-device-info.js",
        "^@react-native-community/netinfo$": "<rootDir>/src/Test/mocks/@react-native-community/netinfo.js",
        Intl: "<rootDir>/node_modules/intl/",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: ["**/*.(spec|test).(ts|tsx|js|jsx)"],
    collectCoverageFrom: ["**/*.{js,jsx,ts,tsx}", "!**/node_modules/**", "!**/Screens/**"],
    coveragePathIgnorePatterns: [
        "index.ts",
        "<rootDir>/src/Utils/ConnectionUtils/ConnectionUtils.ts",
        "<rootDir>/src/Utils/AnalyticsUtils/AnalyticsUtils.ts",
        "<rootDir>/src/Utils/MinimizerUtils/MinimizerUtils.ts",
    ],
    coverageThreshold: {
        global: {
            statements: 90,
            branches: 80,
            functions: 90,
            lines: 89.85,
        },
    },
    maxWorkers: 2,
    workerIdleMemoryLimit: "1GB",
    reporters: ["default", "jest-junit"],
}
