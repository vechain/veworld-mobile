import React, { useMemo } from "react"
import { BaseSkeleton, BaseText, BaseTextProps, BaseView, BaseViewProps } from "~Components"
import { COLORS } from "~Constants"
import { useCombineFiatBalances, useTheme } from "~Hooks"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { formatWithLessThan } from "~Utils/StandardizedFormatting"
import { BigNutils } from "~Utils"

type FiatBalanceProps = {
    isVisible?: boolean
    isLoading?: boolean
    balances: string[]
    prefix?: string
    typographyFont?: BaseTextProps["typographyFont"]
    color?: BaseTextProps["color"]
    /**
     * Height of the skeleton.
     * @default 38.5
     */
    skeletonHeight?: number
    /**
     * Width of the skeleton.
     * @default 140
     */
    skeletonWidth?: number
    /**
     * Bone color of the skeleton. {@link BaseSkeleton}
     * Dark:
     * @default COLORS.LIME_GREEN
     * Light:
     * @default COLORS.DARK_PURPLE
     */
    skeletonBoneColor?: string
    /**
     * Highlight color of the skeleton: {@link BaseSkeleton}
     * @default COLORS.LIGHT_PURPLE
     */
    skeletonHighlightColor?: string
} & BaseViewProps

export const FiatBalance: React.FC<FiatBalanceProps> = (props: FiatBalanceProps) => {
    const {
        isLoading = false,
        isVisible = true,
        balances = [],
        typographyFont,
        color,
        prefix = "",
        skeletonHeight,
        skeletonWidth,
        skeletonBoneColor,
        skeletonHighlightColor,
        ...baseviewProps
    } = props
    const theme = useTheme()

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(() => combineFiatBalances(balances), [balances, combineFiatBalances])

    const { formatFiat } = useFormatFiat()
    const renderBalance = useMemo(() => {
        if (!isVisible) {
            return formatFiat({ amount, cover: true })
        }

        const isZero = BigNutils(amount).isZero
        if (isZero) {
            return formatFiat({ amount: 0, cover: false })
        }

        if (areAlmostZero) {
            return formatWithLessThan(amount)
        }

        return formatFiat({ amount, cover: false })
    }, [formatFiat, amount, isVisible, areAlmostZero])

    return isLoading ? (
        <BaseView testID="fiat-balance-skeleton" pt={4} {...baseviewProps}>
            <BaseSkeleton
                animationDirection="horizontalLeft"
                boneColor={skeletonBoneColor ?? (theme.isDark ? COLORS.LIME_GREEN : COLORS.DARK_PURPLE)}
                highlightColor={skeletonHighlightColor ?? COLORS.LIGHT_PURPLE}
                height={skeletonHeight ?? 38.5}
                width={skeletonWidth ?? 140}
            />
        </BaseView>
    ) : (
        <BaseView testID="fiat-balance" {...baseviewProps}>
            <BaseView flexDirection="row">
                <BaseText typographyFont={typographyFont} color={color}>
                    {prefix}
                    {renderBalance}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
