// expo/fetch is backed by a native module, so under Jest its Response base class is
// undefined and every suite that touches `fetch` fails to load. This flag is Expo's
// supported way to keep React Native's fetch polyfill instead, and it has to be set
// before expo's winter runtime is imported.
process.env.EXPO_PUBLIC_USE_RN_FETCH = "1"
