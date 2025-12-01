import { ExitAnimationsValues, LayoutAnimation, StyleProps, withTiming } from "react-native-reanimated"
import { LAYOUT_DURATION } from "./constants"

export const ExitingToLeftAnimation = (values: ExitAnimationsValues): LayoutAnimation => {
    "worklet"
    const animations: StyleProps = {
        originX: withTiming(Math.min(values.currentOriginX - values.windowWidth, -values.windowWidth), {
            duration: LAYOUT_DURATION,
        }),
        transform: [{ scale: withTiming(0.8, { duration: LAYOUT_DURATION }) }],
        opacity: withTiming(0.5, { duration: LAYOUT_DURATION }),
    }
    const initialValues: StyleProps = {
        originX: values.currentOriginX,
        transform: [{ scale: 1 }],
        opacity: 1,
        ...values,
    }
    return {
        initialValues,
        animations,
    }
}

export const ExitingToRightAnimation = (values: ExitAnimationsValues): LayoutAnimation => {
    "worklet"
    const animations: StyleProps = {
        originX: withTiming(Math.max(values.currentOriginX + values.windowWidth, values.windowWidth), {
            duration: LAYOUT_DURATION,
        }),
        transform: [{ scale: withTiming(0.8, { duration: LAYOUT_DURATION }) }],
        opacity: withTiming(0.5, { duration: LAYOUT_DURATION }),
    }
    const initialValues: StyleProps = {
        originX: values.currentOriginX,
        transform: [{ scale: 1 }],
        opacity: 1,
        ...values,
    }
    return {
        initialValues,
        animations,
    }
}
