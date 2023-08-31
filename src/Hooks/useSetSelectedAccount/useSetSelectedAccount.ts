import {
    selectSelectedAccount,
    setSelectedAccount,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { useResetStacks } from "./useResetStacks"
import { AddressUtils } from "~Utils"

export const useSetSelectedAccount = () => {
    const selectedAccount = useAppSelector(selectSelectedAccount)
    const { resetStacks } = useResetStacks()
    const dispatch = useAppDispatch()

    const onSetSelectedAccount = ({ address }: { address?: string }) => {
        if (AddressUtils.compareAddresses(selectedAccount?.address, address)) {
            return
        }

        resetStacks()
        address && dispatch(setSelectedAccount({ address }))
    }

    return { onSetSelectedAccount }
}
