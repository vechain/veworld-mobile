module.exports = {
    presets: ["module:metro-react-native-babel-preset"],

    plugins: [
        "@realm/babel-plugin",
        ["@babel/plugin-proposal-decorators", { legacy: true }],
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
                    "~Common": "./src/Common",
                    "~Components": "./src/Components",
                    "~i18n": "./src/i18n",
                    "~Assets": "./src/Assets",
                    "~Selectors": "./src/Selectors",
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
        "react-native-reanimated/plugin", // should always come last
    ],
}
