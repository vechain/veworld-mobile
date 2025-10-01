import React, { useMemo } from "react"
import { StyleProp, StyleSheet, ViewStyle } from "react-native"
import { BaseButton, BaseIcon, BaseView } from "~Components/Base"
import { B3TR, COLORS, ColorThemeType, VET, VTHO } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { selectAllTokens, useAppSelector } from "~Storage/Redux"
import { isVechainToken } from "~Utils/TokenUtils/TokenUtils"
import { TokenImage } from "../TokenImage"

type Props = {
    token: string
    onPress: () => void
    style?: StyleProp<ViewStyle>
}
export const TokenSelector = ({ token, onPress, style }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const tokens = useAppSelector(selectAllTokens)

    const foundToken = useMemo(() => tokens.find(tk => tk.symbol === token), [token, tokens])

    const isCrossChainToken = useMemo(() => Boolean(foundToken?.crossChainProvider), [foundToken?.crossChainProvider])

    const icon = useMemo(() => {
        switch (token) {
            case VTHO.symbol:
                return VTHO.icon
            case VET.symbol:
                return VET.icon
            case B3TR.symbol:
                return B3TR.icon
            default:
                return foundToken?.icon
        }
    }, [foundToken?.icon, token])

    return (
        <BaseButton
            leftIcon={
                <BaseView style={styles.iconWrapper}>
                    <TokenImage
                        icon={icon}
                        isVechainToken={isVechainToken(token)}
                        isCrossChainToken={isCrossChainToken}
                        iconSize={16}
                    />
                </BaseView>
            }
            rightIcon={
                <BaseView style={styles.iconWrapper}>
                    <BaseIcon
                        name="icon-chevrons-up-down"
                        size={16}
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_600}
                    />
                </BaseView>
            }
            action={onPress}
            variant="solid"
            px={12}
            py={8}
            style={[styles.root, style]}
            textColor={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}
            numberOfLines={1}>
            {token}
        </BaseButton>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            borderColor: theme.isDark ? theme.colors.transparent : COLORS.GREY_200,
            borderWidth: theme.isDark ? 0 : 1,
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : COLORS.WHITE,
            justifyContent: "center",
        },
        iconWrapper: {
            marginHorizontal: 4,
        },
    })
