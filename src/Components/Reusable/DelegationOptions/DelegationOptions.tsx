import React, { useMemo } from "react"
import { BaseButtonGroupHorizontal, BaseSpacer, BaseText } from "~Components"
import { useI18nContext } from "~i18n"
import {
    AccountWithDevice,
    BaseButtonGroupHorizontalType,
    LocalAccountWithDevice,
} from "~Model"
import { DelegationType } from "~Model/Delegation"
import { useBottomSheetModal } from "~Hooks"
import { selectDelegationAccounts, useAppSelector } from "~Storage/Redux"
import { SelectUrlBottomSheet } from "./SelectUrlBottomSheet"
import { SelectDelegationAccountBottomSheet } from "./SelectDelegationAccountBottomSheet"

type Props = {
    selectedDelegationUrl?: string
    setSelectedDelegationUrl: (url: string) => void
    selectedDelegationOption: DelegationType
    setNoDelegation: () => void
    setSelectedAccount: (account: AccountWithDevice) => void
    selectedAccount?: LocalAccountWithDevice
    disabled?: boolean
}

// this component shows delegation options
export const DelegationOptions = ({
    selectedDelegationOption,
    setSelectedAccount,
    setNoDelegation,
    selectedAccount,
    selectedDelegationUrl,
    setSelectedDelegationUrl,
    disabled,
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

    const options: Array<BaseButtonGroupHorizontalType> = useMemo(() => {
        return [
            {
                id: DelegationType.NONE,
                label: LL.SEND_DELEGATION_NONE(),
            },
            {
                id: DelegationType.ACCOUNT,
                label: LL.SEND_DELEGATION_ACCOUNT(),
                disabled: accounts.length === 0,
            },
            {
                id: DelegationType.URL,
                label: LL.SEND_DELEGATION_URL(),
            },
        ]
    }, [LL, accounts.length])

    // this function is called when a delegation option is selected
    const handleSelectDelegationOption = (
        button: BaseButtonGroupHorizontalType,
    ) => {
        if (button.id === DelegationType.NONE) {
            setNoDelegation()
        } else if (button.id === DelegationType.ACCOUNT) {
            openSelectAccountBottomSheet()
        } else if (button.id === DelegationType.URL) {
            openSelectDelegationUrlBottomSheet()
        }
    }

    return (
        <>
            <BaseSpacer height={24} />
            <BaseText typographyFont="subTitleBold">
                {LL.SEND_DELEGATION_TITLE()}
            </BaseText>
            <BaseSpacer height={15} />

            <BaseButtonGroupHorizontal
                selectedButtonIds={[selectedDelegationOption]}
                buttons={options}
                action={handleSelectDelegationOption}
                disabled={disabled}
            />

            <SelectDelegationAccountBottomSheet
                onClose={closeSelectAccountBottonSheet}
                ref={selectAccountBottomSheetRef}
                setNoDelegation={setNoDelegation}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
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
