import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo } from "react"
import { SharedValue, useSharedValue, withSpring } from "react-native-reanimated"
import { SCREEN_HEIGHT } from "~Constants"

type BaseBottomSheetV2ContextProps = {
    /**
     * TranslateY of the bottomsheet
     */
    translateY: SharedValue<number>
    /**
     * Content height
     */
    height: SharedValue<number>
    /**
     * ScrollY value needed for the scrollable container handling
     */
    scrollY: SharedValue<number>

    /**
     * True if open, false otherwise
     */
    open: SharedValue<boolean>

    onClose: () => void
    onOpen: (data?: unknown) => void
}

const BaseBottomSheetV2Context = createContext<BaseBottomSheetV2ContextProps | undefined>(undefined)

type Props = PropsWithChildren<{
    onDismiss?: () => void
}>

export const BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION = 16

export const BaseBottomSheetV2Provider = ({ children, onDismiss }: Props) => {
    const height = useSharedValue(SCREEN_HEIGHT)
    const translateY = useSharedValue(SCREEN_HEIGHT)
    const scrollY = useSharedValue(0)
    const openSV = useSharedValue(false)

    const onClose = useCallback(() => {
        translateY.value = withSpring(height.get(), { mass: 4, damping: 120, stiffness: 900 }, () => {
            openSV.value = false
        })
        onDismiss?.()
    }, [height, onDismiss, openSV, translateY])

    const onOpen = useCallback(() => {
        translateY.value = withSpring(BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION, {
            mass: 4,
            damping: 120,
            stiffness: 900,
        })
        openSV.value = true
    }, [openSV, translateY])

    const ctx = useMemo(
        () => ({ translateY, height, scrollY, open: openSV, onClose, onOpen }),
        [height, onClose, onOpen, openSV, scrollY, translateY],
    )

    return <BaseBottomSheetV2Context.Provider value={ctx}>{children}</BaseBottomSheetV2Context.Provider>
}

export const useBaseBottomSheetV2 = () => {
    const ctx = useContext(BaseBottomSheetV2Context)

    if (!ctx)
        throw new Error(
            "[BaseBottomSheetV2]: Invalid context. You need to be inside a BaseBottomSheetV2 to use this hook",
        )

    return ctx
}
