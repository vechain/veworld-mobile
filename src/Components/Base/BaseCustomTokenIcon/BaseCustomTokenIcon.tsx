import React, { useMemo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { BaseText, BaseView } from "~Components"
import { ColorUtils } from "~Utils"
import { COLORS } from "~Constants"

type Props = {
    tokenAddress: string
    tokenSymbol: string
    style?: StyleProp<ViewStyle>
}

/**
 * `BaseCustomTokenIcon` is a React component that provides a customizable icon for tokens.
 * The color of the icon is dynamically generated based on the token address, and it displays
 * an abbreviated version of the token symbol.
 *
 * Props:
 * @prop {string} tokenAddress - The address of the token. Used to generate a unique color for the token icon.
 * @prop {string} tokenSymbol - The symbol of the token. Displayed on the icon.
 * @prop {StyleProp<ViewStyle>} [style] - Optional styling to be applied to the icon component.
 *
 * Example usage:
 * ```
 * <BaseCustomTokenIcon tokenAddress="0x1234...5678" tokenSymbol="USDT" style={{ width: 40, height: 40 }} />
 * ```
 */
export const BaseCustomTokenIcon: React.FC<Props> = ({
    tokenAddress,
    tokenSymbol,
    style,
}) => {
    const [iconColor, isColorLight] = useMemo(() => {
        return ColorUtils.generateColor(tokenAddress)
    }, [tokenAddress])

    const shortenedTokenSymbol = useMemo(() => {
        return tokenSymbol.length > 4
            ? tokenSymbol.substring(0, 4).toUpperCase()
            : tokenSymbol.toUpperCase()
    }, [tokenSymbol])

    return (
        <BaseView bg={iconColor} style={style}>
            <BaseText
                color={isColorLight ? COLORS.DARK_PURPLE : COLORS.WHITE}
                fontSize={shortenedTokenSymbol.length > 3 ? 10 : 14}
                fontWeight="bold">
                {shortenedTokenSymbol}
            </BaseText>
        </BaseView>
    )
}
