import { useCallback } from "react"
import { SharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Code, CodeScannerFrame } from "react-native-vision-camera"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "~Constants"
import { PlatformUtils } from "~Utils"

type Args = {
    /**
     * Offset X to calculate the preview. It should be based off the starting point of the camera view
     */
    offsetX: SharedValue<number>
    /**
     * Offset Y to calculate the preview. It should be based off the starting point of the camera view
     */
    offsetY: SharedValue<number>
    /**
     * Size of the highlighted rectangle.
     */
    size: number
    /**
     * Function triggered when the scan is successful
     */
    onScan: (data: string) => Promise<void>
}

export const useQrScanDetection = ({ offsetX, offsetY, size, onScan }: Args) => {
    const { bottom } = useSafeAreaInsets()
    return useCallback(
        async (codes: Code[], frame: CodeScannerFrame) => {
            if (codes.length === 0) return
            const code = codes[0]
            if (!code.frame || !code.value) return
            const offset = PlatformUtils.isIOS() ? 100 : 0
            // This is the only way to make it work.
            // You should not change this unless you're 200% sure that what you're doing is correct.
            // This has been developed in a full day of intensive work, so please be careful before touching it.

            //react-native-vision-camera has wrong dimensions set (for example on Android the camera is in 4:3 and on iOS in 16:9).
            //It also flips between width and height arbitrarily, without any explanation.
            const topLeftX =
                ((100 - ((code.frame.y + code.frame.width / 2) / frame.height || 0) * 100) / 100) * SCREEN_WIDTH -
                offset
            const topLeftY =
                ((code.frame.x + code.frame.height / 2) / (frame.width || 0)) * (SCREEN_HEIGHT - bottom) - offset
            const points = [
                {
                    x: topLeftX,
                    y: topLeftY,
                },
                {
                    x: topLeftX + 200,
                    y: topLeftY,
                },
                {
                    x: topLeftX + 200,
                    y: topLeftY + 200,
                },
                {
                    x: topLeftX,
                    y: topLeftY + 200,
                },
            ]

            const biggerRect = {
                x: offsetX.value * 0.8,
                y: offsetY.value * 0.8,
                width: size + offsetX.value * 0.4,
                height: size + offsetY.value * 0.4,
            }

            // Outside of detection area
            if (
                points.every(point => {
                    return (
                        point.x >= biggerRect.x &&
                        point.x <= biggerRect.x + biggerRect.width &&
                        point.y >= biggerRect.y &&
                        point.y <= biggerRect.y + biggerRect.height
                    )
                })
            ) {
                return onScan(code.value)
            }
        },
        [bottom, offsetX.value, offsetY.value, size, onScan],
    )
}
