import React, { PropsWithChildren } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, ColorThemeType } from "~Constants"
import { useTheme, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { TokenUtils } from "~Utils"

const ValueContainer = ({ children }: PropsWithChildren) => {
    const { styles } = useThemedStyles(valueContainerStyles)
    return (
        <BaseView style={styles.root} borderRadius={12}>
            {children}
        </BaseView>
    )
}

const DollarValue = ({ value }: { value: string }) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    return (
        <BaseView flexDirection="row" justifyContent="space-between" py={12} px={16}>
            <BaseView flexDirection="row" gap={12}>
                <BaseIcon
                    borderRadius={99}
                    bg={theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.GREY_100}
                    name="icon-dollar-sign"
                    size={12}
                    p={6}
                    color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_600}
                />
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                    {LL.VALUE_TITLE()}
                </BaseText>
            </BaseView>

            <BaseText typographyFont="subSubTitleSemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                {value}
            </BaseText>
        </BaseView>
    )
}

const TokenValue = ({ value, token, border = true }: { value: string; token: FungibleToken; border?: boolean }) => {
    const { styles, theme } = useThemedStyles(tokenValueStyles)
    return (
        <BaseView flexDirection="row" justifyContent="space-between" py={12} px={16} style={border && styles.root}>
            <BaseView flexDirection="row" gap={12}>
                <TokenImage
                    icon={token.icon}
                    iconSize={24}
                    isCrossChainToken={!!token.crossChainProvider}
                    isVechainToken={TokenUtils.isVechainToken(token.symbol)}
                    rounded
                    symbol={token.symbol}
                />
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                    {token.symbol}
                </BaseText>
            </BaseView>

            <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.WHITE : COLORS.GREY_800}>
                {value}
            </BaseText>
        </BaseView>
    )
}

ValueContainer.DollarValue = DollarValue
ValueContainer.TokenValue = TokenValue

export { ValueContainer }

const valueContainerStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderWidth: 1,
            borderColor: theme.isDark ? "#4E4870" : COLORS.GREY_100,
            backgroundColor: theme.isDark ? COLORS.PURPLE_LABEL_10 : COLORS.WHITE,
        },
    })

const tokenValueStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderBottomWidth: 1,
            borderColor: theme.isDark ? "#4E4870" : COLORS.GREY_100,
        },
    })
