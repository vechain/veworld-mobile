const BUILTIN_SYMBOL = Symbol.for("expo.builtin")

// Expo's winter runtime installs URL, structuredClone and friends as lazy getters that
// `require()` on first touch, and it runs after the setup files. Jest's resetModules
// enumerates every global, so it touches them once the module scope has closed and the
// require throws, taking the whole suite down. Resolve the values at install time.
function installGlobal(name, getValue) {
    const object = typeof global !== "undefined" ? global : globalThis
    const descriptor = Object.getOwnPropertyDescriptor(object, name)
    if (descriptor && !descriptor.configurable) return

    const value = getValue()
    try {
        Object.defineProperty(value, BUILTIN_SYMBOL, { value: true, enumerable: false, configurable: false })
    } catch {
        // Primitives and frozen built-ins can't carry the marker; the global itself still installs.
    }
    Object.defineProperty(object, name, {
        value,
        configurable: true,
        enumerable: descriptor ? descriptor.enumerable !== false : true,
        writable: descriptor ? descriptor.writable !== false : true,
    })
}

module.exports = { installGlobal }
