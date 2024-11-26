import { useCallback, useState } from "react"
import { setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { LocalDevice } from "~Model"

export const useCloudBackupState = (deviceToBackup: LocalDevice | undefined, getWalletByRootAddress: Function) => {
    const dispatch = useAppDispatch()
    const [isWalletBackedUp, setIsWalletBackedUp] = useState(true)
    const [isCloudError, setIsCloudError] = useState(false)

    const getWallet = useCallback(async () => {
        dispatch(setIsAppLoading(true))
        try {
            const wallet = await getWalletByRootAddress(deviceToBackup?.rootAddress)
            setIsWalletBackedUp(!!wallet)
            setIsCloudError(false)
        } catch {
            setIsWalletBackedUp(false)
            setIsCloudError(true)
        } finally {
            dispatch(setIsAppLoading(false))
        }
    }, [deviceToBackup?.rootAddress, dispatch, getWalletByRootAddress])

    return {
        isWalletBackedUp,
        setIsWalletBackedUp,
        isCloudError,
        setIsCloudError,
        getWallet,
    }
}
