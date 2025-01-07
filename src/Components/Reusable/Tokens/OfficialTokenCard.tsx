import { Dimensions, StyleSheet, ViewProps } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseCard, BaseText, BaseView } from "~Components"
import { useTheme, useThemedStyles, TokenWithCompleteInfo, useBalances } from "~Hooks"
import { ColorThemeType } from "~Constants"
import { TokenImage } from "../TokenImage"
import { BigNutils } from "~Utils"
import { useI18nContext } from "~i18n"
import FiatBalance from "~Screens/Flows/App/HomeScreen/Components/AccountCard/FiatBalance"
import { selectBalanceVisible, useAppSelector } from "~Storage/Redux"
import { FungibleToken } from "~Model"

type OfficialTokenCardProps = {
    token: FungibleToken
    tokenWithInfo?: Partial<TokenWithCompleteInfo>
    action: () => void
    iconHeight: number
    iconWidth: number
    selected?: boolean
}

export const OfficialTokenCard = memo(
    ({
        token,
        tokenWithInfo = {},
        style,
        action,
        iconHeight,
        iconWidth,
        selected,
    }: OfficialTokenCardProps & ViewProps) => {
        const { styles } = useThemedStyles(baseStyles(selected))
        const theme = useTheme()
        const { LL } = useI18nContext()

        const isBalanceVisible = useAppSelector(selectBalanceVisible)

        const { tokenInfo } = tokenWithInfo
        const isPositive24hChange = (tokenInfo?.market_data?.price_change_percentage_24h ?? 0) >= 0

        const change24h =
            (isPositive24hChange ? "+" : "") +
            BigNutils(tokenInfo?.market_data?.price_change_percentage_24h ?? 0)
                .toHuman(0)
                .decimals(2).toString +
            "%"

        const { tokenUnitBalance } = useBalances({ token, exchangeRate: tokenWithInfo.exchangeRate })

        const unitBalance = useMemo(
            () => tokenWithInfo.tokenUnitBalance ?? tokenUnitBalance,
            [tokenWithInfo.tokenUnitBalance, tokenUnitBalance],
        )
        const symbol = useMemo(() => tokenWithInfo.symbol ?? token?.symbol, [tokenWithInfo.symbol, token?.symbol])

        return (
            <BaseCard onPress={action} containerStyle={[styles.container, style]} testID={symbol}>
                <BaseView flexDirection="row" justifyContent="space-between">
                    <BaseView w={14}>
                        <TokenImage icon={token.icon} height={iconHeight} width={iconWidth} symbol={token.symbol} />
                    </BaseView>
                    <BaseView w={42}>
                        <BaseText typographyFont="buttonPrimary" ellipsizeMode="tail" numberOfLines={1}>
                            {token.name}
                        </BaseText>

                        {tokenWithInfo.fiatBalance && (
                            <BaseView flexDirection="row">
                                <BaseText
                                    typographyFont="captionBold"
                                    color={isPositive24hChange ? theme.colors.success : theme.colors.danger}>
                                    {change24h}
                                </BaseText>
                                <BaseText typographyFont="smallCaption" mx={2} mt={4}>
                                    ({LL.COMMON_24H()})
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>

                    {Boolean(change24h) && (
                        <BaseView alignItems="flex-end" w={42}>
                            {tokenWithInfo.fiatBalance && (
                                <FiatBalance
                                    typographyFont={"buttonPrimary"}
                                    color={theme.colors.text}
                                    balances={[tokenWithInfo.fiatBalance]}
                                    isVisible={isBalanceVisible}
                                />
                            )}
                            <BaseText typographyFont="captionRegular">
                                {isBalanceVisible ? unitBalance : "•••••"} {symbol}
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
        container: {
            minWidth: Dimensions.get("window").width - 48,
            marginVertical: 7,
            borderWidth: selected ? 1 : 0,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
    })
