import { PixelRatio, Platform } from "react-native"
import { SCREEN_WIDTH } from "~Constants"

const GUIDELINE_WIDTH = 375

// Pre-calculate platform and pixel ratio for use in worklets
const IS_IOS = Platform.OS === "ios"
const PIXEL_RATIO = PixelRatio.get()

// Custom pixel rounding that works in worklets
const roundToPixel = (value: number, pixelRatio: number) => {
    "worklet"
    return Math.round(value * pixelRatio) / pixelRatio
}

export const scale = (size: number) => (SCREEN_WIDTH / GUIDELINE_WIDTH) * size
export const scaleWorklet = (size: number) => {
    "worklet"
    return (SCREEN_WIDTH / GUIDELINE_WIDTH) * size
}

export const font = (size: number) => {
    const newSize = scale(size)
    const rounded = Math.round(PixelRatio.roundToNearestPixel(newSize))
    return Platform.OS === "ios" ? rounded : rounded - 1
}

export const fontWorklet = (size: number) => {
    "worklet"
    const newSize = scaleWorklet(size)
    const rounded = Math.round(roundToPixel(newSize, PIXEL_RATIO))
    return IS_IOS ? rounded : rounded - 1
}
