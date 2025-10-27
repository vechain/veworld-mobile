import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback } from "react"
import { BaseBottomSheet, BaseSpacer, BaseText } from "~Components"
import { WatchedAccount } from "~Model"
import { useI18nContext } from "~i18n"
import { SelectableAccountCard } from "../SelectableAccountCard"

type Props = {
    onDismiss?: () => void
    closeBottomSheet?: () => void
    account?: WatchedAccount
    confirmAccount: () => void
}

// component to select an account
export const SelectWatchedAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ closeBottomSheet, onDismiss, confirmAccount, account }, ref) => {
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
                        <SelectableAccountCard
                            testID="observe-wallet-account-card"
                            account={account}
                            onPress={handlePress}
                        />
                        <BaseSpacer height={12} />
                    </>
                )}
            </BaseBottomSheet>
        )
    },
)
