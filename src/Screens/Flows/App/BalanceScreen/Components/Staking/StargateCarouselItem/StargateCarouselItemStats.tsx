import React, { ComponentProps, PropsWithChildren, useMemo } from "react"
import { BaseText, BaseView } from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { COLORS, VET } from "~Constants"
import { useFormatFiat, useTheme } from "~Hooks"
import { BigNutils } from "~Utils"
import { formatDisplayNumber } from "~Utils/StandardizedFormatting"

const SimpleRowItem = ({
    label,
    value,
    testID,
    children,
}: PropsWithChildren<{ label: string; value: string; testID: string }>) => {
    const theme = useTheme()

    return (
        <BaseView flexDirection="row" justifyContent="space-between" alignItems="center" py={2} testID={testID}>
            <BaseText color={theme.colors.assetDetailsCard.text} typographyFont="captionMedium">
                {label}
            </BaseText>
            <BaseView gap={8} flexDirection="row">
                <BaseText
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_800}
                    typographyFont="captionMedium"
                    testID={`${testID}_VALUE`}>
                    {value}
                </BaseText>
                {children}
            </BaseView>
        </BaseView>
    )
}

const TokenRowItem = ({
    value,
    icon,
    ...props
}: Omit<ComponentProps<typeof SimpleRowItem>, "children"> & { icon: string }) => {
    const { formatLocale } = useFormatFiat()

    const formattedValue = useMemo(() => {
        const humanBalance = BigNutils(value).toHuman(VET.decimals).toString

        return formatDisplayNumber(humanBalance, { locale: formatLocale })
    }, [value, formatLocale])

    return (
        <SimpleRowItem value={formattedValue} {...props}>
            <TokenImage icon={icon} isVechainToken iconSize={16} rounded={true} />
        </SimpleRowItem>
    )
}

export const StargateCarouselItemStats = {
    Simple: SimpleRowItem,
    Token: TokenRowItem,
}
