import React, { ComponentProps } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition } from "react-native-reanimated"
import { useSendContext } from "~Components"
import { BaseButton, BaseView, BaseViewProps } from "~Components/Base"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import ReanimatedUtils from "~Utils/ReanimatedUtils"

const AnimatedBaseView = Animated.createAnimatedComponent(ReanimatedUtils.wrapFunctionComponent(BaseView))
const AnimatedBaseButton = Animated.createAnimatedComponent(ReanimatedUtils.wrapFunctionComponent(BaseButton))

type ButtonProps = Omit<ComponentProps<typeof BaseButton>, "flex" | "variant">

const SendContentFooter = ({ children, style, ...props }: BaseViewProps) => {
    const { styles } = useThemedStyles(baseStyles)
    return (
        <AnimatedBaseView
            flexDirection="row"
            gap={16}
            style={[styles.root, style]}
            layout={LinearTransition}
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
        <AnimatedBaseButton variant="outline" flex={1} action={goToPrevious} layout={LinearTransition} {...props}>
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
