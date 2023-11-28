import React from "react"
import { AccountWithDevice, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { DelegationOptions } from "../DelegationOptions"
import { BaseCard, BaseSpacer, BaseText } from "~Components/Base"
import { AccountCard } from "../AccountCard"

interface IDelegationView {
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
}: IDelegationView) {
    return (
        <>
            <DelegationOptions
                setNoDelegation={setNoDelegation}
                selectedDelegationOption={selectedDelegationOption}
                setSelectedDelegationAccount={setSelectedDelegationAccount}
                selectedDelegationAccount={selectedDelegationAccount}
                selectedDelegationUrl={selectedDelegationUrl}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
            />
            {selectedDelegationAccount && (
                <>
                    <BaseSpacer height={16} />
                    <AccountCard account={selectedDelegationAccount} />
                </>
            )}
            {selectedDelegationUrl && (
                <>
                    <BaseSpacer height={16} />
                    <BaseCard>
                        <BaseText py={8}>{selectedDelegationUrl}</BaseText>
                    </BaseCard>
                </>
            )}
        </>
    )
}
