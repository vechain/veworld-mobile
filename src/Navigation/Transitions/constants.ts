import { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types"
import { Easing } from "react-native"

export const TRANSITION_DURATION_OPEN = 400
export const TRANSITION_DURATION_CLOSE = 500

type TransitionSpecs = {
    open: TransitionSpec
    close: TransitionSpec
}

export const TRANSITION_SPECS: TransitionSpecs = {
    open: {
        animation: "timing",
        config: {
            duration: TRANSITION_DURATION_OPEN,
            easing: Easing.inOut(Easing.ease),
        },
    },
    close: {
        animation: "timing",
        config: {
            duration: TRANSITION_DURATION_CLOSE,
        },
    },
}
