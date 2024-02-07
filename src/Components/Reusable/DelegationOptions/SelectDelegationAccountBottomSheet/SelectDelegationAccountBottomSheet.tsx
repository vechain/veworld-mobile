import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback } from "react"
import { SelectAccountBottomSheet } from "~Components"
import { AccountWithDevice, LocalAccountWithDevice, WatchedAccount } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { selectBalanceVisible, useAppSelector } from "~Storage/Redux"
import { AccountUtils } from "~Utils"

type Props = {
    onClose: () => void
    selectedDelegationOption: DelegationType
    setSelectedAccount: (account: AccountWithDevice) => void
    selectedAccount?: LocalAccountWithDevice
    setNoDelegation: () => void
    accounts: LocalAccountWithDevice[]
}

// component to select an account for delegation
export const SelectDelegationAccountBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ onClose, setSelectedAccount, selectedAccount, selectedDelegationOption, setNoDelegation, accounts }, ref) => {
        const isBalanceVisible = useAppSelector(selectBalanceVisible)

        const onDismiss = () => {
            if (selectedDelegationOption === DelegationType.ACCOUNT && !selectedAccount) {
                setNoDelegation()
            }
        }

        const onAccountIsSelected = useCallback(
            (account: AccountWithDevice | WatchedAccount) => {
                // Just a type fallabck check. We should never get a WatchedAccount here since the filtering is coming from the store
                if (AccountUtils.isObservedAccount(account)) return
                setSelectedAccount(account)
            },
            [setSelectedAccount],
        )

        return (
            <SelectAccountBottomSheet
                onDismiss={onDismiss}
                closeBottomSheet={onClose}
                accounts={accounts}
                setSelectedAccount={onAccountIsSelected}
                selectedAccount={selectedAccount as AccountWithDevice}
                ref={ref}
                isVthoBalance
                isBalanceVisible={isBalanceVisible}
            />
        )
    },
)
