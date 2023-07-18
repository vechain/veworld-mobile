import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React from "react"
import { SelectAccountBottomSheet } from "~Components"
import { AccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import {
    selectAccountsButSelected,
    selectBalanceVisible,
    useAppSelector,
} from "~Storage/Redux"

type Props = {
    onClose: () => void
    selectedDelegationOption: DelegationType
    setSelectedDelegationOption: (id: DelegationType) => void
    setSelectedAccount: (account?: AccountWithDevice) => void
    selectedAccount?: AccountWithDevice
}

// component to select an account for delegation
export const SelectDelegationAccountBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(
    (
        {
            onClose,
            setSelectedDelegationOption,
            setSelectedAccount,
            selectedAccount,
            selectedDelegationOption,
        },
        ref,
    ) => {
        const accounts = useAppSelector(selectAccountsButSelected)

        const isBalanceVisible = useAppSelector(selectBalanceVisible)

        const onDismiss = () => {
            if (
                selectedDelegationOption === DelegationType.ACCOUNT &&
                !selectedAccount
            ) {
                setSelectedDelegationOption(DelegationType.NONE)
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
