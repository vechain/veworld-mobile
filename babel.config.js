module.exports = {
    presets: ["module:metro-react-native-babel-preset"],

    plugins: [
        ["module:react-native-dotenv"],
        [
            "module-resolver",
            {
                root: ["./src"],
                alias: {
                    "~Storage": "./src/Storage",
                    "~Model": "./src/Model",
                    "~Services": "./src/Services",
                    "~Screens": "./src/Screens",
                    "~Navigation": "./src/Navigation",
                    "~Constants": "./src/Constants",
                    "~Hooks": "./src/Hooks",
                    "~Utils": "./src/Utils",
                    "~Components": "./src/Components",
                    "~i18n": "./src/i18n",
                    "~Assets": "./src/Assets",
                    "~Selectors": "./src/Selectors",
                    "~Test": "./src/Test/index.tsx",
                    "~Networking": "./src/Networking",
                    "~Events": "./src/Events",
                    http: "stream-http",
                    https: "https-browserify",
                    crypto: "react-native-quick-crypto",
                    stream: "stream-browserify",
                    buffer: "@craftzdog/react-native-buffer",
                    "@ethersproject/pbkdf2": "./patches/patch-pbkdf2.js",
                    url: "url",
                },
            },
        ],
        [
            // should always come last
            "react-native-reanimated/plugin",
            {
                globals: ["__scanCodes"],
            },
        ],
    ],
}
