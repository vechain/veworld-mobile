import React from "react"
import Animated, { useAnimatedProps } from "react-native-reanimated"
import {
    TextInputProps,
    TextInput,
    TextProps as RNTextProps,
} from "react-native"

// base animated text component using a TextInput
// forked from https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
Animated.addWhitelistedNativeProps({ text: true })

interface TextProps extends Omit<TextInputProps, "value" | "style"> {
    text: Animated.SharedValue<string>
    style?: Animated.AnimateProps<RNTextProps>["style"]
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

    return (
        <AnimatedTextInput
            editable={false}
            style={[style || undefined]}
            underlineColorAndroid="transparent"
            value={text.value}
            {...rest}
            {...{ animatedProps }}
        />
    )
}
// end of forked from https://github.com/wcandillon/react-native-redash/blob/master/src/ReText.tsx
