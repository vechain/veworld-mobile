// expo/fetch needs a native module Jest lacks; keep RN's polyfill. Must precede expo's winter runtime.
process.env.EXPO_PUBLIC_USE_RN_FETCH = "1"
