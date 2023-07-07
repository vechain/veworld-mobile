import { useEffect, useMemo, useState } from "react"
import { AccountWithDevice } from "~Model"
import { URLUtils } from "~Utils"

export const useWsUrlForVET = (
    currentAccount: AccountWithDevice,
    currentNetworkUrl: string,
) => {
    const [isVetWSOpen, setIsVETWSOpen] = useState(true)

    useEffect(() => {
        if (isVetWSOpen) setIsVETWSOpen(false)
    }, [currentAccount, currentNetworkUrl, isVetWSOpen])

    const wsUrlForVET = useMemo(() => {
        if (!currentAccount) throw Error("No current account")

        setIsVETWSOpen(true)

        return URLUtils.toWebsocketURL(
            currentNetworkUrl,
            `/subscriptions/transfer?recipient=${currentAccount?.address}`,
        )
    }, [currentAccount, currentNetworkUrl, setIsVETWSOpen])

    return { wsUrlForVET, isVetWSOpen }
}
