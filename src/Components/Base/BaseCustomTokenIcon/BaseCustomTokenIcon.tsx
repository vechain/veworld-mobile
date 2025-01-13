import React, { useMemo } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { BaseText, BaseView } from "~Components"
import { COLORS } from "~Constants"

type Props = {
    tokenSymbol: string
    style?: StyleProp<ViewStyle>
    testID?: string
}

/**
 * `BaseCustomTokenIcon` is a React component that provides a customizable icon for tokens.
 * The color of the icon is dynamically generated based on the token address, and it displays
 * an abbreviated version of the token symbol.
 *
 * Props:
 * @prop {string} tokenSymbol - The symbol of the token. Displayed on the icon.
 * @prop {StyleProp<ViewStyle>} [style] - Optional styling to be applied to the icon component.
 * @prop {string} [testID] - Optional testID to be applied to the icon component.
 *
 * Example usage:
 * ```
 * <BaseCustomTokenIcon tokenAddress="0x1234...5678" tokenSymbol="USDT" style={{ width: 40, height: 40 }} />
 * ```
 */
export const BaseCustomTokenIcon: React.FC<Props> = ({ tokenSymbol, style, testID }) => {
    const shortenedTokenSymbol = useMemo(() => {
        return tokenSymbol.length > 4 ? tokenSymbol.substring(0, 4).toUpperCase() : tokenSymbol.toUpperCase()
    }, [tokenSymbol])

    return (
        <BaseView bg={COLORS.GREY_50} style={style} testID={testID}>
            <BaseText
                color={COLORS.DARK_PURPLE}
                fontSize={shortenedTokenSymbol.length > 3 ? 10 : 14}
                typographyFont="captionSemiBold">
                {shortenedTokenSymbol}
            </BaseText>
        </BaseView>
    )
}
