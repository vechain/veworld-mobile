import { useCallback } from "react"
import { PixelRatio } from "react-native"
import { SharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Code, CodeScannerFrame, DrawableFrame, runAtTargetFps } from "react-native-vision-camera"
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
    points: SharedValue<{ x: number; y: number }[]>
    codes: SharedValue<Code[]>
    frame: SharedValue<DrawableFrame>
    setCodes: (codes: Code[]) => void
    setFrame: (frame: DrawableFrame) => void
}

export const useQrScanDetection = ({
    offsetX,
    offsetY,
    size,
    onScan,
    points: _points,
    codes: _codes,
    frame: _frame,
    setCodes: _setCodes,
    setFrame: _setFrame,
}: Args) => {
    const { bottom } = useSafeAreaInsets()
    return useCallback(
        async (codes: Code[], frame: CodeScannerFrame) => {
            if (codes.length === 0) return
            const code = codes[0]
            if (!code.frame || !code.value) return
            const offset = PlatformUtils.isIOS() ? 100 : 0
            const topLeftX =
                ((100 - ((code.frame.y + code.frame.width / 2) / frame.height || 0) * 100) / 100) * SCREEN_WIDTH -
                offset
            const topLeftY =
                ((code.frame.x + code.frame.height / 2) / (frame.width || 0)) * (SCREEN_HEIGHT - bottom) - offset
            const points = [
                // {
                //     // x: (parseFloat(
                //     //     `${100 - ((code.frame.y + code.frame.width / 2) / frame.height || 0) * 100}`,
                //     // ) /
                //     //     100) *
                //     // SCREEN_WIDTH - offset,
                //     x: ((100 - ((code.frame.y + code.frame.width / 2) / frame.height || 0) * 100) /
                //         100) *
                //     SCREEN_WIDTH - offset,
                //     // y:
                //     // (parseFloat(`${((code.frame.x + code.frame.height / 2) / (frame.width || 0)) * 100}`) /
                //     //     100) *
                //     // (SCREEN_HEIGHT - bottom) - offset
                //     y:
                //     ((code.frame.x + code.frame.height / 2) / (frame.width || 0)) *
                //     (SCREEN_HEIGHT - bottom) - offset
                // }
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
            // return {
            //     x: 100 - ((code.frame.y + code.frame.width / 2) / sharedFrame.value.height) * SCREEN_HEIGHT + 100,
            //     y: ((code.frame.x + code.frame.height / 2) / sharedFrame.value.width) * SCREEN_WIDTH + 100,
            // }

            console.log(points)

            _points.value = [...points]

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
