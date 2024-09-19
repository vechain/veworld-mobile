//Currently a pause on logging for datadog but leaving for future use
import { DdRum, RumActionType } from "@datadog/mobile-react-native"
class RumManager {
    public logAction(viewName: string, actionName: string, context?: string): void {
        DdRum.startView(viewName, viewName, {}, Date.now())
        DdRum.addAction(RumActionType.TAP, actionName, context ? { context } : {}, Date.now())
        DdRum.stopView(viewName)
    }
}

export { RumManager, RumActionType }
