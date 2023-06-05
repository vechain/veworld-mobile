import { DelegationType } from "~Model/Delegation"
import { AccountWithDevice } from "~Model"
import { useEffect, useState } from "react"
import {
    getDefaultDelegationAccount,
    getDefaultDelegationOption,
    getDefaultDelegationUrl,
    selectSelectedAccount,
    useAppSelector,
} from "~Storage/Redux"
import { Transaction } from "thor-devkit"
import { error, info } from "~Common"
import { HexUtils, TransactionUtils } from "~Utils"
import axios from "axios"
import { showErrorToast } from "~Components"
import { useI18nContext } from "~i18n"
import { useSelector } from "react-redux"

type Props = {
    transaction: Transaction.Body
}

export const useDelegation = ({ transaction }: Props) => {
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
    const defaultDelegationOption = useSelector(getDefaultDelegationOption)
    const defaultDelegationAccount = useSelector(getDefaultDelegationAccount)
    const defaultDelegationUrl = useSelector(getDefaultDelegationUrl)

    /**
     * TODO: Can be used later on to delegation in-extension transactions
     */

    const fetchSignature = async (
        txBody: Transaction.Body,
        delegationUrl: string,
        accountAddress: string,
    ) => {
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
            info("url delegation signature", signature)
            setUrlDelegationSignature(signature)
        } catch (e) {
            onError(e)
        }
    }

    const handleSetSelectedDelegationUrl = async (url?: string) => {
        setSelectedDelegationUrl(url)
        if (url) {
            await fetchSignature(transaction, url, account.address)
        } else {
            setUrlDelegationSignature(undefined)
        }
    }

    useEffect(() => {
        if (defaultDelegationOption === DelegationType.URL) {
            setSelectedDelegationOption(defaultDelegationOption)
            handleSetSelectedDelegationUrl(defaultDelegationUrl)
        }
        if (defaultDelegationOption === DelegationType.ACCOUNT) {
            setSelectedDelegationOption(defaultDelegationOption)
            setSelectedDelegationAccount(defaultDelegationAccount)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        selectedDelegationOption,
        setSelectedDelegationOption,
        selectedDelegationAccount,
        setSelectedDelegationAccount,
        selectedDelegationUrl,
        setSelectedDelegationUrl: handleSetSelectedDelegationUrl,
        urlDelegationSignature,
        setUrlDelegationSignature,
        isDelegated,
    }
}
