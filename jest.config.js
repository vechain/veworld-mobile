const { defaults: tsjPreset } = require("ts-jest/presets")

module.exports = {
    ...tsjPreset,
    preset: "react-native",
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
        "^~Components(.*)": ["<rootDir>/src/Components$1"],
        "^~i18n(.*)": ["<rootDir>/src/i18n$1"],
        "^~Assets(.*)": ["<rootDir>/src/Assets$1"],
        "^~Test$": ["<rootDir>/src/Test/index.tsx"],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: ["**/*.(spec|test).(ts|tsx|js|jsx)"],
    /*
     * COVERAGE PARAMS:
     * this is currently checking just utils and base components, it should be extended in the future
     */
    collectCoverageFrom: [
        "src/Common/Utils/**/*.{js,jsx,ts,tsx}",
        "src/Components/Base/**/*.{js,jsx,ts,tsx}",
    ],
    coveragePathIgnorePatterns: [
        "<rootDir>/src/Common/Utils/ConnectionUtils/ConnectionUtils.ts",
    ],

    coverageThreshold: {
        global: {
            statements: 97.12,
            branches: 89.34,
            functions: 96.27,
            lines: 97.3,
        },
    },
    coverageReporters: ["default", "jest-junit"],
}
