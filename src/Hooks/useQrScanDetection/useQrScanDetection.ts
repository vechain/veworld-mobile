import { BarcodeScanningResult } from "expo-camera"
import { useCallback } from "react"
import { SharedValue } from "react-native-reanimated"

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
    return useCallback(
        async ({ data, bounds }: BarcodeScanningResult) => {
            if (!data) return

            // expo-camera reports bounds in view coordinates, so no frame conversion is
            // needed — but it documents them as sometimes empty. A code we cannot place
            // is better scanned than silently dropped.
            if (!bounds?.size?.width || !bounds?.size?.height) return onScan(data)

            const centerX = bounds.origin.x + bounds.size.width / 2
            const centerY = bounds.origin.y + bounds.size.height / 2

            const detectionArea = {
                x: offsetX.value * 0.8,
                y: offsetY.value * 0.8,
                width: size + offsetX.value * 0.4,
                height: size + offsetY.value * 0.4,
            }

            const isInsideDetectionArea =
                centerX >= detectionArea.x &&
                centerX <= detectionArea.x + detectionArea.width &&
                centerY >= detectionArea.y &&
                centerY <= detectionArea.y + detectionArea.height

            if (isInsideDetectionArea) return onScan(data)
        },
        [offsetX, offsetY, size, onScan],
    )
}
