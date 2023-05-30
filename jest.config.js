const { defaults: tsjPreset } = require("ts-jest/presets")

module.exports = {
    ...tsjPreset,
    preset: "jest-expo",
    setupFiles: ["./node_modules/react-native-gesture-handler/jestSetup.js"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
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
            ")",
    ],
    moduleNameMapper: {
        "^~Storage(.*)": ["<rootDir>/src/Storage$1"],
        "^~Model(.*)": ["<rootDir>/src/Model$1"],
        "^~Services(.*)": ["<rootDir>/src/Services$1"],
        "^~Screens(.*)": ["<rootDir>/src/Screens$1"],
        "^~Navigation(.*)": ["<rootDir>/src/Navigation$1"],
        "^~Common(.*)": ["<rootDir>/src/Common$1"],
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
    /*
     * COVERAGE PARAMS:
     * this is currently checking just utils and base components, it should be extended in the future
     */
    collectCoverageFrom: [
        "src/Utils/**/*.{js,jsx,ts,tsx}",
        "src/Common/Utils/**/*.{js,jsx,ts,tsx}",
        "src/Common/Hooks/**/*.{js,jsx,ts,tsx}",
        "src/Components/Base/**/*.{js,jsx,ts,tsx}",
    ],
    coveragePathIgnorePatterns: [
        "index.ts",
        "<rootDir>/src/Common/Hooks/useAppReset/useAppReset.tsx",
        "<rootDir>/src/Utils/ConnectionUtils/ConnectionUtils.ts",
    ],

    coverageThreshold: {
        global: {
            statements: 94.38,
            branches: 86.75,
            functions: 96.0,
            lines: 94.4,
        },
    },
    coverageProvider: "v8",
    maxWorkers: 4,
    workerIdleMemoryLimit: "1GB",
    reporters: ["default", "jest-junit"],
}
