import React from "react"
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseIconProps } from "~Components"
import { useTheme } from "~Hooks"
import { ReanimatedUtils } from "~Utils"
import { useBaseAccordionV2 } from "./BaseAccordionV2Context"

const AnimatedBaseIcon = Animated.createAnimatedComponent(ReanimatedUtils.wrapFunctionComponent(BaseIcon))

export const BaseAccordionV2HeaderIcon = ({ style, ...props }: Omit<BaseIconProps, "name">) => {
    const theme = useTheme()
    const { open } = useBaseAccordionV2()

    const derivedRotation = useDerivedValue(() =>
        withTiming(180 * Number(open), {
            duration: 500,
        }),
    )
    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${derivedRotation.value}deg` }],
    }))
    return (
        <AnimatedBaseIcon
            name="icon-chevron-down"
            size={16}
            color={theme.colors.text}
            style={[iconStyle, style]}
            {...props}
        />
    )
}
