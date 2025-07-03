import { BottomSheetModal } from "@gorhom/bottom-sheet"
import React, { RefObject, useCallback } from "react"
import { StyleSheet } from "react-native"
import { BaseSpacer, BaseText, BaseView } from "~Components"
import { B3TR, ColorThemeType } from "~Constants"
import { TokenWithCompleteInfo, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { VbdBalanceCard, VetBalanceCard } from "~Screens/Flows/App/AssetDetailScreen/Components"
import { BridgeTokenBalanceCard } from "./BridgeTokenBalanceCard"
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

    const renderBalanceCard = useCallback(() => {
        if (tokenWithInfo.symbol === B3TR.symbol) {
            return (
                <VbdBalanceCard
                    isBalanceVisible={isBalanceVisible}
                    openQRCodeSheet={openQRCodeSheet}
                    isObserved={isObserved}
                    convertB3trBottomSheetRef={convertB3trBottomSheetRef}
                />
            )
        }

        if (tokenWithInfo.crossChainProvider) {
            return (
                <BridgeTokenBalanceCard
                    token={tokenWithInfo}
                    foundToken={foundToken}
                    isObserved={isObserved}
                    isBalanceVisible={isBalanceVisible}
                    openQRCodeSheet={openQRCodeSheet}
                />
            )
        }

        return (
            <VetBalanceCard
                token={tokenWithInfo}
                foundToken={foundToken}
                isObserved={isObserved}
                isBalanceVisible={isBalanceVisible}
                openQRCodeSheet={openQRCodeSheet}
            />
        )
    }, [tokenWithInfo, foundToken, isObserved, isBalanceVisible, openQRCodeSheet, convertB3trBottomSheetRef])

    return (
        <BaseView w={100}>
            <BaseText color={theme.colors.text} typographyFont="bodySemiBold">
                {LL.BD_YOUR_BALANCE()}
            </BaseText>

            <BaseSpacer height={12} />

            <BaseView w={100} style={styles.cardContainer}>
                {renderBalanceCard()}
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
