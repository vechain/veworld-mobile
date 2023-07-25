import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { SelectAccountBottomSheet } from "~Components"
import { AccountWithDevice, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { selectBalanceVisible, useAppSelector } from "~Storage/Redux"

type Props = {
    onClose: () => void
    selectedDelegationOption: DelegationType
    setSelectedAccount: (account: AccountWithDevice) => void
    selectedAccount?: LocalAccountWithDevice
    setNoDelegation: () => void
    accounts: LocalAccountWithDevice[]
}

// component to select an account for delegation
export const SelectDelegationAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        {
            onClose,
            setSelectedAccount,
            selectedAccount,
            selectedDelegationOption,
            setNoDelegation,
            accounts,
        },
        ref,
    ) => {
        const isBalanceVisible = useAppSelector(selectBalanceVisible)

        const onDismiss = () => {
            if (
                selectedDelegationOption === DelegationType.ACCOUNT &&
                !selectedAccount
            ) {
                setNoDelegation()
            }
        }

        return (
            <SelectAccountBottomSheet
                onDismiss={onDismiss}
                closeBottomSheet={onClose}
                accounts={accounts}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                ref={ref}
                isVthoBalance
                isBalanceVisible={isBalanceVisible}
            />
        )
    },
)
