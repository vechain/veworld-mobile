import { DelegationType } from "~Model/Delegation"
import { AccountWithDevice } from "~Model"
import { useState } from "react"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { Transaction } from "thor-devkit"
import { HexUtils, error, info } from "~Common"
import axios from "axios"
import { showErrorToast } from "~Components"
import { useI18nContext } from "~i18n"

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
    const [delegationSignature, setDelegationSignature] = useState<Buffer>()
    const isDelegated = selectedDelegationOption !== DelegationType.NONE

    /**
     * TODO: Can be used later on to delegation in-extension transactions
     */

    const fetchSignature = async (
        txBody: Transaction.Body,
        delegationUrl: string,
        accAddress: string,
    ) => {
        const tx = new Transaction(txBody)
        // build hex encoded version of the transaction for signing request
        const rawTransaction = HexUtils.addPrefix(tx.encode().toString("hex"))

        // request to send for sponsorship/fee delegation
        const sponsorRequest = {
            origin: accAddress.toLowerCase(),
            raw: rawTransaction,
        }

        const onError = (e: any) => {
            error("Failed to get signature from delegator:" + e)
            setSelectedDelegationOption(DelegationType.NONE)
            setSelectedDelegationUrl(undefined)
            setDelegationSignature(undefined)
            showErrorToast(LL.SEND_DELEGATION_ERROR_SIGNATURE())
        }

        // request sponsorship
        try {
            const response = await axios.post(delegationUrl, sponsorRequest)

            if (response.data.error || !response.data.signature) {
                onError(response.data.error)
            }

            const signature = Buffer.from(
                response.data.signature.substr(2),
                "hex",
            )
            info("url delegation signature", signature)
            setDelegationSignature(signature)
        } catch (e) {
            onError(e)
        }
    }

    const handleSetSelectedDelegationUrl = (url?: string) => {
        setSelectedDelegationUrl(url)
        if (url && account?.address) {
            fetchSignature(transaction, url, account.address)
        } else {
            setDelegationSignature(undefined)
        }
    }

    return {
        selectedDelegationOption,
        setSelectedDelegationOption,
        selectedDelegationAccount,
        setSelectedDelegationAccount,
        selectedDelegationUrl,
        setSelectedDelegationUrl: handleSetSelectedDelegationUrl,
        delegationSignature,
        setDelegationSignature,
        isDelegated,
    }
}
