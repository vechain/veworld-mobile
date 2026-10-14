// TS resolves reanimated's web jestUtils build, which carries neither the matchers
// nor the real withReanimatedTimer signature; the native one has both.
import "react-native-reanimated/lib/typescript/jestUtils/index.native"
