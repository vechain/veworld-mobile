import { selectAccount, useAppDispatch } from "~Storage/Redux"
import { error } from "~Utils"
import { useResetStacks } from "./useResetStacks"

export const useSetSelectedAccount = () => {
    const { resetStacks } = useResetStacks()
    const dispatch = useAppDispatch()

    const onSetSelectedAccount = ({ address }: { address?: string }) => {
        try {
            resetStacks()
        } catch (e) {
            error("useSetSelectedAccount: Failed to reset stacks", e)
        }

        address && dispatch(selectAccount({ address }))
    }

    return { onSetSelectedAccount }
}
