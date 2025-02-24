import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { TokenWithCompleteInfo, useBottomSheetModal, useThemedStyles, useTokenCardFiatInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { BaseSkeleton, BaseText, BaseView, FastActionsBottomSheet } from "~Components"
import { FungibleTokenWithBalance } from "~Model"
import { VET } from "~Constants"
import { useVetActions } from "../Hooks/useVetActions"
import { ActionsButtonGroup } from "./ActionsButtonGroup"
import { BalanceView } from "./BalanceView"

type Props = {
    token: TokenWithCompleteInfo
    isBalanceVisible: boolean
    isObserved: boolean
    openQRCodeSheet: () => void
    foundToken?: FungibleTokenWithBalance
}

export const VetBalanceCard = ({ token, isBalanceVisible, foundToken, openQRCodeSheet, isObserved }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyle)
    const { LL } = useI18nContext()
    const { change24h, exchangeRate, isPositive24hChange, isLoading } = useTokenCardFiatInfo(token)
    const {
        ref: FastActionsBottomSheetRef,
        onOpen: openFastActionsSheet,
        onClose: closeFastActionsSheet,
    } = useBottomSheetModal()

    const { VetActions, VthoActions, VetBottomSheetActions } = useVetActions({
        foundToken,
        isObserved,
        openQRCodeSheet,
        openFastActionsSheet,
    })

    const renderFiatBalance = useMemo(() => {
        if (isLoading) {
            return (
                <BaseView flexDirection="row">
                    <BaseSkeleton
                        animationDirection="horizontalLeft"
                        boneColor={theme.colors.skeletonBoneColor}
                        highlightColor={theme.colors.skeletonHighlightColor}
                        height={14}
                        width={60}
                    />
                </BaseView>
            )
        }
        if (!exchangeRate) {
            return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>
        }
        return (
            <BalanceView
                isBalanceVisible={isBalanceVisible}
                tokenWithInfo={token}
                change24h={change24h}
                isPositiveChange={isPositive24hChange}
            />
        )
    }, [isLoading, theme.colors, exchangeRate, LL, isBalanceVisible, token, change24h, isPositive24hChange])

    return (
        <BaseView style={styles.container}>
            {renderFiatBalance}
            <ActionsButtonGroup actions={token.symbol === VET.symbol ? VetActions : VthoActions} isVet />
            <FastActionsBottomSheet
                ref={FastActionsBottomSheetRef}
                actions={VetBottomSheetActions}
                closeBottomSheet={closeFastActionsSheet}
            />
        </BaseView>
    )
}

const baseStyle = () =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 16,
            gap: 16,
        },
    })
