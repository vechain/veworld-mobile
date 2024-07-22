import React, { useMemo } from "react"
import Animated, { AnimatedProps, SharedValue, useAnimatedProps } from "react-native-reanimated"
import { TextInputProps, TextInput, TextProps as RNTextProps, KeyboardTypeOptions } from "react-native"
import { PlatformUtils } from "~Utils"

// base animated text component using a TextInput
// forked from https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
Animated.addWhitelistedNativeProps({ text: true })

interface TextProps extends Omit<TextInputProps, "value" | "style"> {
    text: SharedValue<string>
    style?: AnimatedProps<RNTextProps>["style"]
}

export const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)
export const BaseAnimatedText = (props: TextProps): JSX.Element => {
    const { style, text, ...rest } = props
    const animatedProps = useAnimatedProps(() => {
        return {
            text: text.value,
            // Here we use any because the text prop is not available in the type
        } as any
    })

    const setInputParams = useMemo(() => {
        if (PlatformUtils.isAndroid()) {
            return {
                keyboardType: "email-address" as KeyboardTypeOptions,
                autoCorrect: false,
            }
        } else {
            return {
                keyboardType: undefined,
                autoCorrect: undefined,
            }
        }
    }, [])

    return (
        <AnimatedTextInput
            // workarounds for android crashing when using the keyboard
            keyboardType={setInputParams.keyboardType}
            autoCorrect={setInputParams.autoCorrect}
            style={[style || undefined]}
            underlineColorAndroid="transparent"
            value={text.value}
            {...rest}
            {...{ animatedProps }}
        />
    )
}
// end of forked from https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
