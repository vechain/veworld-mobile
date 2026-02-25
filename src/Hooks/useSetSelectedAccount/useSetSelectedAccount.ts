import { useAppDispatch, useAppSelector, setSelectedAccount } from "~Storage/Redux"
import { selectSelectedNetwork, selectSelectedAccountOrNull } from "~Storage/Redux/Selectors"
import { useResetStacks } from "./useResetStacks"
import { AddressUtils } from "~Utils"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"

export const useSetSelectedAccount = () => {
    const selectedAccount = useAppSelector(selectSelectedAccountOrNull)
    const network = useAppSelector(selectSelectedNetwork)
    const { resetStacks } = useResetStacks()
    const dispatch = useAppDispatch()

    const onSetSelectedAccount = ({ address }: { address?: string }) => {
        if (AddressUtils.compareAddresses(selectedAccount?.address, address)) {
            return
        }

        if (address) {
            resetStacks()
            dispatch(setSelectedAccount({ address }))

            Feedback.show({
                severity: FeedbackSeverity.INFO,
                type: FeedbackType.ALERT,
                message: AddressUtils.loadVnsFromCache(address, network)?.name || AddressUtils.humanAddress(address),
                icon: "icon-arrow-left-right",
            })
        }
    }

    return { onSetSelectedAccount }
}
