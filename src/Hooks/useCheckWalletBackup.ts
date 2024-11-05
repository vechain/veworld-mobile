import { useMemo } from "react"
import { AccountWithDevice, DEVICE_TYPE } from "~Model"

export const useCheckWalletBackup = (account: AccountWithDevice) => {
    // check cache if user has already been asked for backup
    // check if device has been backed up
    // check if device type is local mnemonic
    // check if cloud is available?
    // const [isShowBackupModal, setIsShowBackupModal] = useState(false)

    return useMemo(() => {
        return (
            !account.device?.isBuckedUp &&
            !account.device?.isBackedUpOnCloud &&
            account.device?.type === DEVICE_TYPE.LOCAL_MNEMONIC
        )
    }, [account.device])
}
