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
    afterClose?: () => void
}

export const useBottomSheetModal = <TData>({ externalRef, afterClose }: UseBottomSheetModalOpts = {}) => {
    const ref = useRef<BottomSheetModal>(null)

    const onOpen = useCallback(
        (newData?: TData) => {
            if (externalRef) externalRef.current?.present(newData)
            else ref.current?.present(newData)
        },
        [externalRef],
    )

    const openWithDelay = useCallback(
        (delay: number) => {
            setTimeout(() => {
                if (externalRef) externalRef.current?.present()
                else ref.current?.present()
            }, delay)
        },
        [externalRef],
    )

    const onClose = useCallback(() => {
        if (externalRef) externalRef.current?.close()
        else ref.current?.close()
        if (afterClose) afterClose()
    }, [externalRef, afterClose])

    return { ref: externalRef ?? ref, onOpen, onClose, openWithDelay }
}
