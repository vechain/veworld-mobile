import { Mixpanel } from "mixpanel-react-native"
import { selectAnalyticsTrackingEnabled } from "~Storage/Redux"
import { AppThunk } from "~Storage/Redux/Types"
import { info, warn } from "~Utils/Logger"

let isInitialized = false
let mixpanel: Mixpanel

export interface Properties {
    [key: string]: unknown
}

const initialize = () => {
    const MIX_PANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN

    if (MIX_PANEL_TOKEN) {
        const trackAutomaticEvents = true
        mixpanel = new Mixpanel(MIX_PANEL_TOKEN as string, trackAutomaticEvents)
        mixpanel.init()
        isInitialized = true
        info("Mixpanel initialized")
    } else {
        warn("Analytics token not found")
    }
}

const trackEvent =
    (event: string, properties?: Properties): AppThunk<void> =>
    (_, getState) => {
        try {
            const isAnalyticsEnabled = selectAnalyticsTrackingEnabled(
                getState(),
            )
            if (mixpanel && isInitialized && isAnalyticsEnabled) {
                mixpanel.track(event, properties)
            }
        } catch (e) {
            warn("Error tracking event", e)
        }
    }

export default {
    initialize,
    trackEvent,
}
