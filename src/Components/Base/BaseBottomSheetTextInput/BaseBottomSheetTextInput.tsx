import React, { memo, useCallback, useEffect, forwardRef, useImperativeHandle, useRef } from "react"

import { BaseTextInput, BaseTextInputProps } from "../BaseTextInput"
import { useBottomSheetInternal } from "@gorhom/bottom-sheet"
import { BottomSheetTextInputProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput"
import { TextInput } from "react-native-gesture-handler"
import { TextInput as RNTextInput, TextInputFocusEvent, TextInputInstance, findNodeHandle } from "react-native"

// Mirrors the library's BottomSheetTextInput; v5 tracks the focused input by node handle.
const BottomSheetTextInputComponent = forwardRef<TextInputInstance, BottomSheetTextInputProps & BaseTextInputProps>(
    ({ onFocus, onBlur, ...rest }, providedRef) => {
        const ref = useRef<TextInputInstance>(null)
        const { animatedKeyboardState, textInputNodesRef } = useBottomSheetInternal()

        const handleOnFocus = useCallback(
            (e: TextInputFocusEvent) => {
                animatedKeyboardState.set(state => ({ ...state, target: e.nativeEvent.target }))
                onFocus?.(e)
            },
            [onFocus, animatedKeyboardState],
        )

        const handleOnBlur = useCallback(
            (e: TextInputFocusEvent) => {
                const currentFocusedInput = findNodeHandle(RNTextInput.State.currentlyFocusedInput())
                const isOwnTarget = animatedKeyboardState.get().target === e.nativeEvent.target
                const movedToAnotherInput = currentFocusedInput && textInputNodesRef.current.has(currentFocusedInput)

                if (isOwnTarget && !movedToAnotherInput) {
                    animatedKeyboardState.set(state => ({ ...state, target: undefined }))
                }
                onBlur?.(e)
            },
            [onBlur, animatedKeyboardState, textInputNodesRef],
        )

        useEffect(() => {
            const node = findNodeHandle(ref.current)
            if (!node) return

            const nodes = textInputNodesRef.current
            nodes.add(node)

            return () => {
                if (animatedKeyboardState.get().target === node) {
                    animatedKeyboardState.set(state => ({ ...state, target: undefined }))
                }
                nodes.delete(node)
            }
        }, [textInputNodesRef, animatedKeyboardState])

        useImperativeHandle(providedRef, () => ref.current as TextInput, [])

        return <BaseTextInput ref={ref} onFocus={handleOnFocus} onBlur={handleOnBlur} {...rest} />
    },
)

export const BaseBottomSheetTextInput = memo(BottomSheetTextInputComponent)
BaseBottomSheetTextInput.displayName = "BaseBottomSheetTextInput"
