import React, { memo, useCallback, forwardRef } from "react"

import { BaseTextInput, BaseTextInputProps } from "../BaseTextInput"
import { useBottomSheetInternal } from "@gorhom/bottom-sheet"
import { BottomSheetTextInputProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput"
import { TextInput } from "react-native-gesture-handler"
import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native"
import { runOnUI } from "react-native-reanimated"

const BottomSheetTextInputComponent = forwardRef<TextInput, BottomSheetTextInputProps & BaseTextInputProps>(
    ({ onFocus, onBlur, ...rest }, ref) => {
        const bottomSheetInternal = useBottomSheetInternal()

        const handleOnFocus = useCallback(
            (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
                runOnUI(() => {
                    if (!bottomSheetInternal) {
                        return
                    }

                    bottomSheetInternal.shouldHandleKeyboardEvents.value = true
                })()
                onFocus?.(e)
            },
            [onFocus, bottomSheetInternal],
        )
        const handleOnBlur = useCallback(
            (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
                runOnUI(() => {
                    if (!bottomSheetInternal) {
                        return
                    }

                    bottomSheetInternal.shouldHandleKeyboardEvents.value = false
                })()
                onBlur?.(e)
            },
            [bottomSheetInternal, onBlur],
        )

        return <BaseTextInput ref={ref} onFocus={handleOnFocus} onBlur={handleOnBlur} {...rest} />
    },
)

export const BaseBottomSheetTextInput = memo(BottomSheetTextInputComponent)
