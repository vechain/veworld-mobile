import { PixelRatio, Platform } from "react-native"
import { SCREEN_WIDTH } from "~Constants"

const GUIDELINE_WIDTH = 375

export const scale = (size: number) => (SCREEN_WIDTH / GUIDELINE_WIDTH) * size

export const font = (size: number) => {
    const newSize = scale(size)
    const rounded = Math.round(PixelRatio.roundToNearestPixel(newSize))
    return Platform.OS === "ios" ? rounded : rounded - 1
}
