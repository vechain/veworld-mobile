import React, { useMemo } from "react"
import { BaseSkeleton, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components"
import { COLORS } from "~Constants"
import { useCombineFiatBalances, useTheme } from "~Hooks"
import { useFormatFiat } from "~Hooks/useFormatFiat"

type FiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
    balances: string[]
    prefix?: string
    typographyFont?: BaseTextProps["typographyFont"]
    color?: BaseTextProps["color"]
} & BaseViewProps

export const FiatBalance: React.FC<FiatBalanceProps> = (props: FiatBalanceProps) => {
    const {
        isLoading = false,
        isVisible = true,
        balances = [],
        typographyFont,
        color,
        prefix = "",
        ...baseviewProps
    } = props
    const theme = useTheme()

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(() => combineFiatBalances(balances), [balances, combineFiatBalances])

    const { formatFiat } = useFormatFiat()
    const renderBalance = useMemo(() => formatFiat({ amount, cover: !isVisible }), [formatFiat, amount, isVisible])

    return isLoading ? (
        <BaseView pt={4} {...baseviewProps}>
            <BaseSkeleton
                animationDirection="horizontalLeft"
                boneColor={theme.isDark ? COLORS.LIME_GREEN : COLORS.DARK_PURPLE}
                highlightColor={COLORS.LIGHT_PURPLE}
                height={38.5}
                width={140}
            />
        </BaseView>
    ) : (
        <BaseView {...baseviewProps}>
            <BaseView flexDirection="row">
                <BaseText typographyFont={typographyFont} color={color}>
                    {areAlmostZero && isVisible ? "< " : prefix}
                    {renderBalance}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
