import React, { memo, useCallback, forwardRef } from "react"

import { BaseTextInput, Props as BaseTextInputProps } from "../BaseTextInput"
import { useBottomSheetInternal } from "@gorhom/bottom-sheet"
import { BottomSheetTextInputProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput"
import { TextInput } from "react-native-gesture-handler"
import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native"
import { runOnUI } from "react-native-reanimated"

const BottomSheetTextInputComponent = forwardRef<
    TextInput,
    BottomSheetTextInputProps & BaseTextInputProps
>(({ onFocus, onBlur, ...rest }, ref) => {
    //#region hooks
    const { shouldHandleKeyboardEvents } = useBottomSheetInternal()
    //#endregion

    //#region callbacks
    const handleOnFocus = useCallback(
        (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            runOnUI(() => {
                shouldHandleKeyboardEvents.value = true
            })()
            onFocus?.(e)
        },
        [onFocus, shouldHandleKeyboardEvents],
    )
    const handleOnBlur = useCallback(
        (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            runOnUI(() => {
                shouldHandleKeyboardEvents.value = false
            })()
            onBlur?.(e)
        },
        [onBlur, shouldHandleKeyboardEvents],
    )
    //#endregion

    return (
        <BaseTextInput
            ref={ref}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            {...rest}
        />
    )
})

export const BaseBottomSheetTextInput = memo(BottomSheetTextInputComponent)
BaseBottomSheetTextInput.displayName = "BaseBottomSheetTextInput"
