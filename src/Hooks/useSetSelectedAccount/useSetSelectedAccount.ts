import { selectSelectedAccountOrNull, setSelectedAccount, useAppDispatch, useAppSelector } from "~Storage/Redux"
import { useResetStacks } from "./useResetStacks"
import { useFetchingStargate } from "../../StargateEventListener/Hooks/useFetchingStargate"
import { AddressUtils } from "~Utils"

export const useSetSelectedAccount = () => {
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const { resetStacks } = useResetStacks()
    const { refetchStargateData } = useFetchingStargate()
    const dispatch = useAppDispatch()

    const onSetSelectedAccount = ({ address }: { address?: string }) => {
        if (AddressUtils.compareAddresses(selectedAccount?.address, address)) {
            return
        }

        resetStacks()
        address && dispatch(setSelectedAccount({ address }))

        // Refetch Stargate data for the new account to ensure fresh data
        if (address) {
            refetchStargateData(address)
        }
    }

    return { onSetSelectedAccount }
}
