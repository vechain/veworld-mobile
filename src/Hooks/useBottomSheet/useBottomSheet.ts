import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import { useCallback, useRef } from "react"

export const useBottomSheet = () => {
    const ref = useRef<BottomSheet>(null)
    const onOpen = useCallback(() => ref.current?.expand(), [ref])

    const onClose = useCallback(() => ref.current?.close(), [ref])

    return { ref, onOpen, onClose }
}

export const useBottomSheetModal = () => {
    const ref = useRef<BottomSheetModal>(null)

    const onOpen = useCallback(() => ref.current?.present(), [ref])

    const openWithDelay = useCallback(
        (delay: number) => {
            setTimeout(() => {
                ref.current?.present()
            }, delay)
        },
        [ref],
    )

    const onClose = useCallback(() => ref.current?.close(), [ref])

    return { ref, onOpen, onClose, openWithDelay }
}
