import { Image, StyleSheet } from "react-native"
import React, { memo } from "react"
import { BaseText, BaseCard, BaseView, BaseSpacer } from "~Components"
import { COLORS } from "~Common/Theme"
import { PlaceholderSVG } from "~Assets"
import { useTheme } from "~Common"
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
    const tokenBalance = FormattingUtils.scaleNumberDown(
        tokenWithBalance.balance.balance,
        tokenWithBalance.decimals,
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
            <BaseView>
                <BaseText typographyFont="subTitleBold">
                    {tokenWithBalance.name}
                </BaseText>
                <BaseView flexDirection="row" alignItems="baseline">
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
            flexGrow: 1,
            paddingHorizontal: 12,
            paddingLeft: isEdit ? 44 : 12,
        },
    })
