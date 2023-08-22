import { setSelectedAccount, useAppDispatch } from "~Storage/Redux"
import { useResetStacks } from "./useResetStacks"

export const useSetSelectedAccount = () => {
    const { resetStacks } = useResetStacks()
    const dispatch = useAppDispatch()

    const onSetSelectedAccount = ({ address }: { address?: string }) => {
        resetStacks()
        address && dispatch(setSelectedAccount({ address }))
    }

    return { onSetSelectedAccount }
}
