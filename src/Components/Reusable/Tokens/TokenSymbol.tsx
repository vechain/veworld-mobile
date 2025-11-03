import React, { PropsWithChildren } from "react"
import { BaseIcon, BaseText, BaseView } from "~Components/Base"
import { B3TR, COLORS, TFonts, VOT3 } from "~Constants"
import { useTheme } from "~Hooks"
import { FungibleToken } from "~Model"

type Props = PropsWithChildren<{
    token: FungibleToken
    /**
     * Typography to apply to the symbol
     * @default captionSemiBold
     */
    typographyFont?: TFonts
}>

export const TokenSymbol = ({ token, children, typographyFont = "captionSemiBold" }: Props) => {
    const theme = useTheme()
    switch (token.symbol) {
        case "B3TR":
            return (
                <BaseView flexDirection="row" gap={4} overflow="hidden">
                    <BaseText
                        typographyFont={typographyFont}
                        numberOfLines={1}
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                        testID="TOKEN_CARD_SYMBOL_1">
                        {B3TR.symbol}
                    </BaseText>
                    <BaseIcon
                        name="icon-refresh-cw"
                        size={12}
                        color={theme.isDark ? COLORS.GREY_500 : COLORS.GREY_400}
                    />
                    <BaseText
                        typographyFont={typographyFont}
                        numberOfLines={1}
                        color={theme.isDark ? COLORS.GREY_300 : COLORS.GREY_500}
                        testID="TOKEN_CARD_SYMBOL_2">
                        {VOT3.symbol}
                    </BaseText>

                    {children}
                </BaseView>
            )
        default:
            return (
                <BaseView flexDirection="row" gap={4}>
                    <BaseText
                        typographyFont={typographyFont}
                        color={theme.colors.activityCard.subtitleLight}
                        testID="TOKEN_CARD_SYMBOL">
                        {token.symbol}
                    </BaseText>
                    {children}
                </BaseView>
            )
    }
}
