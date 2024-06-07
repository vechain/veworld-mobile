import React, { useCallback } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { AccountCard, BaseBottomSheet, BaseSpacer, BaseText } from "~Components"
import { WatchedAccount } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    onDismiss?: () => void
    closeBottomSheet?: () => void
    account?: WatchedAccount
    confirmAccount: () => void
    isBalanceVisible?: boolean
    formattedBalance: string
}

// component to select an account
export const SelectWatchedAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ closeBottomSheet, onDismiss, isBalanceVisible = true, confirmAccount, account, formattedBalance }, ref) => {
        const { LL } = useI18nContext()

        const handlePress = useCallback(() => {
            confirmAccount()
            if (closeBottomSheet) closeBottomSheet()
        }, [closeBottomSheet, confirmAccount])

        return (
            <BaseBottomSheet dynamicHeight ref={ref} onDismiss={onDismiss}>
                <BaseText typographyFont="subTitleBold">{LL.SB_CONFIRM_OPERATION()}</BaseText>
                <BaseSpacer height={12} />
                {!!account && (
                    <>
                        <AccountCard
                            testID="observe-wallet-account-card"
                            account={account}
                            onPress={handlePress}
                            isBalanceVisible={isBalanceVisible}
                            formattedBalance={formattedBalance}
                        />
                        <BaseSpacer height={12} />
                    </>
                )}
            </BaseBottomSheet>
        )
    },
)
