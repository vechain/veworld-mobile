import { DelegationType } from "~Model/Delegation"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"
import { useCallback, useEffect, useState } from "react"
import {
    getDefaultDelegationAccount,
    getDefaultDelegationOption,
    getDefaultDelegationUrl,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { address, secp256k1, Transaction } from "thor-devkit"
import { debug, error, HexUtils, TransactionUtils } from "~Utils"
import axios from "axios"
import { showErrorToast } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    transaction: Transaction.Body
    providedUrl?: string
    setGasPayer: (gasPayer: string) => void
}

export const useDelegation = ({
    transaction,
    providedUrl,
    setGasPayer,
}: Props) => {
    const { LL } = useI18nContext()
    const account = useAppSelector(selectSelectedAccount)
    const [selectedDelegationOption, setSelectedDelegationOption] =
        useState<DelegationType>(DelegationType.NONE)
    const [selectedDelegationAccount, setSelectedDelegationAccount] =
        useState<AccountWithDevice>()
    const [selectedDelegationUrl, setSelectedDelegationUrl] = useState<string>()
    const [urlDelegationSignature, setUrlDelegationSignature] =
        useState<Buffer>()
    const isDelegated = selectedDelegationOption !== DelegationType.NONE
    const defaultDelegationOption = useAppSelector(getDefaultDelegationOption)
    const defaultDelegationAccount = useAppSelector(getDefaultDelegationAccount)
    const defaultDelegationUrl = useAppSelector(getDefaultDelegationUrl)

    const fetchSignature = useCallback(
        async (
            txBody: Transaction.Body,
            delegationUrl: string,
            accountAddress: string,
        ) => {
            debug("fetching signature from URL: " + delegationUrl)
            const onError = (e: any) => {
                error("Failed to get signature from delegator:" + e)
                setSelectedDelegationOption(DelegationType.NONE)
                setSelectedDelegationUrl(undefined)
                setUrlDelegationSignature(undefined)
                showErrorToast(LL.SEND_DELEGATION_ERROR_SIGNATURE())
            }

            try {
                const tx = TransactionUtils.toDelegation(txBody)
                // build hex encoded version of the transaction for signing request
                const rawTransaction = HexUtils.addPrefix(
                    tx.encode().toString("hex"),
                )

                // request to send for sponsorship/fee delegation
                const sponsorRequest = {
                    origin: accountAddress.toLowerCase(),
                    raw: rawTransaction,
                }

                const response = await axios.post(delegationUrl, sponsorRequest)

                if (response.data.error || !response.data.signature) {
                    onError(response.data.error)
                }

                const signature = Buffer.from(
                    response.data.signature.substr(2),
                    "hex",
                )
                setUrlDelegationSignature(signature)

                const publicKey = secp256k1.recover(
                    tx.signingHash(accountAddress.toLowerCase()),
                    signature,
                )

                const gasPayer = address.fromPublicKey(publicKey)

                debug("URL Delegation success: " + gasPayer)

                setGasPayer(gasPayer)
            } catch (e) {
                onError(e)
            }
        },
        [setGasPayer, LL],
    )

    const handleSetSelectedDelegationUrl = async (url?: string) => {
        setSelectedDelegationUrl(url)
        setSelectedDelegationOption(DelegationType.URL)
        if (url) {
            await fetchSignature(transaction, url, account.address)
        } else {
            setUrlDelegationSignature(undefined)
        }
    }

    useEffect(() => {
        //Prioritise provided url
        if (providedUrl) {
            setSelectedDelegationOption(DelegationType.URL)
            handleSetSelectedDelegationUrl(providedUrl)
        } else if (defaultDelegationOption === DelegationType.URL) {
            setSelectedDelegationOption(defaultDelegationOption)
            handleSetSelectedDelegationUrl(defaultDelegationUrl)
        } else if (defaultDelegationOption === DelegationType.ACCOUNT) {
            setSelectedDelegationOption(defaultDelegationOption)
            setSelectedDelegationAccount(defaultDelegationAccount)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providedUrl])

    const handleSetSelectedDelegationAccount = (
        selectedAccount: AccountWithDevice,
    ) => {
        if (account.device.type === DEVICE_TYPE.LEDGER) return

        setSelectedDelegationAccount(selectedAccount)
        setSelectedDelegationOption(DelegationType.ACCOUNT)
        setGasPayer(selectedAccount.address)
        setSelectedDelegationUrl(undefined)
        setUrlDelegationSignature(undefined)
    }

    const handleNoDelegation = () => {
        setSelectedDelegationOption(DelegationType.NONE)
        setGasPayer(account.address)
        setSelectedDelegationAccount(undefined)
        setSelectedDelegationUrl(undefined)
        setUrlDelegationSignature(undefined)
    }

    return {
        setSelectedDelegationUrl: handleSetSelectedDelegationUrl,
        setSelectedDelegationAccount: handleSetSelectedDelegationAccount,
        setNoDelegation: handleNoDelegation,
        selectedDelegationOption,
        selectedDelegationAccount,
        selectedDelegationUrl,
        urlDelegationSignature,
        isDelegated,
    }
}
