import { Dimensions, StyleSheet, ViewProps } from "react-native"
import React, { memo } from "react"
import { TokenWithCompleteInfo } from "~Model"
import { BaseCard, BaseSpacer, BaseText, BaseView } from "~Components"
import { useThemedStyles } from "~Hooks"
import { CURRENCY, ColorThemeType } from "~Constants"
import { TokenImage } from "../TokenImage"

type OfficialTokenCardProps = {
    token: TokenWithCompleteInfo
    action: () => void
    selected?: boolean
    currency?: CURRENCY
    isPositive24hChange?: boolean
    change24h?: string
}

export const OfficialTokenCard = memo(
    ({
        token,
        style,
        action,
        selected,
        currency,
        isPositive24hChange,
        change24h,
    }: OfficialTokenCardProps & ViewProps) => {
        const { styles, theme } = useThemedStyles(baseStyles(selected))
        return (
            <BaseCard
                onPress={action}
                containerStyle={[styles.container, style]}>
                <BaseView flexDirection="row" justifyContent="space-between">
                    <TokenImage icon={token.icon} />
                    <BaseSpacer width={16} />
                    <BaseView flexDirection="column" flexGrow={1}>
                        <BaseText typographyFont="buttonPrimary">
                            {token.name}
                        </BaseText>
                        <BaseText typographyFont="captionRegular">
                            {token.symbol}
                        </BaseText>
                    </BaseView>

                    {change24h && currency && token.rate && (
                        <BaseView
                            flexDirection="column"
                            alignItems="flex-end"
                            flexGrow={1}>
                            <BaseView flexDirection="row" alignItems="baseline">
                                <BaseText typographyFont="subTitleBold">
                                    {token.rate?.toFixed(4)}{" "}
                                </BaseText>
                                <BaseText typographyFont="captionRegular">
                                    {currency}
                                </BaseText>
                            </BaseView>

                            <BaseText
                                typographyFont="captionBold"
                                color={
                                    isPositive24hChange
                                        ? theme.colors.success
                                        : theme.colors.danger
                                }>
                                {change24h}
                            </BaseText>
                        </BaseView>
                    )}
                </BaseView>
            </BaseCard>
        )
    },
)

const baseStyles = (selected?: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        imageShadow: {
            width: "auto",
        },
        container: {
            minWidth: Dimensions.get("window").width - 48,
            // width: "100%",
            marginVertical: 7,
            borderWidth: selected ? 1 : 0,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
    })
