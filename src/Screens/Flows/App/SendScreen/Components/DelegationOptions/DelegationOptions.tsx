import React, { useMemo } from "react"
import { BaseButtonGroupHorizontal, BaseSpacer, BaseText } from "~Components"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType, AccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { SelectAccountBottomSheet } from "../SelectAccountBottomSheet"
import { useBottomSheetModal } from "~Common"

type Props = {
    selectedDelegationOption: DelegationType
    setSelectedDelegationOption: (id: DelegationType) => void
    setSelectedAccount: (account?: AccountWithDevice) => void
    selectedAccount?: AccountWithDevice
}

// this component shows delegation options
export const DelegationOptions = ({
    selectedDelegationOption,
    setSelectedDelegationOption,
    setSelectedAccount,
    selectedAccount,
}: Props) => {
    const { LL } = useI18nContext()
    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
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
            },
            {
                id: DelegationType.URL,
                label: LL.SEND_DELEGATION_URL(),
            },
        ]
    }, [LL])

    // this function is called when a delegation option is selected
    const handleSelectDelegationOption = (
        button: BaseButtonGroupHorizontalType,
    ) => {
        setSelectedDelegationOption(button.id as DelegationType)
        if (button.id === DelegationType.ACCOUNT) {
            openSelectAccountBottomSheet()
        }
        if (button.id !== DelegationType.ACCOUNT) {
            setSelectedAccount(undefined)
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
            />
            <SelectAccountBottomSheet
                onClose={closeSelectAccountBottonSheet}
                ref={selectAccountBottomSheetRef}
                setSelectedDelegationOption={setSelectedDelegationOption}
                setSelectedAccount={setSelectedAccount}
                selectedAccount={selectedAccount}
                selectedDelegationOption={selectedDelegationOption}
            />
        </>
    )
}
