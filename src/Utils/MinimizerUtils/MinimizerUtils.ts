import { NativeModules } from "react-native"
import { ERROR_EVENTS } from "~Constants"
import { error } from "~Utils"

const { Minimizer } = NativeModules

const SafeMinimizer = {
    goBack: () => {
        try {
            Minimizer.goBack()
        } catch (e) {
            error(ERROR_EVENTS.UTILS, e)
        }
    },
}

export default SafeMinimizer
