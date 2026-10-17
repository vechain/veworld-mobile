import type { TransitionPreset } from "@react-navigation/stack"
import { Easing } from "react-native"

export const TRANSITION_DURATION_OPEN = 400
export const TRANSITION_DURATION_CLOSE = 500

export const TRANSITION_SPECS: TransitionPreset["transitionSpec"] = {
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
