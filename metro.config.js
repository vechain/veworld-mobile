const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config")
const defaultConfig = getDefaultConfig(__dirname)
const { withSentryConfig } = require("@sentry/react-native/metro")

const config = getDefaultConfig(__dirname)
module.exports = withSentryConfig(config)

const exts = process.env.RN_SRC_EXT
    ? process.env.RN_SRC_EXT.split(",").concat(defaultConfig.resolver.sourceExts)
    : defaultConfig.resolver.sourceExts

module.exports = mergeConfig(getDefaultConfig(__dirname), {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
    resolver: {
        assetExts: [...defaultConfig.resolver.assetExts, "lottie"],
        sourceExts: [...exts, "cjs"],
    },
})
