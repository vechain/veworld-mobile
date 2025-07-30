import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseButton, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { wrapFunctionComponent } from "~Utils/ReanimatedUtils/Reanimated"

const AnimatedBaseView = Animated.createAnimatedComponent(wrapFunctionComponent(BaseView))

const Title = ({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="subSubTitleSemiBold" color={theme.colors.assetDetailsCard.title}>
            {children}
        </BaseText>
    )
}

const Stats = () => {
    return (
        <BaseView flexDirection={"row"} justifyContent={"space-between"} py={4} px={8}>
            <BaseView flexDirection="column" gap={2}>
                <BaseText typographyFont={"bodySemiBold"}>{"4.5"}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{"Rating"}</BaseText>
            </BaseView>
            <BaseView flexDirection="column" gap={2}>
                <BaseText typographyFont={"bodySemiBold"}>{"1.1M"}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{"Users"}</BaseText>
            </BaseView>
            <BaseView flexDirection="column" gap={2}>
                <BaseText typographyFont={"bodySemiBold"}>{"10.8 T"}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{"CO2 saved"}</BaseText>
            </BaseView>
        </BaseView>
    )
}

const Actions = () => {
    const { LL } = useI18nContext()
    return (
        <AnimatedBaseView layout={LinearTransition.duration(300)} flexDirection="column" gap={16} px={0}>
            <BaseButton action={() => {}}>{LL.BTN_ADD_TO_FAVORITES()}</BaseButton>
            <BaseButton action={() => {}}>{LL.BTN_OPEN()}</BaseButton>
        </AnimatedBaseView>
    )
}

const Description = ({ children }: { children: string }) => {
    const theme = useTheme()
    return (
        <AnimatedBaseView layout={LinearTransition.duration(100)} flexDirection="row" gap={8} alignItems="flex-start">
            <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="bodyMedium">
                {children}
            </BaseText>
        </AnimatedBaseView>
    )
}

const Container = ({ children }: PropsWithChildren) => {
    return (
        <AnimatedBaseView layout={LinearTransition.duration(100)} flexDirection="column" gap={8} p={24}>
            {children}
        </AnimatedBaseView>
    )
}

type Props = PropsWithChildren<{ show: boolean }>

const X2EAppDetails = ({ children, show }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: show ? withTiming(1, { duration: 100 }) : withTiming(0, { duration: 0 }),
            height: show ? "auto" : 0,
        }
    }, [show])
    return (
        <AnimatedBaseView
            layout={LinearTransition.duration(300)}
            style={[styles.detailsContainer, animatedStyles]}
            flexDirection="column"
            borderRadius={24}>
            {children}
        </AnimatedBaseView>
    )
}

X2EAppDetails.Title = Title
X2EAppDetails.Description = Description
X2EAppDetails.Stats = Stats
X2EAppDetails.Actions = Actions
X2EAppDetails.Container = Container

export { X2EAppDetails }

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        detailsContainer: {
            backgroundColor: theme.colors.editSpeedBs.result.background,
            borderColor: theme.colors.editSpeedBs.result.border,
            borderWidth: 1,
            gap: 12,
        },
    })
