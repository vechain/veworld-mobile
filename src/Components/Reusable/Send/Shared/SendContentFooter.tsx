import React, { ComponentProps } from "react"
import { StyleSheet } from "react-native"
import Animated, { FadeInLeft, FadeOutLeft, LinearTransition } from "react-native-reanimated"
import { BaseButton, BaseView, BaseViewProps, useSendContext } from "~Components"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))
const AnimatedBaseButton = Animated.createAnimatedComponent(wrapFunctionComponent(BaseButton))

type ButtonProps = Omit<ComponentProps<typeof AnimatedBaseButton>, "flex" | "variant">

const SendContentFooter = ({ children, style, ...props }: BaseViewProps) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <AnimatedBaseView
            flexDirection="row"
            gap={16}
            layout={LinearTransition}
            style={[styles.root, style]}
            {...props}>
            {children}
        </AnimatedBaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        root: {
            marginTop: 16,
        },
    })

const SendContentFooterBack = ({ children, ...props }: Omit<ButtonProps, "action">) => {
    const { LL } = useI18nContext()
    const { goToPrevious } = useSendContext()
    return (
        <AnimatedBaseButton
            variant="outline"
            flex={1}
            action={goToPrevious}
            layout={LinearTransition}
            entering={FadeInLeft.delay(50)}
            exiting={FadeOutLeft}
            {...props}>
            {children ?? LL.COMMON_LBL_BACK()}
        </AnimatedBaseButton>
    )
}

const SendContentFooterNext = ({ action, children, ...props }: ButtonProps) => {
    const { LL } = useI18nContext()

    return (
        <AnimatedBaseButton flex={1} action={action} layout={LinearTransition} {...props}>
            {children ?? LL.COMMON_LBL_NEXT()}
        </AnimatedBaseButton>
    )
}

SendContentFooter.Back = SendContentFooterBack
SendContentFooter.Next = SendContentFooterNext

export { SendContentFooter }
