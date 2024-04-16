import { DdRum, RumActionType } from "@datadog/mobile-react-native"
class RumManager {
    private viewName: string

    constructor() {
        this.viewName = ""
    }

    public logAction(viewName: string, actionName: string): void {
        this.viewName = viewName
        DdRum.startView(viewName, viewName, {}, Date.now())
        DdRum.addAction(RumActionType.TAP, actionName)
        DdRum.stopView(this.viewName)
    }
}

export { RumManager, RumActionType }
