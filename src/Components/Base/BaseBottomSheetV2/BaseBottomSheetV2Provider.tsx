import React, { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react"
import { runOnJS, SharedValue, useSharedValue, withSpring } from "react-native-reanimated"
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
    onDismiss: () => void
    onOpen: (data?: unknown) => void
    /**
     * Data passed through when opening the bottomsheet
     */
    data?: unknown
    /**
     * Snap points. If not specified it'll be just ["95%"]
     */
    snapPoints: (`${number}%` | number)[]
    /**
     * Current index for the snap point calculation
     */
    snapIndex: number
    /**
     * Set the snap index based on the `snapPoints` array
     * @param newValue New index
     */
    setSnapIndex: (newValue: number) => void
    /**
     * Indicate that the BottomSheet doesn't have any snap point provided
     */
    dynamicHeight: boolean
}

const BaseBottomSheetV2Context = createContext<BaseBottomSheetV2ContextProps | undefined>(undefined)

type Props = PropsWithChildren<{
    onDismiss?: () => void
    /**
     * Call `onDismiss` when closing the bottomsheet programmatically
     * @default true
     */
    dismissOnClose?: boolean
    snapPoints?: BaseBottomSheetV2ContextProps["snapPoints"]
}>

export const BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION = 16

export const BaseBottomSheetV2Provider = ({
    children,
    dismissOnClose = true,
    onDismiss: _onDismiss,
    snapPoints: _snapPoints,
}: Props) => {
    const height = useSharedValue(SCREEN_HEIGHT)
    const translateY = useSharedValue(SCREEN_HEIGHT)
    const scrollY = useSharedValue(0)
    const openSV = useSharedValue(false)
    const [data, setData] = useState<unknown>()
    const [snapIndex, _setSnapIndex] = useState(0)

    const closeBs = useCallback(() => {
        translateY.value = withSpring(height.get(), { mass: 4, damping: 120, stiffness: 900 }, () => {
            openSV.value = false
            runOnJS(setData)(undefined)
        })
    }, [height, openSV, translateY])

    const onClose = useCallback(() => {
        closeBs()
        if (dismissOnClose) _onDismiss?.()
    }, [closeBs, dismissOnClose, _onDismiss])

    const onOpen = useCallback(
        (_data?: unknown) => {
            translateY.value = withSpring(BASE_BOTTOMSHEET_V2_DEFAULT_TRANSLATION, {
                mass: 4,
                damping: 120,
                stiffness: 900,
            })
            openSV.value = true
            setData(_data)
        },
        [openSV, translateY],
    )

    const onDismiss = useCallback(() => {
        closeBs()
        _onDismiss?.()
    }, [_onDismiss, closeBs])

    const snapPoints = useMemo(() => _snapPoints ?? (["95%"] as `${number}%`[]), [_snapPoints])

    const setSnapIndex = useCallback(
        (newValue: number) => {
            "worklet"
            if (newValue < 0 || newValue >= snapPoints.length) return
            runOnJS(_setSnapIndex)(newValue)
        },
        [snapPoints.length],
    )

    const ctx: BaseBottomSheetV2ContextProps = useMemo(
        () => ({
            translateY,
            height,
            scrollY,
            open: openSV,
            onClose,
            onOpen,
            onDismiss,
            data,
            snapPoints,
            snapIndex,
            setSnapIndex,
            dynamicHeight: !_snapPoints,
        }),
        [
            _snapPoints,
            data,
            height,
            onClose,
            onDismiss,
            onOpen,
            openSV,
            scrollY,
            setSnapIndex,
            snapIndex,
            snapPoints,
            translateY,
        ],
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
