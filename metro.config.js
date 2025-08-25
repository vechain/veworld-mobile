const { getDefaultConfig } = require("expo/metro-config")
const { mergeConfig } = require("@react-native/metro-config")
const { wrapWithReanimatedMetroConfig } = require("react-native-reanimated/metro-config")
const defaultConfig = getDefaultConfig(__dirname)

const exts = process.env.RN_SRC_EXT
    ? process.env.RN_SRC_EXT.split(",").concat(defaultConfig.resolver.sourceExts)
    : defaultConfig.resolver.sourceExts

module.exports = wrapWithReanimatedMetroConfig(
    mergeConfig(getDefaultConfig(__dirname), {
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
    }),
)
