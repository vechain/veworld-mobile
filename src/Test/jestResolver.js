const path = require("path")
const reanimatedResolver = require("react-native-reanimated/jest/resolver")

const EXPO_WINTER_DIR = path.join("expo", "build", "winter")
const eagerInstallGlobal = path.join(__dirname, "mocks", "expoInstallGlobal.js")

// Setting `resolver` drops the preset's, so Reanimated 4's and its packageFilter both reapply here.
module.exports = (request, options) => {
    // See the shim for why expo's lazy global installer can't be used under Jest.
    if (request === "./installGlobal" && options.basedir.includes(EXPO_WINTER_DIR)) {
        return eagerInstallGlobal
    }

    return reanimatedResolver(request, {
        ...options,
        packageFilter: pkg => {
            const filtered = options.packageFilter ? options.packageFilter(pkg) : pkg
            // Keeps react-native subpaths resolvable and mockable (RFC0894).
            if (filtered.name === "react-native") delete filtered.exports
            return filtered
        },
    })
}
