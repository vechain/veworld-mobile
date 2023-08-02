import { NativeModules } from "react-native"
import { error } from "~Utils"

const { Minimizer } = NativeModules

const SafeMinimizer = {
    goBack: () => {
        try {
            Minimizer.goBack()
        } catch (e) {
            error("SafeMinimizer", e)
        }
    },
}

export default SafeMinimizer
