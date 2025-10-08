import { useMemo } from "react"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils } from "~Utils"
import { useUserHasVetTransfer } from "./useUserHasVetTransfer"

export const useShowStakingTab = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { smartAccountAddress } = useSmartWallet()
    const { data: hasVetTransfer } = useUserHasVetTransfer()

    const isSmartWallet = useMemo(() => {
        return AddressUtils.compareAddresses(selectedAccount.address, smartAccountAddress)
    }, [selectedAccount.address, smartAccountAddress])

    return !isSmartWallet || (isSmartWallet && hasVetTransfer)
}
