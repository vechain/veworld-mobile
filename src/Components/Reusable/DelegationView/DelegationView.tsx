import React from "react"
import { useBottomSheetModal } from "~Hooks"
import { AccountWithDevice, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { DelegationBottomSheet } from "./DelegationBottomSheet"
import { SelectedDelegation } from "./SelectedDelegation"

type Props = {
    setNoDelegation: () => void
    selectedDelegationOption: DelegationType
    setSelectedDelegationAccount: (account: AccountWithDevice) => void
    selectedDelegationAccount?: LocalAccountWithDevice
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (url: string) => void
    delegationToken: string
}

export function DelegationView({
    setNoDelegation,
    selectedDelegationOption,
    setSelectedDelegationAccount,
    selectedDelegationAccount,
    selectedDelegationUrl,
    setSelectedDelegationUrl,
    delegationToken,
}: Readonly<Props>) {
    const { onOpen, ref, onClose } = useBottomSheetModal()

    return (
        <>
            <SelectedDelegation
                onDelegateClicked={onOpen}
                selectedDelegationAccount={selectedDelegationAccount}
                selectedDelegationUrl={selectedDelegationUrl}
                delegationToken={delegationToken}
            />

            <DelegationBottomSheet
                ref={ref}
                selectedDelegationOption={selectedDelegationOption}
                setNoDelegation={setNoDelegation}
                setSelectedDelegationAccount={setSelectedDelegationAccount}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                selectedDelegationAccount={selectedDelegationAccount}
                selectedDelegationUrl={selectedDelegationUrl}
                onCloseBottomSheet={onClose}
            />
        </>
    )
}
