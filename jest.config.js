/** @type {import("jest").Config} */
const { defaults: tsjPreset } = require("ts-jest/presets")
/** @type {import("jest").Config} */
module.exports = {
    ...tsjPreset,
    testEnvironment: "@shopify/react-native-skia/jestEnv.mjs",
    preset: "react-native",
    setupFiles: ["./node_modules/react-native-gesture-handler/jestSetup.js"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "@shopify/react-native-skia/jestSetup.js"],
    coverageReporters: ["json", "lcov", "text", "text-summary", "clover", "json-summary"],
    testTimeout: 10000,
    transform: {
        "^.+\\.jsx$": "babel-jest",
        "^.+\\.tsx?$": "ts-jest",
        ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
        "^.+\\.js$": "babel-jest",
    },
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)" +
            "|@react-navigation" +
            "|native-base" +
            "|@expo(nent)?/.*" +
            "|@expo-.*" +
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
            "|@transak/ui-react-native-sdk" +
            "|jail-monkey" +
            "|expo/.*" +
            "|@privy-io/.*" +
            "|uuid" +
            "|@shopify/react-native-skia" +
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
        "^~VechainWalletKit(.*)": ["<rootDir>/src/VechainWalletKit$1"],
        "^~Generated(.*)": ["<rootDir>/src/Generated$1"],
        "^~fixtures(.*)": ["<rootDir>/__fixtures__$1"],
        "^react-native-device-info$": "<rootDir>/src/Test/mocks/react-native-device-info.js",
        "^@react-native-community/netinfo$": "<rootDir>/src/Test/mocks/@react-native-community/netinfo.js",
        "^@privy-io/expo$": "<rootDir>/src/Test/mocks/@privy-io/expo.js",
        Intl: "<rootDir>/node_modules/intl/",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: ["**/*.(spec|test).(ts|tsx|js|jsx)"],
    collectCoverageFrom: ["**src/**/*.{js,jsx,ts,tsx}"],
    coveragePathIgnorePatterns: [
        "index.ts",
        "<rootDir>/src/Utils/ConnectionUtils/ConnectionUtils.ts",
        "<rootDir>/src/Utils/AnalyticsUtils/AnalyticsUtils.ts",
        "<rootDir>/src/i18n",
        "<rootDir>/node_modules",
        "<rootDir>/src/Test",
        "<rootDir>/src/@types",
        "<rootDir>/src/AnimatedSplashScreen.tsx",
        "<rootDir>/src/EntryPoint.tsx",
        "<rootDir>/src/SplashScreen.tsx",
        "<rootDir>/src/Assets",
    ],
    maxWorkers: 2,
    workerIdleMemoryLimit: "1GB",
    reporters: ["default", "jest-junit"],
}
