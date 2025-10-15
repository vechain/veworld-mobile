import { useCallback } from "react"
import { PixelRatio } from "react-native"
import { SharedValue } from "react-native-reanimated"
import { Code, DrawableFrame, runAtTargetFps } from "react-native-vision-camera"

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
    points: SharedValue<{ d: string }[]>
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
    return useCallback(
        async (codes: Code[], frame: DrawableFrame) => {
            if (codes.length === 0) return
            if (codes[0].frame) {
                _codes.value = codes
                _frame.value = frame
                _setCodes(codes)
                _setFrame(frame)
                const codesFrame = codes[0].frame
                const topLeftX = codesFrame.x
                const topLeftY = codesFrame.y
                const topRightX = codesFrame.x + codesFrame.width
                const topRightY = codesFrame.y
                const bottomRightX = codesFrame.x + codesFrame.width
                const bottomRightY = codesFrame.y + codesFrame.height
                const bottomLeftX = codesFrame.x
                const bottomLeftY = codesFrame.y + codesFrame.height

                _points.value = [
                    {
                        d: `M${topLeftX + codesFrame.width / 3} ${topLeftY} H${topLeftX} V${
                            topLeftY + codesFrame.height / 3
                        }`,
                    },
                    {
                        d: `M${topRightX - codesFrame.width / 3} ${topRightY} H${topRightX} V${
                            topRightY + codesFrame.height / 3
                        }`,
                    },
                    {
                        d: `M${bottomRightX - codesFrame.width / 3} ${bottomRightY} H${bottomRightX} V${
                            bottomRightY - codesFrame.height / 3
                        }`,
                    },
                    {
                        d: `M${bottomLeftX + codesFrame.width / 3} ${bottomLeftY} H${bottomLeftX} V${
                            bottomLeftY - codesFrame.height / 3
                        }`,
                    },
                ]
            }

            const biggerRect = {
                x: offsetX.value * 0.8,
                y: offsetY.value * 0.8,
                width: size + offsetX.value * 0.4,
                height: size + offsetY.value * 0.4,
            }

            //Outside of detection area
            // if (
            //     points.every(point => {
            //         return (
            //             point.x >= biggerRect.x &&
            //             point.x <= biggerRect.x + biggerRect.width &&
            //             point.y >= biggerRect.y &&
            //             point.y <= biggerRect.y + biggerRect.height
            //         )
            //     })
            // ) {
            //     return onScan(code.value)
            // }
        },
        [_points, offsetX.value, offsetY.value, size, _setCodes, _setFrame],
    )
}
