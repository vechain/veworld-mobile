// The real module resolves the NitroModules TurboModule at import time, which no Jest
// environment can provide. Libraries built on Nitro (MMKV) fall back to their own JS
// mocks, so nothing here should ever be called.
const unavailable = name => {
    throw new Error(`Nitro HybridObject "${name}" is not available under Jest; mock the library that uses it instead.`)
}

export const NitroModules = {
    createHybridObject: unavailable,
    hasHybridObject: () => false,
    isHybridObject: () => false,
    getAllHybridObjectNames: () => [],
    box: unavailable,
    hasNativeState: () => false,
    buildType: "debug",
    version: require("react-native-nitro-modules/package.json").version,
}

export const getHybridObjectConstructor = unavailable
export const getHostComponent = unavailable
export const callback = fn => fn
