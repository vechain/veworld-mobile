const reanimatedResolver = require("react-native-reanimated/jest/resolver")

// Reanimated 4 needs its own resolver, but setting `resolver` replaces the one
// @react-native/jest-preset installs, so its packageFilter has to be reapplied here.
module.exports = (request, options) =>
    reanimatedResolver(request, {
        ...options,
        packageFilter: pkg => {
            const filtered = options.packageFilter ? options.packageFilter(pkg) : pkg
            // Keeps react-native subpaths resolvable and mockable (RFC0894).
            if (filtered.name === "react-native") delete filtered.exports
            return filtered
        },
    })
