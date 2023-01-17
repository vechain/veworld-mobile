import { error } from "~Common/Logger/Logger"

export const inIframe = () => {
    try {
        return window.self !== window.top
    } catch (e) {
        error(e)
        return true
    }
}
