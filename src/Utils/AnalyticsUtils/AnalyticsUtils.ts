import { Mixpanel } from "mixpanel-react-native"
import { ERROR_EVENTS } from "~Constants"
import { selectAnalyticsTrackingEnabled } from "~Storage/Redux"
import { AppThunk } from "~Storage/Redux/Types"
import { info, warn } from "~Utils/Logger"

let isInitialized = false
export let mixpanel: Mixpanel

export interface AnalyticsProperties {
    [key: string]: unknown
}

const initialize = () => {
    const MIX_PANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN

    if (MIX_PANEL_TOKEN) {
        const trackAutomaticEvents = true
        mixpanel = new Mixpanel(MIX_PANEL_TOKEN as string, trackAutomaticEvents)
        mixpanel.init()
        isInitialized = true
        info(ERROR_EVENTS.APP, "Mixpanel initialized")
    } else {
        warn(ERROR_EVENTS.APP, "Analytics token not found")
    }
}

const trackEvent =
    (event: string, properties?: AnalyticsProperties): AppThunk<void> =>
    (_, getState) => {
        try {
            const isAnalyticsEnabled = selectAnalyticsTrackingEnabled(getState())
            if (mixpanel && isInitialized && isAnalyticsEnabled) {
                mixpanel.track(event, properties)
            }
        } catch (e) {
            warn(ERROR_EVENTS.APP, "Error tracking event", e)
        }
    }

export default {
    initialize,
    trackEvent,
}
