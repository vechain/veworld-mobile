import { TurboModule, TurboModuleRegistry } from "react-native"

export interface Spec extends TurboModule {
    blockScreen(): void
    unblockScreen(): void
}

export default TurboModuleRegistry.getEnforcing<Spec>("SecureBackground")
