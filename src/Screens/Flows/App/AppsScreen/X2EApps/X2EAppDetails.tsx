import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import Animated, { LinearTransition, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { BaseIcon, BaseText } from "~Components"
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
        <BaseView flexDirection={"row"} justifyContent={"space-between"}>
            <BaseView flexDirection="column">
                <BaseText typographyFont={"bodySemiBold"}>{"4.5"}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{"Rating"}</BaseText>
            </BaseView>
            <BaseView flexDirection="column">
                <BaseText typographyFont={"bodySemiBold"}>{"1.1M"}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{"Users"}</BaseText>
            </BaseView>
            <BaseView flexDirection="column">
                <BaseText typographyFont={"bodySemiBold"}>{"10.8 T"}</BaseText>
                <BaseText typographyFont={"captionMedium"}>{"CO2 saved"}</BaseText>
            </BaseView>
        </BaseView>
    )
}

const Description = ({ children }: { children: string }) => {
    const theme = useTheme()
    return (
        <AnimatedBaseView layout={LinearTransition.duration(300)} flexDirection="row" gap={8} alignItems="flex-start">
            <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="captionRegular">
                {children}
            </BaseText>
        </AnimatedBaseView>
    )
}

const Container = ({ children }: PropsWithChildren) => {
    return (
        <AnimatedBaseView layout={LinearTransition.duration(300)} flexDirection="column" ml={8} gap={8}>
            {children}
        </AnimatedBaseView>
    )
}

const NotVerifiedWarning = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    return (
        <BaseView
            flexDirection="row"
            w={100}
            bg={theme.colors.warningAlert.background}
            gap={12}
            py={8}
            px={12}
            borderRadius={6}
            mt={8}
            testID="DAPP_DETAILS_NOT_VERIFIED_WARNING">
            <BaseIcon size={16} color={theme.colors.warningAlert.icon} name="icon-alert-triangle" />
            <BaseText typographyFont="body" color={theme.colors.warningAlert.text}>
                {LL.NOT_VERIFIED_DAPP()}
            </BaseText>
        </BaseView>
    )
}

type Props = PropsWithChildren<{ show: boolean }>

const X2EAppDetails = ({ children, show }: Props) => {
    const { styles } = useThemedStyles(baseStyles)
    const animatedStyles = useAnimatedStyle(() => {
        return {
            opacity: show ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 300 }),
            height: show ? "auto" : 0,
            padding: show ? withTiming(16, { duration: 300 }) : withTiming(0, { duration: 300 }),
        }
    }, [show])
    return (
        <AnimatedBaseView
            layout={LinearTransition.duration(300)}
            style={[styles.detailsContainer, animatedStyles]}
            flexDirection="column"
            borderRadius={8}>
            {children}
        </AnimatedBaseView>
    )
}

X2EAppDetails.Title = Title
X2EAppDetails.Description = Description
X2EAppDetails.Stats = Stats
X2EAppDetails.Container = Container
X2EAppDetails.NotVerifiedWarning = NotVerifiedWarning

export { X2EAppDetails }

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        detailsContainer: {
            backgroundColor: theme.colors.editSpeedBs.result.background,
            borderColor: theme.colors.editSpeedBs.result.border,
            borderWidth: 1,
            padding: 16,
            gap: 12,
        },
    })
