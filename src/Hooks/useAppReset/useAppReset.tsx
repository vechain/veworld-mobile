import { useCallback } from "react"
import { useEncryptedStorage } from "~Components"
import { useNavigation } from "@react-navigation/native"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"

export const useAppReset = () => {
    const dispatch = useAppDispatch()
    const { wipeApplication } = useEncryptedStorage()
    const nav = useNavigation()

    return useCallback(async () => {
        dispatch(setIsAppLoading(true))

        await wipeApplication()

        setTimeout(() => {
            dispatch(setIsAppLoading(false))
        }, 500)
    }, [dispatch, wipeApplication, nav])
}
