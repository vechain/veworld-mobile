import { useCallback } from "react"
import { SharedValue } from "react-native-reanimated"
import { Code } from "react-native-vision-camera"

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
    onScan: () => void
}

export const useQrScanDetection = ({ offsetX, offsetY, size, onScan }: Args) => {
    return useCallback(
        (codes: Code[]) => {
            if (codes.length === 0) return
            //We'll read just the first code
            const code = codes[0]
            if (!code.frame) return
            const points = [
                //Top left
                {
                    x: code.frame!.x - code.frame!.width / 2,
                    y: code.frame!.y + code.frame!.height / 5,
                },
                //Top right
                {
                    x: code.frame!.x + code.frame!.width,
                    y: code.frame!.y + code.frame!.height / 5,
                },
                //Bottom right
                {
                    x: code.frame!.x + code.frame!.width,
                    y: code.frame!.y + code.frame!.height * 1.5,
                },
                //Bottom left
                {
                    x: code.frame!.x - code.frame!.width / 2,
                    y: code.frame!.y + code.frame!.height * 1.5,
                },
            ]

            const biggerRect = {
                x: offsetX.value * 0.8,
                y: offsetY.value * 0.8,
                width: size + offsetX.value * 0.4,
                height: size + offsetY.value * 0.4,
            }

            //Outside of detection area
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
                onScan()
                return
            }
        },
        [offsetX.value, offsetY.value, onScan, size],
    )
}
