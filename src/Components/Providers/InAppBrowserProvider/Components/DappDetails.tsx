import React, { PropsWithChildren } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { BaseIcon, BaseText } from "~Components"
import { BaseView } from "~Components/Base/BaseView"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

const Title = ({ children }: PropsWithChildren) => {
    const theme = useTheme()
    return (
        <BaseText typographyFont="bodyMedium" color={theme.colors.assetDetailsCard.title}>
            {children}
        </BaseText>
    )
}

const CheckItem = ({ children }: { children: string }) => {
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" gap={8} alignItems="flex-start">
            <BaseIcon name="icon-check" color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_400} size={12} />
            <BaseText color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600} typographyFont="captionRegular">
                {children}
            </BaseText>
        </BaseView>
    )
}

const Container = ({ children }: PropsWithChildren) => {
    return (
        <BaseView flexDirection="column" ml={8} gap={8}>
            {children}
        </BaseView>
    )
}

const NotVerifiedWarning = () => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    return (
        <BaseView
            flexDirection="row"
            alignItems="center"
            bg={theme.colors.warningAlert.background}
            gap={12}
            py={8}
            px={12}
            borderRadius={6}
            mt={8}
            testID="DAPP_DETAILS_NOT_VERIFIED_WARNING">
            <BaseIcon size={16} color={theme.colors.warningAlert.icon} name="icon-alert-triangle" />
            <BaseText typographyFont="body" color={theme.colors.warningAlert.text} flex={1} flexDirection="row">
                {LL.NOT_VERIFIED_DAPP()}
            </BaseText>
        </BaseView>
    )
}

type Props = PropsWithChildren<{
    show: boolean
    style?: StyleProp<ViewStyle>
    /**
     * Skip the animated styles
     */
    noAnimation?: boolean
    testID?: string
}>

const DappDetails = ({ children, show, style, testID }: Props) => {
    const { styles } = useThemedStyles(baseStyles)

    const dynamicStyles = {
        height: show ? ("auto" as const) : 0,
        overflow: "hidden" as const,
        opacity: show ? 1 : 0,
        paddingVertical: show ? 16 : 0,
        borderWidth: show ? 1 : 0,
    }

    return (
        <BaseView style={[styles.detailsContainer, style, dynamicStyles]} flexDirection="column" testID={testID}>
            {children}
        </BaseView>
    )
}

DappDetails.Title = Title
DappDetails.CheckItem = CheckItem
DappDetails.Container = Container
DappDetails.NotVerifiedWarning = NotVerifiedWarning

export { DappDetails }

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        detailsContainer: {
            backgroundColor: theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.GREY_50,
            borderColor: theme.colors.editSpeedBs.result.border,
            paddingHorizontal: 16,
            gap: 12,
        },
    })
