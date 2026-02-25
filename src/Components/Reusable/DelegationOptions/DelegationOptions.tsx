import React, { useCallback, useMemo } from "react"
import { useI18nContext } from "~i18n"
import { AccountWithDevice, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { useBottomSheetModal } from "~Hooks"
import { selectDelegationAccounts, useAppSelector } from "~Storage/Redux"
import { SelectUrlBottomSheet } from "./SelectUrlBottomSheet"
import { SelectDelegationAccountBottomSheet } from "./SelectDelegationAccountBottomSheet"
import { BaseTabs } from "~Components/Base/BaseTabs"

type Props = {
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (url: string) => void
    selectedDelegationOption: DelegationType
    setNoDelegation: () => void
    setSelectedDelegationAccount: (account: AccountWithDevice) => void
    selectedDelegationAccount?: LocalAccountWithDevice
}

// this component shows delegation options
export const DelegationOptions = ({
    selectedDelegationOption,
    setSelectedDelegationAccount,
    setNoDelegation,
    selectedDelegationAccount,
    selectedDelegationUrl,
    setSelectedDelegationUrl,
}: Props) => {
    const { LL } = useI18nContext()

    const accounts = useAppSelector(selectDelegationAccounts)

    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()
    const {
        ref: selectDelegationUrlBottomSheetRef,
        onOpen: openSelectDelegationUrlBottomSheet,
        onClose: closeSelectDelegationUrlBottonSheet,
    } = useBottomSheetModal()

    const delegationOptionIds = useMemo(
        () => [DelegationType.NONE, DelegationType.ACCOUNT, DelegationType.URL] as const,
        [],
    )

    const delegationOptionLabels = useMemo(
        () => [LL.SEND_DELEGATION_NONE(), LL.SEND_DELEGATION_ACCOUNT(), LL.SEND_DELEGATION_URL()],
        [LL],
    )

    const disabledKeys = useMemo(() => {
        if (accounts.length === 0) return [DelegationType.ACCOUNT]
        return []
    }, [accounts.length])

    // this function is called when a delegation option is selected
    const handleSelectDelegationOption = useCallback(
        (option: DelegationType) => {
            if (option === DelegationType.NONE) {
                setNoDelegation()
            } else if (option === DelegationType.ACCOUNT) {
                openSelectAccountBottomSheet()
            } else if (option === DelegationType.URL) {
                openSelectDelegationUrlBottomSheet()
            }
        },
        [openSelectAccountBottomSheet, openSelectDelegationUrlBottomSheet, setNoDelegation],
    )

    return (
        <>
            <BaseTabs
                selectedKey={selectedDelegationOption}
                setSelectedKey={handleSelectDelegationOption}
                keys={delegationOptionIds}
                labels={delegationOptionLabels}
                disabledKeys={disabledKeys}
            />

            <SelectDelegationAccountBottomSheet
                onClose={closeSelectAccountBottonSheet}
                ref={selectAccountBottomSheetRef}
                setNoDelegation={setNoDelegation}
                setSelectedAccount={setSelectedDelegationAccount}
                selectedAccount={selectedDelegationAccount}
                selectedDelegationOption={selectedDelegationOption}
                accounts={accounts}
            />
            <SelectUrlBottomSheet
                setNoDelegation={setNoDelegation}
                onClose={closeSelectDelegationUrlBottonSheet}
                ref={selectDelegationUrlBottomSheetRef}
                selectedDelegationOption={selectedDelegationOption}
                selectedDelegationUrl={selectedDelegationUrl}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
            />
        </>
    )
}
