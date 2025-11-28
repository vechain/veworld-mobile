import { EntryAnimationsValues, LayoutAnimation, StyleProps, withTiming } from "react-native-reanimated"
import { LAYOUT_DURATION } from "./constants"

export const EnteringFromLeftAnimation = (values: EntryAnimationsValues): LayoutAnimation => {
    "worklet"
    const animations: StyleProps = {
        originX: withTiming(values.targetOriginX, { duration: LAYOUT_DURATION }),
        transform: [{ scale: withTiming(1, { duration: LAYOUT_DURATION }) }],
    }
    const initialValues: StyleProps = {
        originX: values.targetOriginX - values.windowWidth,
        transform: [{ scale: 0.8 }],
        ...values,
    }
    return {
        initialValues,
        animations,
    }
}

export const EnteringFromRightAnimation = (values: EntryAnimationsValues): LayoutAnimation => {
    "worklet"
    const animations: StyleProps = {
        originX: withTiming(values.targetOriginX, { duration: LAYOUT_DURATION }),
        transform: [{ scale: withTiming(1, { duration: LAYOUT_DURATION }) }],
    }
    const initialValues: StyleProps = {
        originX: values.targetOriginX + values.windowWidth,
        transform: [{ scale: 0.8 }],
        ...values,
    }
    return {
        initialValues,
        animations,
    }
}
