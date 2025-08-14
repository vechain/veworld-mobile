import { Easing, LinearTransition } from "react-native-reanimated"

export const ANIMATION_TIMING = {
    labelTransition: 200,
    contentFadeDelay: 50,
    contentFade: 300,
    containerExpand: 300,
    containerCollapse: 400,
    paddingChange: 300,
    totalDuration: 400,
}

export const SMOOTH_EASING = Easing.bezier(0.25, 0.1, 0.25, 1)
export const MATERIAL_EASING = Easing.bezier(0.4, 0.0, 0.2, 1)

export const SPRING_CONFIG = {
    damping: 20,
    stiffness: 150,
    mass: 1,
}

export const PRESS_SPRING_CONFIG = {
    damping: 12,
    stiffness: 200,
}

export const TIMING_CONFIG = {
    duration: 300,
    easing: MATERIAL_EASING,
}

export const CONTENT_TIMING_CONFIG = {
    duration: ANIMATION_TIMING.contentFade,
    easing: SMOOTH_EASING,
}

export const LAYOUT_TRANSITION = LinearTransition.springify().damping(20).stiffness(100).mass(0.6)
