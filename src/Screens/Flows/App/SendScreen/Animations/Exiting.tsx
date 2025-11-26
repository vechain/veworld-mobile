import { ExitAnimationsValues, StyleProps, withTiming } from "react-native-reanimated"

type LayoutAnimation = {
    initialValues: StyleProps
    animations: StyleProps
    callback?: (finished: boolean) => void
}

// export const ExitingAnimation = (values: ExitAnimationsValues): LayoutAnimation => {
//     "worklet"
//     const animations: StyleProps = {
//         opacity: withTiming(0, { duration: 2000 }),
//         transform: [{ scale: withTiming(0, { duration: 2000 }) }],
//     }
//     const initialValues: StyleProps = {
//         opacity: 1,
//         transform: [{ scale: 1 }],
//         transformOrigin: "center",
//     }
//     return {
//         initialValues,
//         animations,
//     }
// }

export const ExitingToLeftAnimation = (values: ExitAnimationsValues): LayoutAnimation => {
    "worklet"
    const animations: StyleProps = {
        originX: withTiming(Math.min(values.currentOriginX - values.windowWidth, -values.windowWidth), {
            duration: 2000,
        }),
    }
    const initialValues: StyleProps = {
        originX: values.currentOriginX,
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
            duration: 2000,
        }),
    }
    const initialValues: StyleProps = {
        originX: values.currentOriginX,
        ...values,
    }
    return {
        initialValues,
        animations,
    }
}
