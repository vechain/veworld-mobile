const { getDefaultConfig } = require("expo/metro-config")
const { mergeConfig } = require("@react-native/metro-config")
const defaultConfig = getDefaultConfig(__dirname)

const exts = process.env.RN_SRC_EXT
    ? process.env.RN_SRC_EXT.split(",").concat(defaultConfig.resolver.sourceExts)
    : defaultConfig.resolver.sourceExts

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
    // Package exports in `isows` (a `viem`) dependency are incompatible, so they need to be disabled
    if (moduleName === "isows") {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
        }
        return ctx.resolveRequest(ctx, moduleName, platform)
    }

    // Package exports in `zustand@4` are incompatible, so they need to be disabled
    if (moduleName.startsWith("zustand")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: false,
        }
        return ctx.resolveRequest(ctx, moduleName, platform)
    }

    // Package exports in `jose` are incompatible, so the browser version is used
    if (moduleName === "jose") {
        const ctx = {
            ...context,
            unstable_conditionNames: ["browser"],
        }
        return ctx.resolveRequest(ctx, moduleName, platform)
    }

    // The following block is only needed if you are
    // running React Native 0.78 *or older*.
    if (moduleName.startsWith("@privy-io/")) {
        const ctx = {
            ...context,
            unstable_enablePackageExports: true,
        }
        return ctx.resolveRequest(ctx, moduleName, platform)
    }

    return context.resolveRequest(context, moduleName, platform)
}

module.exports = mergeConfig(defaultConfig, {
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
        resolveRequest: resolveRequestWithPackageExports,
    },
})
