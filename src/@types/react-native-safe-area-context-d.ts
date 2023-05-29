// react-native-safe-area-context.d.ts
declare module "react-native-safe-area-context/jest/mock" {
    import RNSafeAreaContext, {
        Metrics,
        SafeAreaViewProps,
    } from "react-native-safe-area-context"

    export const initialWindowMetrics: Metrics
    export const SafeAreaProvider: React.FC<SafeAreaViewProps>

    export default RNSafeAreaContext
}
