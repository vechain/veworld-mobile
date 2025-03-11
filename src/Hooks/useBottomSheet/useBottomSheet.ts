import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet"
import { RefObject, useCallback, useRef } from "react"

export const useBottomSheet = () => {
    const ref = useRef<BottomSheet>(null)
    const onOpen = useCallback(() => ref.current?.expand(), [ref])

    const onClose = useCallback(() => ref.current?.close(), [ref])

    return { ref, onOpen, onClose }
}

export const useBottomSheetRef = () => {
    const ref = useRef<BottomSheetModal>(null)
    return ref
}

type UseBottomSheetModalOpts = {
    externalRef?: RefObject<BottomSheetModal>
}

export const useBottomSheetModal = ({ externalRef }: UseBottomSheetModalOpts = {}) => {
    const ref = useRef<BottomSheetModal>(null)

    const onOpen = useCallback(
        () => (externalRef ? externalRef.current?.present() : ref.current?.present()),
        [externalRef],
    )

    const openWithDelay = useCallback(
        (delay: number) => {
            setTimeout(() => {
                externalRef ? externalRef.current?.present() : ref.current?.present()
            }, delay)
        },
        [externalRef],
    )

    const onClose = useCallback(
        () => (externalRef ? externalRef.current?.close() : ref.current?.close()),
        [externalRef],
    )

    return { ref: externalRef ?? ref, onOpen, onClose, openWithDelay }
}
