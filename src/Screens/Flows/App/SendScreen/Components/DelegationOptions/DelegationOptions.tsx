import React, { useMemo } from "react"
import { BaseButtonGroupHorizontal, BaseSpacer, BaseText } from "~Components"
import { useI18nContext } from "~i18n"
import { BaseButtonGroupHorizontalType, AccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { SelectAccountBottomSheet } from "../SelectAccountBottomSheet"
import { useBottomSheetModal } from "~Common"
import { selectAccountsButSelected, useAppSelector } from "~Storage/Redux"
import { SelectUrlBottomSheet } from "../SelectUrlBottomSheet"

type Props = {
    selectedDelegationUrl: string
    setSelectedDelegationUrl: (url?: string) => void
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
    //selectedDelegationUrl,
    setSelectedDelegationUrl,
}: Props) => {
    const { LL } = useI18nContext()
    const accounts = useAppSelector(selectAccountsButSelected)
    const {
        ref: selectAccountBottomSheetRef,
        onOpen: openSelectAccountBottomSheet,
        onClose: closeSelectAccountBottonSheet,
    } = useBottomSheetModal()
    const {
        //ref: selectDelegationUrlBottomSheetRef,
        onOpen: openSelectDelegationUrlBottomSheet,
        //onClose: closeSelectDelegationUrlBottonSheet,
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
        setSelectedDelegationOption(button.id as DelegationType)
        if (button.id === DelegationType.ACCOUNT) {
            openSelectAccountBottomSheet()
        } else {
            setSelectedAccount(undefined)
        }

        if (button.id === DelegationType.URL) {
            openSelectDelegationUrlBottomSheet()
        } else {
            setSelectedDelegationUrl(undefined)
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
            <SelectUrlBottomSheet
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
