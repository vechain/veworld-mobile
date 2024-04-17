import { DdRum, RumActionType } from "@datadog/mobile-react-native"
class RumManager {
    public logAction(viewName: string, actionName: string): void {
        DdRum.startView(viewName, viewName, {}, Date.now())
        DdRum.addAction(RumActionType.TAP, actionName)
        DdRum.stopView(viewName)
    }
}

export { RumManager, RumActionType }
