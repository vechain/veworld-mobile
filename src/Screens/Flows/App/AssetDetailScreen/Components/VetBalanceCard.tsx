import { TokenWithCompleteInfo, useBottomSheetModal, useThemedStyles, useTokenCardFiatInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import React, { useMemo } from "react"
import { BaseSkeleton, BaseText, BaseView, FastActionsBottomSheet } from "~Components"
import { StyleSheet } from "react-native"
import { BalanceView } from "./BalanceView"
import { FungibleTokenWithBalance } from "~Model"
import { ActionsButtonGroup } from "./ActionsButtonGroup"
import { VET } from "~Constants"
import { useAssetActions } from "../Hooks/useAssetActions"

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

    const isActionDisabled = useMemo(() => !foundToken || isObserved, [foundToken, isObserved])
    const isVet = useMemo(() => token.symbol === VET.symbol, [token.symbol])

    const {
        ref: FastActionsBottomSheetRef,
        onOpen: openFastActionsSheet,
        onClose: closeFastActionsSheet,
    } = useBottomSheetModal()

    const { bottomSheetActions, barActions } = useAssetActions({
        foundToken,
        isActionDisabled,
        openQRCodeSheet,
        openFastActionsSheet,
    })

    const VetActions = useMemo(
        () => [barActions.send, barActions.receive, barActions.buy, barActions.more],
        [barActions.buy, barActions.more, barActions.receive, barActions.send],
    )
    const VthoActions = useMemo(
        () => [barActions.send, barActions.swap, barActions.receive],
        [barActions.receive, barActions.send, barActions.swap],
    )
    const VetBottomSheetActions = [
        bottomSheetActions.buy,
        bottomSheetActions.send,
        bottomSheetActions.swap,
        bottomSheetActions.receive,
    ]

    const renderFiatBalance = useMemo(() => {
        if (isLoading)
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
        if (!exchangeRate) return <BaseText typographyFont="bodyMedium">{LL.ERROR_PRICE_FEED_NOT_AVAILABLE()}</BaseText>

        return (
            <BalanceView
                isBalanceVisible={isBalanceVisible}
                tokenWithInfo={token}
                change24h={change24h}
                isPositiveChange={isPositive24hChange}
            />
        )
    }, [
        isLoading,
        theme.colors.skeletonBoneColor,
        theme.colors.skeletonHighlightColor,
        exchangeRate,
        LL,
        isBalanceVisible,
        token,
        change24h,
        isPositive24hChange,
    ])

    return (
        <BaseView style={styles.container}>
            {renderFiatBalance}
            <ActionsButtonGroup actions={isVet ? VetActions : VthoActions} isVet />
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
