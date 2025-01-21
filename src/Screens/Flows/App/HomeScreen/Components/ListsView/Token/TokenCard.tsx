import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import { BaseText, BaseView, BaseSpacer, BaseCustomTokenIcon, BaseSkeleton, FiatBalance } from "~Components"
import { COLORS } from "~Constants"
import { useBalances, useTheme } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { useVechainStatsTokenInfo } from "~Api/Coingecko"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenCard = memo(({ tokenWithBalance, isEdit, isBalanceVisible }: Props) => {
    const theme = useTheme()

    const { data: exchangeRate } = useVechainStatsTokenInfo(tokenWithBalance.symbol.toLowerCase())

    const { fiatBalance } = useBalances({
        token: { ...tokenWithBalance },
        exchangeRate: parseFloat(exchangeRate ?? "0"),
    })

    const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

    const styles = baseStyles(isEdit)

    const icon = tokenWithBalance.icon

    const tokenValueLabelColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

    const tokenBalance = useMemo(
        () => BalanceUtils.getTokenUnitBalance(tokenWithBalance.balance.balance, tokenWithBalance.decimals ?? 0, 2),
        [tokenWithBalance.balance.balance, tokenWithBalance.decimals],
    )

    const isIlliquidToken = useMemo(() => tokenWithBalance.symbol === "VOT3", [tokenWithBalance])

    return (
        <BaseView style={styles.innerRow}>
            <BaseView flexDirection="row">
                {icon !== "" && (
                    <BaseView style={styles.imageContainer}>
                        <Image source={{ uri: icon }} style={styles.image} />
                    </BaseView>
                )}
                {!icon && <BaseCustomTokenIcon style={styles.icon} tokenSymbol={tokenWithBalance.symbol ?? ""} />}

                <BaseSpacer width={16} />
                <BaseView>
                    <BaseText typographyFont="bodySemiBold" numberOfLines={1} ellipsizeMode="tail">
                        {tokenWithBalance.symbol}
                    </BaseText>
                    <BaseView flexDirection="row" alignItems="baseline" justifyContent="flex-start">
                        {isTokensOwnedLoading && isBalanceVisible ? (
                            <BaseView w={100} flexDirection="row" alignItems="center" py={2}>
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
                                <BaseText typographyFont="bodyMedium" color={tokenValueLabelColor}>
                                    {isBalanceVisible ? tokenBalance : "••••"}{" "}
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>

            {!isEdit && !isIlliquidToken && (
                <BaseView style={[styles.balancesContainer]}>
                    <FiatBalance
                        balances={[fiatBalance]}
                        typographyFont="bodySemiBold"
                        isVisible={isBalanceVisible}
                        isLoading={isTokensOwnedLoading}
                    />
                </BaseView>
            )}
        </BaseView>
    )
})

const baseStyles = (isEdit: boolean) =>
    StyleSheet.create({
        imageShadow: {
            width: "auto",
        },
        imageContainer: {
            borderRadius: 30,
            padding: 10,
            backgroundColor: COLORS.GREY_50,
        },
        image: { width: 20, height: 20 },
        innerRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            flexGrow: 1,
            paddingLeft: isEdit ? 0 : 12,
        },
        fiatBalance: {
            justifyContent: "flex-end",
        },
        balancesContainer: {
            alignItems: "flex-end",
        },
        skeleton: {
            width: 40,
        },
        icon: {
            width: 40,
            height: 40,
            borderRadius: 40 / 2,
            alignItems: "center",
            justifyContent: "center",
        },
    })
