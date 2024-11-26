import { useCallback } from "react"
import { getTimeZone } from "react-native-localize"
import { LocalDevice } from "~Model"
import { setDeviceIsBackup, setIsAppLoading, useAppDispatch } from "~Storage/Redux"
import { DateUtils } from "~Utils"

export const useCloudBackupDelete = (
    deviceToBackup: LocalDevice | undefined,
    deleteWallet: Function,
    getWalletByRootAddress: Function,
    setIsWalletBackedUp: Function,
    setIsCloudError: Function,
    navigation: any,
    locale: string,
) => {
    const dispatch = useAppDispatch()

    const handleConfirmDelete = useCallback(async () => {
        if (!deviceToBackup?.rootAddress) {
            throw new Error("No root address found")
        }

        setIsAppLoading(true)
        try {
            await deleteWallet(deviceToBackup.rootAddress)
            const wallet = await getWalletByRootAddress(deviceToBackup.rootAddress)
            const formattedDate = DateUtils.formatDateTime(
                Date.now(),
                locale,
                getTimeZone() ?? DateUtils.DEFAULT_TIMEZONE,
            )
            dispatch(
                setDeviceIsBackup({
                    rootAddress: deviceToBackup.rootAddress,
                    isBackup: !!wallet,
                    isBackupManual: !!deviceToBackup.isBackedUpManual,
                    date: formattedDate,
                }),
            )
            setIsWalletBackedUp(!!wallet)
        } catch (error) {
            setIsCloudError(true)
        } finally {
            dispatch(setIsAppLoading(false))
            navigation.goBack()
        }
    }, [
        deviceToBackup?.rootAddress,
        deviceToBackup?.isBackedUpManual,
        deleteWallet,
        getWalletByRootAddress,
        locale,
        dispatch,
        setIsWalletBackedUp,
        setIsCloudError,
        navigation,
    ])

    return { handleConfirmDelete }
}
