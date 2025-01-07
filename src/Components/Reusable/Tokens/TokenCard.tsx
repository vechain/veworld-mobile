import { StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseView, BaseSpacer, BaseCustomTokenIcon, BaseSkeleton, BaseImage } from "~Components"
import { COLORS } from "~Constants"
import { useBalances, useTheme } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import FiatBalance from "~Screens/Flows/App/HomeScreen/Components/AccountCard/FiatBalance"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isBalanceVisible: boolean
}

export const TokenCard = memo(({ tokenWithBalance, isBalanceVisible }: Props) => {
    const theme = useTheme()

    const { data: exchangeRate } = useVechainStatsTokenInfo(tokenWithBalance.symbol.toLowerCase())

    const { fiatBalance } = useBalances({
        token: { ...tokenWithBalance },
        exchangeRate: parseFloat(exchangeRate ?? "0"),
    })

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const icon = tokenWithBalance.icon

    const tokenValueLabelColor = theme.isDark ? COLORS.PRIMARY_200 : COLORS.GREY_500

    const tokenBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(tokenWithBalance.balance.balance, tokenWithBalance.decimals ?? 0, 2),
        [tokenWithBalance.balance.balance, tokenWithBalance.decimals],
    )

    const isIlliquidToken = useMemo(() => tokenWithBalance.symbol === "VOT3", [tokenWithBalance])

    const showFiatBalance = useMemo(() => {
        const numericBalance = Number(fiatBalance)
        return !isIlliquidToken && numericBalance > 0
    }, [isIlliquidToken, fiatBalance])

    return (
        <BaseView style={styles.innerRow}>
            <BaseView flexDirection="row">
                {icon !== "" && (
                    <BaseView style={[styles.imageContainer]}>
                        <BaseImage source={{ uri: icon }} style={styles.image} />
                    </BaseView>
                )}
                {!icon && (
                    <BaseView style={[styles.imageContainer]}>
                        <BaseCustomTokenIcon style={styles.image} tokenSymbol={tokenWithBalance.symbol ?? ""} />
                    </BaseView>
                )}

                <BaseSpacer width={12} />
                <BaseView>
                    <BaseText typographyFont="captionSemiBold" numberOfLines={1} ellipsizeMode="tail">
                        {tokenWithBalance.symbol}
                    </BaseText>
                    <BaseView flexDirection="row" alignItems="baseline" justifyContent="flex-start">
                        {isTokensOwnedLoading && isBalanceVisible ? (
                            <BaseView w={100} flexDirection="row" alignItems="center">
                                <BaseSkeleton
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={theme.colors.skeletonHighlightColor}
                                    height={12}
                                    width={40}
                                />
                            </BaseView>
                        ) : (
                            <BaseView flexDirection="row" alignItems="center">
                                <BaseText typographyFont="captionRegular" color={tokenValueLabelColor}>
                                    {isBalanceVisible ? tokenBalance : "••••"}{" "}
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>

            {showFiatBalance && (
                <BaseView style={[styles.balancesContainer]}>
                    <FiatBalance
                        color={theme.colors.tokenCardText}
                        balances={[fiatBalance]}
                        typographyFont="captionRegular"
                        isVisible={isBalanceVisible}
                        isLoading={isTokensOwnedLoading}
                    />
                </BaseView>
            )}
        </BaseView>
    )
})

const styles = StyleSheet.create({
    imageContainer: {
        borderRadius: 30,
        padding: 9,
        backgroundColor: COLORS.GREY_50,
    },
    image: { width: 14, height: 14 },
    innerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexGrow: 1,
        width: "100%",
    },
    balancesContainer: {
        alignItems: "flex-end",
    },
    skeleton: {
        width: 40,
    },
})
