import { Image, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer } from "~Components"
import { COLORS } from "~Constants"
import { PlaceholderSVG } from "~Assets"
import { useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { FungibleTokenWithBalance } from "~Model"

type Props = {
    tokenWithBalance: FungibleTokenWithBalance
    isEdit: boolean
}

export const TokenCard = memo(({ tokenWithBalance, isEdit }: Props) => {
    const theme = useTheme()
    const styles = baseStyles(isEdit)
    const icon = tokenWithBalance.icon
    const tokenValueLabelColor = theme.isDark
        ? COLORS.WHITE_DISABLED
        : COLORS.DARK_PURPLE_DISABLED
    const tokenBalanceRaw = FormattingUtils.scaleNumberDown(
        tokenWithBalance.balance.balance,
        tokenWithBalance.decimals,
        4,
    )
    const tokenBalance = FormattingUtils.humanNumber(
        tokenBalanceRaw,
        tokenBalanceRaw,
    )
    return (
        <BaseView style={styles.innerRow}>
            <BaseCard
                style={[
                    styles.imageContainer,
                    { backgroundColor: COLORS.WHITE },
                ]}
                containerStyle={styles.imageShadow}>
                {icon ? (
                    <Image source={{ uri: icon }} style={styles.image} />
                ) : (
                    <PlaceholderSVG />
                )}
            </BaseCard>
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
                    <BaseText
                        typographyFont="bodyMedium"
                        color={tokenValueLabelColor}>
                        {tokenBalance}{" "}
                    </BaseText>
                    <BaseText
                        typographyFont="captionRegular"
                        color={tokenValueLabelColor}>
                        {tokenWithBalance.symbol}
                    </BaseText>
                </BaseView>
            </BaseView>
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
    })
