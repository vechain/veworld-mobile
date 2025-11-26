import { EntryAnimationsValues, StyleProps, withTiming } from "react-native-reanimated"

type LayoutAnimation = {
    initialValues: StyleProps
    animations: StyleProps
    callback?: (finished: boolean) => void
}

// export const EnteringAnimation = (values: EntryAnimationsValues): LayoutAnimation => {
//     "worklet"
//     const animations: StyleProps = {
//         opacity: withTiming(1, { duration: 2000 }),
//         transform: [{ scale: withTiming(1, { duration: 2000 }) }],
//     }
//     const initialValues: StyleProps = {
//         originX: values.targetOriginX,
//         opacity: 0,
//         transform: [{ scale: 0 }],
//         transformOrigin: "center",
//     }
//     return {
//         initialValues,
//         animations,
//     }
// }

export const EnteringFromLeftAnimation = (values: EntryAnimationsValues): LayoutAnimation => {
    "worklet"
    const animations: StyleProps = {
        originX: withTiming(values.targetOriginX, { duration: 2000 }),
    }
    const initialValues: StyleProps = {
        originX: values.targetOriginX - values.windowWidth,
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
        originX: withTiming(values.targetOriginX, { duration: 2000 }),
    }
    const initialValues: StyleProps = {
        originX: values.targetOriginX + values.windowWidth,
        ...values,
    }
    return {
        initialValues,
        animations,
    }
}
