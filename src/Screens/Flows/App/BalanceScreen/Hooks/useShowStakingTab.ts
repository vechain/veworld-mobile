import { useUserHasVetTransfer } from "./useUserHasVetTransfer"

export const useShowStakingTab = () => {
    const { data: hasVetTransfer } = useUserHasVetTransfer()

    return hasVetTransfer
}
