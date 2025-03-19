import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { RefObject } from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { B3TR, ColorThemeType } from "~Constants"
import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { VbdBalanceCard, VetBalanceCard } from "~Screens/Flows/App/AssetDetailScreen/Components"

type Props = {
    tokenWithInfo: TokenWithCompleteInfo
    isBalanceVisible: boolean
    isObserved: boolean
    openQRCodeSheet: () => void
    foundToken?: FungibleTokenWithBalance
    convertB3trBottomSheetRef?: RefObject<BottomSheetModal>
}

export const AssetBalanceCard = ({
    tokenWithInfo,
    isBalanceVisible,
    openQRCodeSheet,
    foundToken,
    isObserved,
    convertB3trBottomSheetRef,
}: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()

    return (
        <BaseView w={100}>
            <BaseText color={theme.colors.text} typographyFont="bodySemiBold">
                {LL.BD_YOUR_BALANCE()}
            </BaseText>

            <BaseSpacer height={12} />

            <BaseView w={100} style={styles.cardContainer}>
                {tokenWithInfo.symbol === B3TR.symbol ? (
                    <VbdBalanceCard
                        isBalanceVisible={isBalanceVisible}
                        openQRCodeSheet={openQRCodeSheet}
                        isObserved={isObserved}
                        convertB3trBottomSheetRef={convertB3trBottomSheetRef}
                    />
                ) : (
                    <VetBalanceCard
                        token={tokenWithInfo}
                        foundToken={foundToken}
                        isObserved={isObserved}
                        isBalanceVisible={isBalanceVisible}
                        openQRCodeSheet={openQRCodeSheet}
                    />
                )}
            </BaseView>
        </BaseView>
    )
}

const baseStyle = (theme: ColorThemeType) =>
    StyleSheet.create({
        cardContainer: {
            flexDirection: "column",
            borderRadius: 12,
            paddingVertical: 16,
            backgroundColor: theme.colors.assetDetailsCard.background,
        },
        nonVbdContainer: {
            paddingHorizontal: 16,
        },
    })
