import { Image, StyleSheet } from "react-native"
import React, { memo, useMemo } from "react"
import {
    BaseText,
    BaseCard,
    BaseView,
    BaseSpacer,
    BaseCustomTokenIcon,
    BaseSkeleton,
} from "~Components"
import { COLORS } from "~Constants"
import { useTheme } from "~Hooks"
import { BalanceUtils } from "~Utils"
import { FungibleTokenWithBalance } from "~Model"
import { selectIsTokensOwnedLoading, useAppSelector } from "~Storage/Redux"
import { address } from "thor-devkit"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isEdit: boolean
    isBalanceVisible: boolean
}

export const TokenCard = memo(
    ({ tokenWithBalance, isEdit, isBalanceVisible }: Props) => {
        const theme = useTheme()

        const isTokensOwnedLoading = useAppSelector(selectIsTokensOwnedLoading)

        const styles = baseStyles(isEdit)

        const icon = tokenWithBalance.icon

        const tokenValueLabelColor = theme.isDark
            ? COLORS.WHITE_DISABLED
            : COLORS.DARK_PURPLE_DISABLED

        const tokenBalance = useMemo(
            () =>
                BalanceUtils.getTokenUnitBalance(
                    tokenWithBalance.balance.balance,
                    tokenWithBalance.decimals ?? 0,
                ),
            [tokenWithBalance.balance.balance, tokenWithBalance.decimals],
        )

        return (
            <BaseView style={styles.innerRow}>
                {icon && (
                    <BaseCard
                        style={[
                            styles.imageContainer,
                            { backgroundColor: COLORS.WHITE },
                        ]}
                        containerStyle={styles.imageShadow}>
                        <Image source={{ uri: icon }} style={styles.image} />
                    </BaseCard>
                )}
                {!icon && (
                    <BaseCustomTokenIcon
                        style={styles.icon}
                        tokenSymbol={tokenWithBalance.symbol}
                        tokenAddress={address.toChecksumed(
                            tokenWithBalance.address,
                        )}
                    />
                )}

                <BaseSpacer width={16} />
                <BaseView w={75}>
                    <BaseText
                        typographyFont="subTitleBold"
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {tokenWithBalance.name}
                    </BaseText>
                    <BaseView
                        flexDirection="row"
                        alignItems="baseline"
                        justifyContent="flex-start">
                        {isTokensOwnedLoading && isBalanceVisible ? (
                            <BaseView
                                w={100}
                                flexDirection="row"
                                alignItems="center"
                                py={2}>
                                <BaseSkeleton
                                    animationDirection="horizontalLeft"
                                    boneColor={theme.colors.skeletonBoneColor}
                                    highlightColor={
                                        theme.colors.skeletonHighlightColor
                                    }
                                    height={12}
                                    width={40}
                                />
                                <BaseText
                                    typographyFont="captionRegular"
                                    color={tokenValueLabelColor}
                                    pl={4}>
                                    {tokenWithBalance.symbol}
                                </BaseText>
                            </BaseView>
                        ) : (
                            <BaseView flexDirection="row" alignItems="center">
                                <BaseText
                                    typographyFont="bodyMedium"
                                    color={tokenValueLabelColor}>
                                    {isBalanceVisible ? tokenBalance : "••••"}{" "}
                                </BaseText>
                                <BaseText
                                    typographyFont="captionRegular"
                                    color={tokenValueLabelColor}>
                                    {tokenWithBalance.symbol}
                                </BaseText>
                            </BaseView>
                        )}
                    </BaseView>
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = (isEdit: boolean) =>
    StyleSheet.create({
        imageShadow: {
            width: "auto",
        },
        imageContainer: {
            borderRadius: 30,
            padding: 10,
        },
        image: { width: 20, height: 20 },
        innerRow: {
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
            // flexWrap: "wrap",
            // flexGrow: 1,
            paddingHorizontal: 12,
            paddingLeft: isEdit ? 44 : 12,
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
