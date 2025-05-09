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
}

export function DelegationView({
    setNoDelegation,
    selectedDelegationOption,
    setSelectedDelegationAccount,
    selectedDelegationAccount,
    selectedDelegationUrl,
    setSelectedDelegationUrl,
}: Readonly<Props>) {
    const { onOpen, ref, onClose } = useBottomSheetModal()

    return (
        <>
            <SelectedDelegation
                onDelegateClicked={onOpen}
                selectedDelegationAccount={selectedDelegationAccount}
                selectedDelegationUrl={selectedDelegationUrl}
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
