import { DelegationType } from "~Model/Delegation"
import { AccountWithDevice, DEVICE_TYPE, LocalAccountWithDevice } from "~Model"
import { useCallback, useEffect, useState } from "react"
import {
    getDefaultDelegationAccount,
    getDefaultDelegationOption,
    getDefaultDelegationUrl,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"

type Props = {
    providedUrl?: string
    setGasPayer: (gasPayer: string) => void
}

export const useDelegation = ({ providedUrl, setGasPayer }: Props) => {
    const account = useAppSelector(selectSelectedAccount)
    const [selectedDelegationOption, setSelectedDelegationOption] = useState<DelegationType>(DelegationType.NONE)
    const [selectedDelegationAccount, setSelectedDelegationAccount] = useState<LocalAccountWithDevice>()
    const [selectedDelegationUrl, setSelectedDelegationUrl] = useState<string>()
    const isDelegated = selectedDelegationOption !== DelegationType.NONE
    const defaultDelegationOption = useAppSelector(getDefaultDelegationOption)
    const defaultDelegationAccount = useAppSelector(getDefaultDelegationAccount)
    const defaultDelegationUrl = useAppSelector(getDefaultDelegationUrl)

    const handleSetSelectedDelegationUrl = useCallback((url: string) => {
        setSelectedDelegationUrl(url)
        setSelectedDelegationOption(DelegationType.URL)
    }, [])

    useEffect(() => {
        //Prioritise provided url
        if (providedUrl) {
            setSelectedDelegationOption(DelegationType.URL)
            handleSetSelectedDelegationUrl(providedUrl)
        } else if (defaultDelegationOption === DelegationType.URL && defaultDelegationUrl) {
            setSelectedDelegationOption(defaultDelegationOption)
            handleSetSelectedDelegationUrl(defaultDelegationUrl)
        } else if (defaultDelegationOption === DelegationType.ACCOUNT) {
            setSelectedDelegationOption(defaultDelegationOption)
            setSelectedDelegationAccount(defaultDelegationAccount)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providedUrl])

    const handleSetSelectedDelegationAccount = useCallback(
        (selectedAccount: AccountWithDevice) => {
            if (selectedAccount.device.type === DEVICE_TYPE.LEDGER) return

            setSelectedDelegationAccount(selectedAccount as LocalAccountWithDevice)
            setSelectedDelegationOption(DelegationType.ACCOUNT)
            setGasPayer(selectedAccount.address)
            setSelectedDelegationUrl(undefined)
        },
        [setGasPayer],
    )

    const handleNoDelegation = useCallback(() => {
        setSelectedDelegationOption(DelegationType.NONE)
        setGasPayer(account.address)
        setSelectedDelegationAccount(undefined)
        setSelectedDelegationUrl(undefined)
    }, [account.address, setGasPayer])

    return {
        setSelectedDelegationUrl: handleSetSelectedDelegationUrl,
        setSelectedDelegationAccount: handleSetSelectedDelegationAccount,
        setNoDelegation: handleNoDelegation,
        selectedDelegationOption,
        selectedDelegationAccount,
        selectedDelegationUrl,
        isDelegated,
    }
}
