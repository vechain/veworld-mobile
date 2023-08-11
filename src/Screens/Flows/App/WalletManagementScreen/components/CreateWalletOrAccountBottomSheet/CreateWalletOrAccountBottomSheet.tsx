import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseBottomSheet, BaseSpacer, BaseText, CardButton } from "~Components"
import { useI18nContext } from "~i18n"

import { Routes } from "~Navigation"
import { useNavigation } from "@react-navigation/native"

type Props = {
    onCreateAccount: () => void
    onClose: () => void
}

const snapPoints = ["40%", "50%", "75%"]

export const CreateWalletOrAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, onCreateAccount }, ref) => {
    const { LL } = useI18nContext()

    const navigation = useNavigation()

    const goToCreateWalletFlow = useCallback(() => {
        onClose()
        navigation.navigate(Routes.CREATE_WALLET_FLOW)
    }, [navigation, onClose])

    const handleCreateAccount = useCallback(() => {
        onClose()
        onCreateAccount()
    }, [onClose, onCreateAccount])

    return (
        <BaseBottomSheet snapPoints={snapPoints} onDismiss={onClose} ref={ref}>
            <BaseText typographyFont="subTitleBold">
                {LL.ACCOUNT_OR_WALLET_BOTTOM_SHEET_TITLE()}
            </BaseText>
            <BaseSpacer height={16} />
            <BaseText typographyFont="buttonSecondary">
                {LL.ACCOUNT_OR_WALLET_BOTTOM_SHEET_SUBTITLE()}
            </BaseText>
            <BaseSpacer height={32} />
            <CardButton
                title={LL.ACCOUNT_OR_WALLET_BOTTOM_SHEET_ADD_ACCOUNT()}
                leftIcon="account-plus-outline"
                rightIcon="chevron-right"
                action={handleCreateAccount}
            />
            <BaseSpacer height={16} />
            <CardButton
                title={LL.ACCOUNT_OR_WALLET_BOTTOM_SHEET_ADD_WALLET()}
                leftIcon="wallet-plus-outline"
                rightIcon="chevron-right"
                action={goToCreateWalletFlow}
            />
        </BaseBottomSheet>
    )
})
