import React, { useCallback, useMemo } from "react"
import { BaseSkeleton, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
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

    const isAlmostZero = useCallback((b: string) => b?.includes("<"), [])
    const areAlmostZero = useMemo(() => balances?.every(isAlmostZero), [balances, isAlmostZero])
    const preSum = useMemo(
        () => balances?.map(b => (isAlmostZero(b) ? 0 : Number(b)))?.reduce((sum, current) => sum + current, 0),
        [balances, isAlmostZero],
    )
    const amount = useMemo(() => (areAlmostZero ? 0.01 : preSum), [areAlmostZero, preSum])

    const isNAN = useMemo(() => Number.isNaN(amount), [amount])

    const { formatFiat } = useFormatFiat()
    const renderBalance = useMemo(
        () => formatFiat({ amount: isNAN ? 0 : amount, cover: !isVisible }),
        [formatFiat, isNAN, amount, isVisible],
    )

    return isLoading ? (
        <BaseView pt={4} {...baseviewProps}>
            <BaseSkeleton
                animationDirection="horizontalLeft"
                boneColor={theme.isDark ? COLORS.PURPLE : COLORS.DARK_PURPLE}
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
